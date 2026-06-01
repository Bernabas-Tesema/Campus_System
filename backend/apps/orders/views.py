from decimal import Decimal
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from patterns.repository import OrderRepository
from patterns.strategy import PaymentContext
from patterns.adapter import EXTERNAL_ADAPTERS
from patterns.observer import order_status_subject
from apps.foods.models import Food
from apps.lounges.models import Lounge
from apps.users.models import Student
from .models import Order, OrderItem, Payment
from .serializers import OrderSerializer, OrderCreateSerializer, OrderStatusSerializer
from .services import accept_order_by_lounge, calc_admin_commission, promote_due_orders


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer

    def list(self, request, *args, **kwargs):
        promote_due_orders()
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        repo = OrderRepository()
        if user.role == 'student':
            try:
                return repo.get_by_student(user.student_profile)
            except Student.DoesNotExist:
                return Order.objects.none()
        return repo.get_all()

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            student = request.user.student_profile
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_400_BAD_REQUEST)

        lounge = Lounge.objects.filter(pk=data['lounge_id'], is_active=True).first()
        if not lounge:
            return Response({'error': 'Lounge not found.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            order = Order.objects.create(
                student=student, lounge=lounge, notes=data.get('notes', ''),
            )
            total = Decimal('0')
            for item_data in data['items']:
                food = Food.objects.filter(
                    pk=item_data['food_id'],
                    is_available=True,
                    lounge=lounge,
                ).first()
                if not food:
                    return Response(
                        {'error': f'Food {item_data["food_id"]} not available.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                qty = item_data['quantity']
                subtotal = food.price * qty
                OrderItem.objects.create(
                    order=order, food=food, food_name=food.name,
                    quantity=qty, unit_price=food.price, subtotal=subtotal,
                )
                total += subtotal

            order.total_amount = total
            order.save()

            method = data.get('payment_method', 'cash')
            if method in EXTERNAL_ADAPTERS:
                payment_result = EXTERNAL_ADAPTERS[method]().process(total, order)
            else:
                payment_result = PaymentContext(method).execute(total, order)

            Payment.objects.create(
                order=order, method=method, amount=total,
                admin_commission=calc_admin_commission(total),
                transaction_id=payment_result.get('transaction_id', ''),
                is_paid=payment_result.get('success', False),
                paid_at=timezone.now() if payment_result.get('success') else None,
            )

            order_status_subject.notify(order, None, 'pending')

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Order.objects.filter(student__user=user)
        return Order.objects.all()


class OrderStatusUpdateView(APIView):
    def patch(self, request, pk):
        order = Order.objects.filter(pk=pk).first()
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.update_status(serializer.validated_data['status'])
        return Response(OrderSerializer(order).data)


class LoungeOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def list(self, request, *args, **kwargs):
        promote_due_orders()
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        lounge = user.managed_lounges.first()
        if not lounge:
            return Order.objects.none()
        if not lounge.is_active:
            raise PermissionDenied('Your lounge is not active yet.')
        repo = OrderRepository()
        status_filter = self.request.query_params.get('status')
        return repo.get_by_lounge(lounge, status=status_filter)


class LoungeOrderStatusView(APIView):
    def patch(self, request, pk):
        user = request.user
        lounge = user.managed_lounges.first()
        if not lounge:
            return Response({'error': 'No lounge assigned.'}, status=status.HTTP_403_FORBIDDEN)
        if not lounge.is_active:
            raise PermissionDenied('Your lounge is not active yet.')

        order = Order.objects.filter(pk=pk, lounge=lounge).first()
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        new_status = data['status']

        if new_status == 'accepted' and order.status == 'pending':
            accept_order_by_lounge(order)
        elif new_status == 'preparing' and order.status == 'pending':
            accept_order_by_lounge(order)
            order.refresh_from_db()
            order.update_status('preparing')
        else:
            order.update_status(new_status)

        return Response(OrderSerializer(order).data)


class AdminReportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Count, Sum
        from .services import ADMIN_COMMISSION_PERCENT

        total_orders = Order.objects.count()
        # All placed orders (cash/card/mobile) — not only is_paid online payments
        total_revenue = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        paid_revenue = Payment.objects.filter(is_paid=True).aggregate(Sum('amount'))['amount__sum'] or 0
        admin_commission = Payment.objects.aggregate(Sum('admin_commission'))['admin_commission__sum'] or 0
        status_breakdown = Order.objects.values('status').annotate(count=Count('id'))
        recent_orders = Order.objects.select_related('payment').order_by('-created_at')[:10]
        return Response({
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'paid_revenue': float(paid_revenue),
            'admin_commission': float(admin_commission),
            'commission_rate_percent': float(ADMIN_COMMISSION_PERCENT),
            'status_breakdown': list(status_breakdown),
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
            'total_students': Student.objects.count(),
            'total_lounges': Lounge.objects.filter(is_active=True).count(),
        })

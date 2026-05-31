from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from patterns.strategy import SearchContext
from patterns.repository import FoodRepository
from .models import Category, Food
from .serializers import CategorySerializer, FoodSerializer, FoodManageSerializer


class IsAdminOrLounge(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or getattr(user, 'role', None) == 'lounge')
        )


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrLounge()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        name = (request.data.get('name') or '').strip()
        if name:
            existing = Category.objects.filter(name__iexact=name).first()
            if existing:
                return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]


class FoodListView(generics.ListAPIView):
    serializer_class = FoodSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'lounge', 'meal_time']
    ordering_fields = ['price', 'name']

    def get_queryset(self):
        repo = FoodRepository()
        qs = repo.get_available()
        search = self.request.query_params.get('search', '')
        strategy = self.request.query_params.get('search_type', 'name')
        if search:
            qs = SearchContext(strategy).execute(qs, search)
        return qs


class FoodDetailView(generics.RetrieveAPIView):
    queryset = Food.objects.filter(is_available=True)
    serializer_class = FoodSerializer
    permission_classes = [permissions.AllowAny]


class FoodManageView(generics.ListCreateAPIView):
    serializer_class = FoodManageSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lounge':
            lounge = user.managed_lounges.first()
            if lounge and lounge.is_active:
                return Food.objects.filter(lounge=lounge)
            if lounge and not lounge.is_active:
                return Food.objects.none()
        return Food.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'lounge':
            lounge = user.managed_lounges.first()
            if lounge and not lounge.is_active:
                raise PermissionDenied('Your lounge is not active yet.')
            serializer.save(lounge=lounge)
        else:
            serializer.save()


class FoodManageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FoodManageSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lounge':
            lounge = user.managed_lounges.first()
            if lounge and lounge.is_active:
                return Food.objects.filter(lounge=lounge)
            if lounge and not lounge.is_active:
                return Food.objects.none()
        return Food.objects.all()

    def perform_destroy(self, instance):
        instance.is_available = False
        instance.save()

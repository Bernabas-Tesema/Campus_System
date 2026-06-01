from rest_framework import serializers
from .models import Order, OrderItem, Payment
from .services import calc_order_prep_minutes


class OrderItemSerializer(serializers.ModelSerializer):
    prep_time_minutes = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'food', 'food_name', 'quantity', 'unit_price', 'subtotal', 'prep_time_minutes',
        ]

    def get_prep_time_minutes(self, obj):
        if obj.food_id and obj.food:
            return obj.food.prep_time_minutes
        return 15


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'method', 'amount', 'admin_commission', 'transaction_id', 'is_paid', 'paid_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    lounge_name = serializers.CharField(source='lounge.name', read_only=True)
    estimated_prep_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_key', 'student', 'student_name', 'lounge', 'lounge_name',
            'status', 'total_amount', 'notes', 'prep_minutes', 'estimated_prep_minutes',
            'estimated_ready_at', 'items', 'payment', 'created_at', 'updated_at',
        ]
        read_only_fields = ['order_key', 'student', 'total_amount']

    def get_estimated_prep_minutes(self, obj):
        if obj.prep_minutes is not None:
            return obj.prep_minutes
        return calc_order_prep_minutes(obj)


class OrderCreateSerializer(serializers.Serializer):
    lounge_id = serializers.IntegerField()
    items = serializers.ListField(child=serializers.DictField(), min_length=1)
    payment_method = serializers.ChoiceField(
        choices=['cash', 'card', 'mobile', 'stripe', 'paypal'], default='cash'
    )
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_items(self, value):
        for item in value:
            if 'food_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError('Each item needs food_id and quantity.')
            if item['quantity'] < 1:
                raise serializers.ValidationError('Quantity must be at least 1.')
        return value


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'accepted', 'preparing', 'ready', 'completed', 'rejected', 'cancelled'
    ])

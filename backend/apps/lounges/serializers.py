from rest_framework import serializers
from .models import Lounge


class LoungeSerializer(serializers.ModelSerializer):
    food_count = serializers.SerializerMethodField()
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Lounge
        fields = [
            'id', 'name', 'location', 'description', 'is_active', 'prep_time_minutes',
            'open_time', 'close_time', 'food_count', 'staff_count', 'created_at',
        ]

    def get_food_count(self, obj):
        return obj.foods.filter(is_available=True).count()

    def get_staff_count(self, obj):
        return obj.staff.count()


class LoungeManageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lounge
        fields = '__all__'

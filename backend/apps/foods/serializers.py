from rest_framework import serializers
from .models import Category, Food


class CategorySerializer(serializers.ModelSerializer):
    food_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'food_count']

    def get_food_count(self, obj):
        return obj.foods.filter(is_available=True).count()


class FoodSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    lounge_name = serializers.CharField(source='lounge.name', read_only=True)

    class Meta:
        model = Food
        fields = [
            'id', 'name', 'description', 'price', 'meal_time', 'category', 'category_name',
            'lounge', 'lounge_name', 'image_url', 'is_available', 'prep_time_minutes',
        ]


class FoodManageSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    lounge = serializers.PrimaryKeyRelatedField(read_only=True)
    lounge_name = serializers.CharField(source='lounge.name', read_only=True)

    class Meta:
        model = Food
        fields = [
            'id', 'name', 'description', 'price', 'meal_time',
            'category', 'category_name',
            'lounge', 'lounge_name',
            'image_url', 'is_available', 'prep_time_minutes',
            'created_at', 'updated_at',
        ]

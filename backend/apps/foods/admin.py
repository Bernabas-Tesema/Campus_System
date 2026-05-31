from django.contrib import admin
from .models import Category, Food


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'lounge', 'is_available']
    list_filter = ['category', 'lounge', 'is_available']

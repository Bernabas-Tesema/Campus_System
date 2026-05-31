from django.urls import path
from .views import (
    CategoryListView, CategoryDetailView,
    FoodListView, FoodDetailView, FoodManageView, FoodManageDetailView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('foods/', FoodListView.as_view(), name='foods'),
    path('foods/<int:pk>/', FoodDetailView.as_view(), name='food-detail'),
    path('foods/manage/', FoodManageView.as_view(), name='foods-manage'),
    path('foods/manage/<int:pk>/', FoodManageDetailView.as_view(), name='food-manage-detail'),
]

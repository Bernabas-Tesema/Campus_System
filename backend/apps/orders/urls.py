from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView, OrderStatusUpdateView, AdminReportView,
)

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='orders'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/status/<int:pk>/', OrderStatusUpdateView.as_view(), name='order-status'),
    path('admin/reports/', AdminReportView.as_view(), name='admin-reports'),
]

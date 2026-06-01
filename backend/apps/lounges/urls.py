from django.urls import path
from .views import (
    LoungeListView,
    LoungeManageListView,
    LoungeManageDetailView,
    LoungeStaffProfileView,
)
from apps.orders.views import LoungeOrderListView, LoungeOrderStatusView

urlpatterns = [
    path('lounges/', LoungeListView.as_view(), name='lounges'),
    path('admin/lounges/', LoungeManageListView.as_view(), name='admin-lounges'),
    path('admin/lounges/<int:pk>/', LoungeManageDetailView.as_view(), name='admin-lounge-detail'),
    path('lounge/profile/', LoungeStaffProfileView.as_view(), name='lounge-profile'),
    path('lounge/orders/', LoungeOrderListView.as_view(), name='lounge-orders'),
    path('lounge/orders/<int:pk>/status/', LoungeOrderStatusView.as_view(), name='lounge-order-status'),
]

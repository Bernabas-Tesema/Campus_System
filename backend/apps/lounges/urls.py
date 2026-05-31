from django.urls import path
from .views import LoungeListView, LoungeManageListView, LoungeManageDetailView
from apps.orders.views import LoungeOrderListView, LoungeOrderStatusView

urlpatterns = [
    path('lounges/', LoungeListView.as_view(), name='lounges'),
    path('admin/lounges/', LoungeManageListView.as_view(), name='admin-lounges'),
    path('admin/lounges/<int:pk>/', LoungeManageDetailView.as_view(), name='admin-lounge-detail'),
    path('lounge/orders/', LoungeOrderListView.as_view(), name='lounge-orders'),
    path('lounge/orders/<int:pk>/status/', LoungeOrderStatusView.as_view(), name='lounge-order-status'),
]

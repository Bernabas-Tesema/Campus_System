from rest_framework import generics, permissions
from .models import Lounge
from .serializers import LoungeSerializer, LoungeManageSerializer


class LoungeListView(generics.ListAPIView):
    queryset = Lounge.objects.filter(is_active=True)
    serializer_class = LoungeSerializer
    permission_classes = [permissions.AllowAny]


class LoungeManageListView(generics.ListCreateAPIView):
    queryset = Lounge.objects.all()
    serializer_class = LoungeManageSerializer
    permission_classes = [permissions.IsAdminUser]


class LoungeManageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lounge.objects.all()
    serializer_class = LoungeManageSerializer
    permission_classes = [permissions.IsAdminUser]

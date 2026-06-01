from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
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


class LoungeStaffProfileView(APIView):
    """Lounge staff can update their own lounge (not admin-only endpoints)."""

    def get_lounge(self, user):
        if user.role != 'lounge':
            return None
        return user.managed_lounges.first()

    def get(self, request):
        lounge = self.get_lounge(request.user)
        if not lounge:
            return Response({'error': 'No lounge assigned.'}, status=404)
        return Response(LoungeManageSerializer(lounge).data)

    def patch(self, request):
        lounge = self.get_lounge(request.user)
        if not lounge:
            return Response({'error': 'No lounge assigned.'}, status=404)
        allowed = {'name', 'location', 'description'}
        data = {k: v for k, v in request.data.items() if k in allowed}
        serializer = LoungeManageSerializer(lounge, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

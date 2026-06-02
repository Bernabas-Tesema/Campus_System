from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, AdminUserSerializer
from .models import Student

from django.core.mail import get_connection, send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {'refresh': str(refresh), 'access': str(refresh.access_token)},
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh = RefreshToken(request.data.get('refresh'))
            refresh.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListCreateAPIView):
    serializer_class = AdminUserSerializer
    queryset = User.objects.all().order_by('-date_joined')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAdminUser()]
        return [permissions.IsAdminUser()]


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser]


class StudentListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role='student').select_related('student_profile')


class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        users = User.objects.filter(email__iexact=email)
        mail_timeout = int(getattr(settings, 'EMAIL_TIMEOUT', 5))
        mail_connection = get_connection(
            fail_silently=True,
            timeout=mail_timeout,
        )
        # Always return success to avoid leaking user existence
        for user in users:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend = getattr(settings, 'FRONTEND_URL', None) or f"{request.scheme}://{request.get_host()}"
            reset_link = f"{frontend.rstrip('/')}/reset-password?uid={uid}&token={token}"
            subject = 'Reset your Campus Eat password'
            message = f'Hello {user.get_full_name() or user.username},\n\n' \
                      f'You requested a password reset. Click the link below to reset your password:\n\n{reset_link}\n\n' \
                      'If you did not request this, you can safely ignore this email.'
            try:
                send_mail(
                    subject,
                    message,
                    getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    [user.email],
                    fail_silently=True,
                    connection=mail_connection,
                )
            except Exception:
                # don't fail the request if email sending fails
                pass

        return Response({'detail': 'If an account with that email exists, reset instructions have been sent.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid') or request.data.get('uidb64')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uidb64 or not token or not new_password:
            return Response({'detail': 'uid, token and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({'detail': 'Invalid uid.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password has been reset successfully.'})

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Student

User = get_user_model()


class StudentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'username', 'email', 'student_id', 'department']


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentSerializer(read_only=True)
    managed_lounges = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'student_profile', 'managed_lounges']
        read_only_fields = ['role']

    def get_managed_lounges(self, obj):
        lounges = getattr(obj, 'managed_lounges', None)
        if lounges is None:
            return []
        return list(lounges.values('id', 'name', 'location', 'is_active'))


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, default='')
    last_name = serializers.CharField(required=False, default='')
    student_id = serializers.CharField(required=False)
    department = serializers.CharField(required=False, default='General')
    role = serializers.ChoiceField(choices=['student', 'lounge'], default='student')
    lounge_id = serializers.IntegerField(required=False)
    lounge_name = serializers.CharField(required=False, allow_blank=True, default='')
    lounge_location = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        role = attrs.get('role', 'student')
        lounge_id = attrs.get('lounge_id')
        lounge_location = (attrs.get('lounge_location') or '').strip()
        lounge_name = (attrs.get('lounge_name') or '').strip()

        if role == 'lounge' and not lounge_id:
            if not lounge_location:
                raise serializers.ValidationError({'lounge_location': 'Location is required for lounge accounts.'})
            # Name is optional; will default to username if blank
            attrs['lounge_location'] = lounge_location
            attrs['lounge_name'] = lounge_name

        if role == 'lounge' and lounge_id:
            from apps.lounges.models import Lounge
            if not Lounge.objects.filter(pk=lounge_id).exists():
                raise serializers.ValidationError({'lounge_id': 'Selected lounge does not exist.'})
        return attrs

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def create(self, validated_data):
        from patterns.factory import UserFactory
        role = validated_data.pop('role', 'student')
        password = validated_data.pop('password')
        username = validated_data.pop('username')
        email = validated_data.pop('email')

        lounge_id = validated_data.pop('lounge_id', None)
        lounge_name = (validated_data.pop('lounge_name', '') or '').strip()
        lounge_location = (validated_data.pop('lounge_location', '') or '').strip()

        user = UserFactory.create_user(role, username, email, password, **validated_data)

        if role == 'lounge':
            from apps.lounges.models import Lounge

            # If lounge_id was provided (legacy/admin flow), attach user to that lounge.
            if lounge_id:
                lounge = Lounge.objects.filter(pk=lounge_id).first()
                if lounge:
                    lounge.staff.add(user)
                    return user

            # Self-register flow: create lounge as inactive; admin can activate later.
            lounge = Lounge.objects.create(
                name=lounge_name or username,
                location=lounge_location,
                description='',
                is_active=False,
            )
            lounge.staff.add(user)

        return user


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']

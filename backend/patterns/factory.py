"""Factory Pattern - User and Notification creation."""
from django.contrib.auth import get_user_model

User = get_user_model()


class UserFactory:
    @staticmethod
    def create_user(user_type, username, email, password, **extra):
        creators = {
            'student': UserFactory._create_student,
            'lounge': UserFactory._create_lounge,
            'admin': UserFactory._create_admin,
        }
        creator = creators.get(user_type)
        if not creator:
            raise ValueError(f'Unknown user type: {user_type}')
        return creator(username, email, password, **extra)

    @staticmethod
    def _create_student(username, email, password, **extra):
        user = User.objects.create_user(
            username=username, email=email, password=password, role='student',
            first_name=extra.get('first_name', ''), last_name=extra.get('last_name', ''),
        )
        from apps.users.models import Student
        Student.objects.create(
            user=user,
            student_id=extra.get('student_id', f'STU{user.id:05d}'),
            department=extra.get('department', 'General'),
        )
        return user

    @staticmethod
    def _create_lounge(username, email, password, **extra):
        user = User.objects.create_user(
            username=username, email=email, password=password, role='lounge',
            first_name=extra.get('first_name', ''), last_name=extra.get('last_name', ''),
        )
        lounge_id = extra.get('lounge_id')
        if lounge_id:
            from apps.lounges.models import Lounge
            lounge = Lounge.objects.filter(pk=lounge_id).first()
            if lounge:
                lounge.staff.add(user)

        return user

    @staticmethod
    def _create_admin(username, email, password, **extra):
        return User.objects.create_superuser(
            username=username, email=email, password=password, role='admin',
        )


class NotificationFactory:
    @staticmethod
    def create(notification_type, user, title, message, order=None):
        from apps.notifications.models import Notification
        return Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            order=order,
        )

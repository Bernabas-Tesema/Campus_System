from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

from apps.lounges.models import Lounge
from apps.foods.models import Category, Food
from patterns.factory import UserFactory

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed Campus Eat. By default creates only the admin account. Use --demo to seed sample lounges/foods/users.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--demo',
            action='store_true',
            help='Seed demo lounges, categories, foods, and sample users (student1/lounge1).',
        )

    def handle(self, *args, **options):
        demo = bool(options.get('demo'))

        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@campus.eat')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')

        if not User.objects.filter(username=admin_username).exists():
            UserFactory.create_user('admin', admin_username, admin_email, admin_password)
            self.stdout.write(self.style.SUCCESS(f'Admin user created: {admin_username}'))
        else:
            self.stdout.write(f'Admin user already exists: {admin_username}')

        if not demo:
            self.stdout.write('Demo seeding skipped (admin-only).')
            return

        if all(User.objects.filter(username=u).exists() for u in ['lounge1', 'student1']):
            self.stdout.write('Demo users already exist; ensuring lounges/foods/categories exist.')

        lounge_user = User.objects.filter(username='lounge1').first() or UserFactory.create_user(
            'lounge', 'lounge1', 'lounge@campus.eat', 'campus123',
            first_name='Maria', last_name='Kitchen',
        )

        User.objects.filter(username='student1').first() or UserFactory.create_user(
            'student', 'student1', 'student@campus.eat', 'campus123',
            first_name='John', last_name='Doe', student_id='STU2024001', department='Computer Science',
        )

        lounge, _ = Lounge.objects.get_or_create(
            name='Central Campus Cafe',
            defaults={
                'location': 'Building A, Ground Floor',
                'description': 'Main campus cafeteria serving fresh meals daily.',
                'open_time': '07:00',
                'close_time': '20:00',
            },
        )
        lounge.staff.add(lounge_user)

        lounge2, _ = Lounge.objects.get_or_create(
            name='Engineering Lounge',
            defaults={
                'location': 'Engineering Block, 2nd Floor',
                'description': 'Quick bites for engineering students.',
                'open_time': '08:00',
                'close_time': '18:00',
            },
        )

        categories = [
            ('Ayinate', '🍛'),
            ('Misir', '🥣'),
            ('Dinch', '🥔'),
            ('Shiro', '🍲'),
            ('Tibs', '🥩'),
            ('Drinks', '🥤'),
        ]
        cat_objs = {}
        for name, icon in categories:
            cat, _ = Category.objects.get_or_create(
                name=name,
                defaults={'icon': icon, 'description': f'{name} category'},
            )
            # Keep icon/description stable if re-run.
            if cat.icon != icon or cat.description != f'{name} category':
                cat.icon = icon
                cat.description = f'{name} category'
                cat.save(update_fields=['icon', 'description'])
            cat_objs[name] = cat

        foods = [
            ('Buna (Coffee)', 'Traditional Ethiopian coffee', 35.00, 'Drinks', lounge, 'breakfast'),
            ('Shai (Tea)', 'Hot spiced tea', 25.00, 'Drinks', lounge, 'breakfast'),
            ('Shiro (Beyaynet Style)', 'Thick chickpea stew served with injera', 90.00, 'Shiro', lounge, 'lunch'),
            ('Misir Wot', 'Red lentil stew with Ethiopian spices', 80.00, 'Misir', lounge, 'lunch'),
            ('Dinch Wot', 'Potato stew with mild spiced sauce', 75.00, 'Dinch', lounge, 'lunch'),
            ('Ayinate Combo', 'A mix of vegan stews on injera (beyaynet)', 140.00, 'Ayinate', lounge, 'lunch'),
            ('Siga Tibs', 'Sautéed beef with onions and peppers', 190.00, 'Tibs', lounge, 'dinner'),
            ('Misir + Shiro Combo', 'Two classic stews served together', 120.00, 'Ayinate', lounge, 'dinner'),
            ('Doro Tibs', 'Chicken tibs with Ethiopian spices', 200.00, 'Tibs', lounge2, 'dinner'),
            ('Ayinate (Engineering Special)', 'Hearty combo plate for busy days', 150.00, 'Ayinate', lounge2, 'lunch'),
        ]
        for name, desc, price, cat, lng, meal_time in foods:
            Food.objects.get_or_create(
                name=name,
                lounge=lng,
                defaults={
                    'description': desc,
                    'price': price,
                    'category': cat_objs[cat],
                    'meal_time': meal_time,
                },
            )

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully!'))

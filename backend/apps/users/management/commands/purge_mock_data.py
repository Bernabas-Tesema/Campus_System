from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from apps.foods.models import Category, Food
from apps.lounges.models import Lounge


User = get_user_model()


DEFAULT_MOCK_LOUNGES = [
    'Central Campus Cafe',
    'Engineering Lounge',
]

DEFAULT_MOCK_CATEGORIES = [
    'Burgers',
    'Pizza',
    'Drinks',
    'Salads',
    'Desserts',
    'Snacks',
]

DEFAULT_MOCK_USERS = [
    'student1',
    'lounge1',
]


class Command(BaseCommand):
    help = (
        'Remove the built-in/mock menu dataset from the database. '
        'By default targets known mock lounges/categories and their foods. '
        'Use --all to wipe all foods/categories/lounges.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Confirm deletion (required).',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Delete ALL foods, categories, and lounges (not just the known mock set).',
        )
        parser.add_argument(
            '--delete-mock-users',
            action='store_true',
            help='Also delete common mock users (student1/lounge1) if present.',
        )

    def handle(self, *args, **options):
        if not options.get('yes'):
            raise CommandError('Refusing to delete data without --yes')

        delete_all = bool(options.get('all'))
        delete_mock_users = bool(options.get('delete_mock_users'))

        if delete_all:
            foods_deleted = Food.objects.count()
            cats_deleted = Category.objects.count()
            lounges_deleted = Lounge.objects.count()

            Food.objects.all().delete()
            Category.objects.all().delete()
            Lounge.objects.all().delete()

            self.stdout.write(self.style.SUCCESS(
                f'Deleted ALL menu data: {foods_deleted} foods, {cats_deleted} categories, {lounges_deleted} lounges.'
            ))
        else:
            mock_lounges = Lounge.objects.filter(name__in=DEFAULT_MOCK_LOUNGES)
            mock_categories = Category.objects.filter(name__in=DEFAULT_MOCK_CATEGORIES)

            foods_qs = Food.objects.filter(lounge__in=mock_lounges) | Food.objects.filter(category__in=mock_categories)
            food_ids = list(foods_qs.values_list('id', flat=True).distinct())
            foods_deleted = len(food_ids)
            cats_deleted = mock_categories.count()
            lounges_deleted = mock_lounges.count()

            if food_ids:
                Food.objects.filter(id__in=food_ids).delete()
            mock_categories.delete()
            mock_lounges.delete()

            self.stdout.write(self.style.SUCCESS(
                f'Deleted mock menu data: {foods_deleted} foods, {cats_deleted} categories, {lounges_deleted} lounges.'
            ))

        if delete_mock_users:
            users_deleted, _ = User.objects.filter(username__in=DEFAULT_MOCK_USERS).delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {users_deleted} mock users.'))

"""Repository Pattern - Data access abstraction."""
from abc import ABC, abstractmethod


class BaseRepository(ABC):
    model = None

    def get_all(self):
        return self.model.objects.all()

    def get_by_id(self, pk):
        return self.model.objects.filter(pk=pk).first()

    def create(self, **kwargs):
        return self.model.objects.create(**kwargs)

    def update(self, instance, **kwargs):
        for k, v in kwargs.items():
            setattr(instance, k, v)
        instance.save()
        return instance


class OrderRepository(BaseRepository):
    def __init__(self):
        from apps.orders.models import Order
        self.model = Order

    def get_by_key(self, order_key):
        return self.model.objects.filter(order_key=order_key).first()

    def get_by_student(self, student):
        return self.model.objects.filter(student=student).order_by('-created_at')

    def get_by_lounge(self, lounge, status=None):
        qs = self.model.objects.filter(lounge=lounge)
        if status:
            qs = qs.filter(status=status)
        return qs.order_by('-created_at')


class FoodRepository(BaseRepository):
    def __init__(self):
        from apps.foods.models import Food
        self.model = Food

    def get_available(self):
        return self.model.objects.filter(is_available=True).select_related('category', 'lounge')

    def get_by_lounge(self, lounge):
        return self.model.objects.filter(lounge=lounge, is_available=True)

import uuid
from django.db import models
from django.db import IntegrityError, transaction
from django.conf import settings


def generate_order_key():
    # Short human-friendly pickup key; 10 hex chars makes collisions astronomically unlikely.
    return f'CE-{uuid.uuid4().hex[:10].upper()}'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for Pickup'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    order_key = models.CharField(max_length=20, unique=True, default=generate_order_key)
    student = models.ForeignKey('users.Student', on_delete=models.CASCADE, related_name='orders')
    lounge = models.ForeignKey('lounges.Lounge', on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    estimated_ready_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'Order {self.order_key}'

    def save(self, *args, **kwargs):
        # Ensure every order has a unique pickup key even under concurrent creates.
        if not self.order_key:
            self.order_key = generate_order_key()

        if self.pk is not None:
            return super().save(*args, **kwargs)

        for _ in range(5):
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError:
                # Very rare: regenerate key if we collided with an existing order_key.
                self.order_key = generate_order_key()

        # Last attempt: let the error surface for visibility.
        return super().save(*args, **kwargs)

    def update_status(self, new_status):
        old_status = self.status
        self.status = new_status
        self.save()
        from patterns.observer import order_status_subject
        order_status_subject.notify(self, old_status, new_status)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    food = models.ForeignKey('foods.Food', on_delete=models.SET_NULL, null=True)
    food_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f'{self.food_name} x{self.quantity}'


class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('mobile', 'Mobile'),
        ('stripe', 'Stripe'),
        ('paypal', 'PayPal'),
    ]
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, blank=True)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'

    def __str__(self):
        return f'Payment for {self.order.order_key}'

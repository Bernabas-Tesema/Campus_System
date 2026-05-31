from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, default='🍽️')

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Food(models.Model):
    MEAL_TIME_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    meal_time = models.CharField(max_length=20, choices=MEAL_TIME_CHOICES, default='lunch')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='foods')
    lounge = models.ForeignKey('lounges.Lounge', on_delete=models.CASCADE, related_name='foods')
    image_url = models.URLField(blank=True)
    is_available = models.BooleanField(default=True)
    prep_time_minutes = models.PositiveIntegerField(default=15)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'foods'

    def __str__(self):
        return self.name

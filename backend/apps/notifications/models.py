from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ('order_status', 'Order Status'),
        ('order_placed', 'Order Placed'),
        ('order_ready', 'Order Ready'),
        ('system', 'System'),
    ]
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=200)
    message = models.TextField()
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

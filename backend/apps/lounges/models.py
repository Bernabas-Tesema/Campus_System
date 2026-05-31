from django.db import models


class Lounge(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    staff = models.ManyToManyField('users.User', related_name='managed_lounges', blank=True)
    is_active = models.BooleanField(default=True)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lounges'

    def __str__(self):
        return self.name

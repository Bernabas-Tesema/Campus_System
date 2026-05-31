from django.contrib import admin
from .models import Lounge


@admin.register(Lounge)
class LoungeAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'is_active']
    filter_horizontal = ['staff']

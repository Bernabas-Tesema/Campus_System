from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone

from .models import Order

ADMIN_COMMISSION_RATE = Decimal('0.015')
ADMIN_COMMISSION_PERCENT = Decimal('1.5')
MIN_PREP_MINUTES = 1
MAX_PREP_MINUTES = 180
STATUSES_BEFORE_READY = ('accepted', 'preparing')
DEFAULT_PREP_MINUTES = 15


def calc_admin_commission(order_total):
    """Platform fee: 1.5% of each order total."""
    total = Decimal(str(order_total))
    return (total * ADMIN_COMMISSION_RATE).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def normalize_prep_minutes(value):
    try:
        mins = int(value)
    except (TypeError, ValueError):
        mins = DEFAULT_PREP_MINUTES
    return max(MIN_PREP_MINUTES, min(MAX_PREP_MINUTES, mins))


def calc_order_prep_minutes(order):
    """
    Prep time from foods in the order (longest item wins — parallel kitchen prep).
    Each food's prep_time_minutes is set when the lounge adds the food.
    """
    items = order.items.select_related('food').all()
    if not items:
        return DEFAULT_PREP_MINUTES

    max_prep = 0
    for item in items:
        if item.food_id and item.food:
            max_prep = max(max_prep, item.food.prep_time_minutes)
        else:
            max_prep = max(max_prep, DEFAULT_PREP_MINUTES)

    return normalize_prep_minutes(max_prep or DEFAULT_PREP_MINUTES)


def accept_order_by_lounge(order):
    """Lounge accepts order; ETA from food prep times on order items."""
    mins = calc_order_prep_minutes(order)
    old_status = order.status
    order.status = 'accepted'
    order.prep_minutes = mins
    order.estimated_ready_at = timezone.now() + timedelta(minutes=mins)
    order.save(update_fields=['status', 'prep_minutes', 'estimated_ready_at', 'updated_at'])

    if old_status != 'accepted':
        from patterns.observer import order_status_subject
        order_status_subject.notify(order, old_status, 'accepted')
    return order


def promote_due_orders():
    """Mark orders as ready when lounge prep time (estimated_ready_at) has passed."""
    due = Order.objects.filter(
        status__in=STATUSES_BEFORE_READY,
        estimated_ready_at__isnull=False,
        estimated_ready_at__lte=timezone.now(),
    )
    count = 0
    for order in due.select_related('student__user', 'lounge'):
        order.update_status('ready')
        count += 1
    return count

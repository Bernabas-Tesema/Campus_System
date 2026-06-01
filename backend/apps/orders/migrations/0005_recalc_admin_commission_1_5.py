from decimal import Decimal, ROUND_HALF_UP

from django.db import migrations

RATE = Decimal('0.015')


def recalc_commission(apps, schema_editor):
    Payment = apps.get_model('orders', 'Payment')
    for payment in Payment.objects.all().iterator():
        amount = Decimal(str(payment.amount))
        payment.admin_commission = (amount * RATE).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        payment.save(update_fields=['admin_commission'])


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_order_prep_minutes'),
    ]

    operations = [
        migrations.RunPython(recalc_commission, migrations.RunPython.noop),
    ]

from decimal import Decimal, ROUND_HALF_UP

from django.db import migrations, models


def backfill_commission(apps, schema_editor):
    Payment = apps.get_model('orders', 'Payment')
    rate = Decimal('0.02')
    for payment in Payment.objects.all().iterator():
        commission = (Decimal(str(payment.amount)) * rate).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP,
        )
        payment.admin_commission = commission
        payment.save(update_fields=['admin_commission'])


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='admin_commission',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text='Platform fee (2% of order total) retained by admin.',
                max_digits=10,
            ),
        ),
        migrations.RunPython(backfill_commission, migrations.RunPython.noop),
    ]

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_payment_admin_commission'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='prep_minutes',
            field=models.PositiveIntegerField(
                blank=True,
                help_text='Prep time set by lounge when order is accepted.',
                null=True,
            ),
        ),
    ]

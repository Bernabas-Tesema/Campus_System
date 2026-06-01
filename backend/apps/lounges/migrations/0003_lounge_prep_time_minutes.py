from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lounges', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='lounge',
            name='prep_time_minutes',
            field=models.PositiveIntegerField(
                default=15,
                help_text='Default minutes to prepare an order after acceptance.',
            ),
        ),
    ]

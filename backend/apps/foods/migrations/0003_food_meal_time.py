from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('foods', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='food',
            name='meal_time',
            field=models.CharField(
                choices=[('breakfast', 'Breakfast'), ('lunch', 'Lunch'), ('dinner', 'Dinner')],
                default='lunch',
                max_length=20,
            ),
        ),
    ]

from django.db import models

# Create your models here.
class App(models.Model):
    id = models.TextField(primary_key=True,max_length=50)
    name = models.TextField(max_length=255)
    description = models.TextField()
    flow_id = models.TextField(max_length=50)
    input_info = models.TextField()
    source = models.TextField(max_length=50)
    user_id = models.TextField(max_length=50)
    create_time = models.IntegerField()
    update_time = models.IntegerField()

    class Meta:
        db_table = 'app'

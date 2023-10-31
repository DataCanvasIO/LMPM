from django.db import models

# Create your models here.
class Model(models.Model):
    id = models.TextField(primary_key=True,max_length=50)
    name = models.TextField(max_length=255)
    description = models.TextField()
    config = models.TextField()
    params = models.TextField()
    source = models.TextField(max_length=50)
    enable_stream = models.BooleanField()
    is_default = models.BooleanField()
    user_id = models.TextField(max_length=50)
    create_time = models.IntegerField()
    update_time = models.IntegerField()

    class Meta:
        db_table = 'model'
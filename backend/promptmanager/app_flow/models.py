from django.db import models


# Create your models here.
class Flow(models.Model):
    id = models.TextField(max_length=50, primary_key=True)
    name = models.TextField(max_length=255)
    description = models.TextField()
    config = models.TextField()
    model_ids = models.TextField()
    params = models.TextField()
    source = models.TextField(max_length=50)
    prompt_count = models.IntegerField()
    create_time = models.IntegerField()
    update_time = models.IntegerField()
    user_id = models.TextField()


    class Meta:
        db_table = 'flow'


class Module(models.Model):
    id = models.TextField(max_length=50, primary_key=True)
    name = models.TextField(max_length=255)
    description = models.TextField()
    source = models.TextField(max_length=50)
    type = models.TextField(max_length=50)
    group = models.TextField(max_length=50)
    params = models.TextField()
    inputs = models.TextField()
    outputs = models.TextField()
    create_time = models.IntegerField()
    update_time = models.IntegerField()
    user_id = models.TextField()

    class Meta:
        db_table = 'module'

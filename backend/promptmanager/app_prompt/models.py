from django.db import models

# Create your models here.
class Category(models.Model):
    id = models.TextField(max_length=50, primary_key=True)
    name = models.TextField(max_length=255)
    source = models.TextField(max_length=50)
    role_prompt = models.TextField(max_length=50)
    type = models.TextField(max_length=30)
    create_time = models.IntegerField()
    update_time = models.IntegerField()
    order_id = models.IntegerField()
    user_id = models.TextField()

    class Meta:
        db_table = 'class'

class Prompt(models.Model):
    id = models.TextField(max_length=50, primary_key=True)
    name = models.TextField(max_length=255)
    note = models.TextField(max_length=50, blank=True)
    prompt = models.TextField(max_length=50, blank=True)
    source = models.TextField(max_length=50)
    role_id = models.TextField(max_length=50)
    scene_id = models.TextField(max_length=50)
    labels_ids = models.TextField()
    variables = models.TextField()
    collecte_status = models.TextField(max_length=30)
    create_time = models.IntegerField()
    update_time = models.IntegerField()
    user_id = models.TextField()
    score = models.FloatField()

    class Meta:
        db_table = 'prompt'

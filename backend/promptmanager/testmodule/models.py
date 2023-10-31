from django.db import models


# Create your models here.
class UserInfo(models.Model):
    id = models.IntegerField(primary_key=True)
    username = models.CharField(max_length=30)
    password = models.CharField(max_length=30)
    create_time = models.DateField(default=None)
    last_update_time = models.DateField(default=None)

    def __str__(self):
        return str(self.id) + "_" + self.username + "_" + self.password


class TestCity(models.Model):
    id = models.IntegerField
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'testcity'

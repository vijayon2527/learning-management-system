from django.db import models

class CourseQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

class CourseManager(models.Manager):
    def get_queryset(self):
        return CourseQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

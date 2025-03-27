from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField


class UserProfile(AbstractUser):
    fcm_token = models.CharField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=128, default="defaultpassword")
    email = models.EmailField(unique=True, blank=False, null=False)

    def __str__(self):
        return self.username



class LostFoundItem(models.Model):
    CATEGORY_CHOICES = [
        ('lost', 'Lost'),
        ('found', 'Found'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="lostfound_items",
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=255)
    image = CloudinaryField('image', blank=True, null=True)
    contact_email = models.EmailField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["category", "location"])]

    def __str__(self):
        return f"{self.title} ({self.get_category_display()}) - {self.location}"


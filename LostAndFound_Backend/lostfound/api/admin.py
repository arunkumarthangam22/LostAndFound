from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserProfile, LostFoundItem

@admin.register(UserProfile)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "is_staff", "is_active")
    search_fields = ("username", "email")
    list_filter = ("is_staff", "is_active")
    ordering = ("-date_joined",)

@admin.register(LostFoundItem)
class LostFoundItemAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "location", "created_at", "is_deleted")
    search_fields = ("title", "location")
    list_filter = ("category", "is_deleted")
    ordering = ("-created_at",)



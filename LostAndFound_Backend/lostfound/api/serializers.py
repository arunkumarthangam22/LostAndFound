from django.contrib.auth import get_user_model
from rest_framework import serializers
import cloudinary.uploader
import logging
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from api.models import UserProfile

from .models import LostFoundItem
from .utils import send_item_found_notification

logger = logging.getLogger(__name__)

CustomUser = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {'required': True},
        }

    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)"""
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()  # Normalize email to lowercase

    def validate(self, data):
        """Ensure username uniqueness (case-insensitive)"""
        if CustomUser.objects.filter(username__iexact=data['username']).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})
        return data

    def create(self, validated_data):
        """Hash password before saving user"""
        return CustomUser.objects.create_user(**validated_data)


class LostFoundItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = LostFoundItem
        exclude = ["user"]

    def get_image_url(self, obj):
        """Correctly return image URL from CloudinaryResource"""
        if obj.image:
            # Convert CloudinaryResource to URL if needed
            if hasattr(obj.image, "url"):
                return obj.image.url
            else:
                # Fallback to secure_url if available
                return str(obj.image) if obj.image else None
        return None

    def to_representation(self, instance):
        """Override to include corrected image URL in response"""
        representation = super().to_representation(instance)
        representation["image"] = self.get_image_url(instance)  # Add correct image URL
        return representation

    def create(self, validated_data):
        """Handles creating a lost/found item with optional image upload"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user

        image = validated_data.pop("image", None)
        item = LostFoundItem.objects.create(**validated_data)

        if image:
            self.upload_image_to_cloudinary(item, image)

        return item

    def update(self, instance, validated_data):
        """Handles updating an existing lost item, including optional image updates."""
        old_category = instance.category
        new_category = validated_data.get("category", old_category)

        # Check if category changes from 'lost' to 'found' -> Send notification
        if old_category.lower() == "lost" and new_category.lower() == "found":
            logger.info(f"Item '{instance.title}' marked as found. Sending email...")
            send_item_found_notification(instance)  # Trigger email
            
        # Check if category changes from 'lost' to 'found' -> Send notification
        if "image" in validated_data:
            image = validated_data.pop("image")
            self.upload_image_to_cloudinary(instance, image)

        # Update remaining fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def upload_image_to_cloudinary(self, item, image):
        """ Upload image to Cloudinary and store the URL"""
        try:
            logger.info("Uploading image to Cloudinary...")
            upload_result = cloudinary.uploader.upload(image, resource_type="image")
            secure_url = upload_result.get("secure_url")

            if secure_url:
                item.image = secure_url
                item.save()
                logger.info(f"Cloudinary Upload Success: {item.image}")
        except Exception as e:
            logger.error(f" Cloudinary Upload Failed: {str(e)}")
            raise serializers.ValidationError({"image": f"Image upload failed: {str(e)}"})

    

class ContactReporterSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    mail = serializers.EmailField()
    message = serializers.CharField(max_length=1000, min_length=10)

    def validate_item_id(self, value):
        """Ensure the LostFoundItem exists before proceeding"""
        if not LostFoundItem.objects.filter(id=value, is_deleted=False).exists():
            raise serializers.ValidationError("Item does not exist or is deleted.")
        return value


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        access_token = data.get("access")
        if not access_token:
            raise serializers.ValidationError("No access token returned!")

        decoded_payload = AccessToken(access_token)
        user_id = decoded_payload.get("user_id")

        try:
            profile = UserProfile.objects.get(user_id=user_id)
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError(" User profile not found!")

        return data

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data.update({
            "user": {
                "id": self.user.id,
                "username": self.user.username,
                "email": self.user.email,
                
            }
        })
        return data


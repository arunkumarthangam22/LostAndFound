from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, pagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from api.utils import send_item_found_notification
from .models import LostFoundItem
from .models import LostFoundItem
from .serializers import LostFoundItemSerializer, RegisterSerializer, CustomUserSerializer, ContactReporterSerializer
import logging
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import ssl
import smtplib
from email.message import EmailMessage



logger = logging.getLogger(__name__)
CustomUser = get_user_model()  


class StandardResultsPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """ Return user info in token response"""

    def validate(self, attrs):
        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
        }
        return data



class CustomTokenObtainPairView(TokenObtainPairView):
    """Override TokenObtainPairView to include FCM token handling."""
    serializer_class = CustomTokenObtainPairSerializer 

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        fcm_token = request.data.get("fcm_token")
        if fcm_token and response.status_code == 200:
            user = CustomUser.objects.get(username=request.data.get("username"))
            user.fcm_token = fcm_token
            user.save()
            response.data["message"] = "Login successful & FCM token stored!"
        
        return response



class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = get_object_or_404(CustomUser, username=request.data.get("username"))
        response.data.update({
            "message": "Registration successful!",
            "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        })
        return response



class LostFoundItemListCreateView(generics.ListCreateAPIView):
    queryset = LostFoundItem.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = LostFoundItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        """Pass request context to serializer to handle user automatically"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save()


 
class LostFoundItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LostFoundItem.objects.filter(is_deleted=False)
    serializer_class = LostFoundItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return LostFoundItem.objects.filter(is_deleted=False)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user != instance.user:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.save()
        return Response({"message": "Item deleted (soft delete) successfully!"}, status=status.HTTP_200_OK)

    


class ContactReporterView(APIView):
    serializer_class = ContactReporterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = json.loads(request.body)
        mail = data['mail']
        subject = "🔔 Important Update: Regarding Your Report"
        
        # Enhanced Email Content
        message_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; margin: 0; padding: 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4" style="padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="10" bgcolor="#ffffff" style="border: 1px solid #dddddd; border-radius: 8px;">
                            <tr>
                                <td align="center" bgcolor="#4CAF50" style="padding: 15px 0;">
                                    <h2 style="color: #ffffff; margin: 0;">Lost & Found - Notification</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px; text-align: left;">
                                    <p style="font-size: 16px; margin-top: 0;">Dear User,</p>
                                    <p style="font-size: 14px; color: #333333;">
                                        {data['message']}
                                    </p>
                                    <p style="font-size: 14px; color: #333333;">
                                        If you have any questions, please feel free to contact our support team.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" bgcolor="#f4f4f4" style="padding: 10px;">
                                    <p style="font-size: 12px; color: #777777; margin: 0;">
                                        &copy; 2025 Lost & Found Platform. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        objmail = EmailMessage()
        objmail["from"] = os.getenv("EMAIL_HOST_USER")
        objmail["to"] = mail
        objmail["subject"] = subject
        objmail.set_content("This is a plain text fallback for email clients that do not support HTML.")
        objmail.add_alternative(message_content, subtype='html')

        context = ssl.create_default_context()

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as all:
            all.login(os.getenv("EMAIL_HOST_USER"), os.getenv("EMAIL_HOST_PASSWORD"))
            all.sendmail(
                os.getenv("EMAIL_HOST_USER"), mail, objmail.as_string()
            )

        return Response({"message": "Email sent successfully!"})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    user = request.user
    user_serializer = CustomUserSerializer(user)

    user_items = LostFoundItem.objects.filter(user=user, is_deleted=False).select_related("user").order_by('-created_at')

    return Response({
        "user": user_serializer.data,
        "posted_items": LostFoundItemSerializer(user_items, many=True).data,
    })



@api_view(["PUT", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def update_reported_item(request, item_id):
    item = get_object_or_404(LostFoundItem, id=item_id, user=request.user, is_deleted=False)

    if request.method == "DELETE":
        item.is_deleted = True
        item.save()
        return Response({"message": " Item deleted (soft delete) successfully!"}, status=status.HTTP_200_OK)

    previous_status = item.category
    serializer = LostFoundItemSerializer(item, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()

        # Check if item is marked as "found" and notify users
        if previous_status == "Lost" and serializer.validated_data.get("category") == "Found":
            send_item_found_notification(item)

        return Response({"message": "Item updated successfully!", "data": serializer.data}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """ Logout User Without Blacklisting"""
    return Response({"message": "Logout successful!"}, status=status.HTTP_200_OK)




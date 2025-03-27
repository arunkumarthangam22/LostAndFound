from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import (
    RegisterView, user_profile, logout_view,
    LostFoundItemListCreateView, LostFoundItemDetailView, update_reported_item,
    ContactReporterView,CustomTokenObtainPairView
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),  
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"), 
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  
    path("auth/logout/", logout_view, name="logout"),  

    path("user/profile/", user_profile, name="user-profile"), 

    path("items/", LostFoundItemListCreateView.as_view(), name="item-list-create"), 
    path("items/<int:pk>/", LostFoundItemDetailView.as_view(), name="item-detail"),  
    path("items/<int:item_id>/update-delete/", update_reported_item, name="update-delete-reported-item"), 

    path("contact-reporter/", ContactReporterView.as_view(), name="contact-reporter"), 


]

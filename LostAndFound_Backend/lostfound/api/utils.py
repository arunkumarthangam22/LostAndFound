from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

def send_item_found_notification(item):
    """Send Email Notification to All Users When Item is Marked as Found."""
    subject = f"🎉 Item Found: {item.title}"
    message = f"""
    Hello,

    Good news! The item '{item.title}' that was previously reported as lost has now been marked as FOUND!

    📍 Location: {item.location}
    📝 Description: {item.description}

    Visit the Lost & Found platform to see more details.

    Regards,
    Lost & Found Team
    """

    #  Use get_user_model() instead of importing CustomUser
    CustomUser = get_user_model()
    recipient_list = list(CustomUser.objects.values_list("email", flat=True))

    # Send email only if users exist
    if recipient_list:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            fail_silently=False,  # Set to False to log errors during sending
        )
        print(f"Email sent to {len(recipient_list)} users about found item: {item.title}")
    else:
        print(" No users to send the email notification.")

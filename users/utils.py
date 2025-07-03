from django.core.mail import send_mail

def send_otp_email(email, otp_code):
    print(f"OTP for {email}: {otp_code}")  
    send_mail(
        'Your OTP Code',
        f'Your OTP code is {otp_code}',
        'noreply@example.com',
        [email],
        fail_silently=False
    )

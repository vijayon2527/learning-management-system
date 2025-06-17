from datetime import datetime
from .send_email import send_email
from .send_sms import send_sms
import secrets
import hashlib

SESSION_REGISTRATION_KEY = 'registration'
SESSION_TIMESTAMP_KEY = 'session_timestamp'
SESSION_PASSWORD_KEY = 'password'
SESSION_EXPIRY_DURATION_SECONDS = 60

def set_registration_session(request, otp, identifier, user_type, password):
    encrypted_otp = hashlib.sha256(otp.encode()).hexdigest()
    request.session[SESSION_REGISTRATION_KEY] = {
        'otp': encrypted_otp,
        'identifier': identifier,
        'user_type': user_type,
        'password': password,
        'session_timestamp': datetime.now().isoformat()
    }
    request.session.set_expiry(SESSION_EXPIRY_DURATION_SECONDS)

def generate_otp():
    return str(secrets.randbelow(1000000)).zfill(6)

def send_otp_to_mobile(mobile_number, otp):
    send_sms(mobile_number, otp)

def send_otp_to_email(email, otp):
    send_email(email, otp)

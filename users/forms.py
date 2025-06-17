from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from users.models import User
import re
from django.utils import timezone

class UserRegistrationForm(UserCreationForm):
    contact = forms.CharField(
        label='Mobile Number',
        help_text='Enter a valid 10-digit mobile number',
        max_length=255,
        widget=forms.TextInput(attrs={'placeholder': 'Mobile Number'}),
        required=True,
    )

    user_type = forms.ChoiceField(
        choices=[
            ('', 'Select your user type'),
            (User.EMPLOYER, 'Employer'),
            (User.APPLICANT_USER, 'Applicant')
        ],
        label='User Type',
        widget=forms.Select(attrs={'class': 'form-select'}),
        required=True,
        help_text='Please select the type of user you are.'
    )

    class Meta:
        model = User
        fields = ['user_type', 'contact', 'password1', 'password2']

    def clean_contact(self):
        contact = self.cleaned_data.get('contact')

        # Regex patterns for validation
        email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        mobile_pattern = r'^\d{10}$'

        if re.match(email_pattern, contact):
            if User.objects.filter(email=contact).exists():
                raise forms.ValidationError("An account with this email address already exists.")
            self.cleaned_data['email'] = contact 
        elif re.match(mobile_pattern, contact):
            if User.objects.filter(mobile=contact).exists():
                raise forms.ValidationError("An account with this mobile number already exists.")
            self.cleaned_data['mobile'] = contact
        else:
            raise forms.ValidationError("Please enter a valid email address or a 10-digit mobile number.")
        
        return contact

# class UserRegistrationForm(forms.ModelForm):
#     mobile = forms.CharField(
#         label='Mobile Number or Email',
#         help_text='Enter a valid 10-digit mobile number',
#         max_length=255,
#         widget=forms.TextInput(attrs={'placeholder': 'Mobile Number or Email'}),
#         required=True,
#     )
    
#     first_name = forms.CharField(
#         label='First Name',
#         max_length=30,
#         widget=forms.TextInput(attrs={'placeholder': 'First Name'}),
#         required=True,
#     )

#     last_name = forms.CharField(
#         label='Last Name',
#         max_length=30,
#         widget=forms.TextInput(attrs={'placeholder': 'Last Name'}),
#         required=True,
#     )

#     date_of_birth = forms.DateField(
#         label='Date of Birth',
#         widget=forms.DateInput(attrs={'type': 'date'}),
#         required=True,
#     )

#     address_line_1 = forms.CharField(
#         label='Address Line 1',
#         max_length=255,
#         widget=forms.TextInput(attrs={'placeholder': 'Address Line 1'}),
#         required=True,
#     )

#     city = forms.CharField(
#         label='City',
#         max_length=100,
#         widget=forms.TextInput(attrs={'placeholder': 'City'}),
#         required=True,
#     )

#     state = forms.ChoiceField(
#     label='State',
#     choices=[('', 'Select State')] + list(User.STATE_CHOICES),
#     widget=forms.Select(attrs={'class': 'form-control'}),
#     required=True,
#     )
    
#     postal_code = forms.CharField(
#         label='Postal Code',
#         max_length=6,
#         widget=forms.TextInput(attrs={'placeholder': 'Postal Code'}),
#         required=True,
#     )

#     resume = forms.FileField(
#         label='Resume',
#         required=True,
#     )

#     password1 = forms.CharField(
#         label='Password',
#         widget=forms.PasswordInput(attrs={'placeholder': 'Password'}),
#         required=True,
#     )

#     password2 = forms.CharField(
#         label='Confirm Password',
#         widget=forms.PasswordInput(attrs={'placeholder': 'Confirm Password'}),
#         required=True,
#     )

#     class Meta:
#         model = User
#         fields = [
#             'mobile','first_name', 'last_name', 'date_of_birth', 
#             'address_line_1', 'city', 
#             'state', 'postal_code', 
#              'password1', 'password2'
#         ]

#     def clean_mobile(self):
#         mobile = self.cleaned_data.get('mobile')
#         mobile_pattern = r'^\d{10}$'

#         if re.match(mobile_pattern, mobile):
#             # Check for mobile uniqueness
#             if User.objects.filter(mobile=mobile).exists():
#                 raise forms.ValidationError("An account with this mobile number already exists.")
#             return mobile

#     def clean_first_name(self):
#         first_name = self.cleaned_data.get('first_name')
#         if first_name=="":
#             raise forms.ValidationError("Please write your first name")
#         return first_name

#     def clean_last_name(self):
#         last_name = self.cleaned_data.get('last_name')
#         if last_name=="":
#             raise forms.ValidationError("Please write your last name")
#         return last_name

#     def clean_date_of_birth(self):
#         date_of_birth = self.cleaned_data.get('date_of_birth')
#         if not date_of_birth:
#             raise forms.ValidationError("Please select your date of birth")
#         return date_of_birth

#     def clean_address_line_1(self):
#         address_line_1 = self.cleaned_data.get('address_line_1')
#         if len(address_line_1.strip()) == 0:
#             raise forms.ValidationError("Address line 1 cannot be empty.")
#         return address_line_1

#     def clean_city(self):
#         city = self.cleaned_data.get('city')
#         if len(city.strip()) == 0:
#             raise forms.ValidationError("City cannot be empty.")
#         return city

#     def clean_state(self):
#         state = self.cleaned_data.get('state')
#         if len(state.strip()) == 0:
#             raise forms.ValidationError("State cannot be empty.")
#         return state

#     def clean_postal_code(self):
#         postal_code = self.cleaned_data.get('postal_code')

#         # Ensure postal code is exactly 6 digits
#         if not re.match(r'^\d{6}$', postal_code):
#             raise forms.ValidationError("Postal code must be exactly 6 digits.")
        
#         return postal_code

#     def clean_resume(self):
#         resume = self.cleaned_data.get('resume')
#         # Validate file type and size if needed
#         if resume.size > 2 * 1024 * 1024:  # Limit to 2MB
#             raise forms.ValidationError("Resume file size must be under 2MB.")
#         if not resume.name.endswith('.pdf') and not resume.name.endswith('.docx'):
#             raise forms.ValidationError("Resume must be a PDF or DOCX file.")
#         return resume

#     def clean(self):
#         cleaned_data = super().clean()

#         # Validate passwords
#         password1 = cleaned_data.get('password1')
#         password2 = cleaned_data.get('password2')

#         if password1 and password2 and password1 != password2:
#             raise forms.ValidationError("Passwords do not match.")
        
#         return cleaned_data

    
class OTPVerificationForm(forms.Form):
    otp_code = forms.CharField(
        max_length=6,
        label='OTP Code',
        widget=forms.TextInput(attrs={'placeholder': 'Enter OTP'})
    )


class LoginForm(AuthenticationForm):
    username = forms.CharField(
        max_length=10,
        widget=forms.TextInput(attrs={'placeholder': 'Enter your mobile number'}),
        label='Mobile',
        help_text='Please enter the mobile number you used to register.'
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Enter your password'}),
        label='Password',
        help_text='Enter the password you created during registration.'
    )

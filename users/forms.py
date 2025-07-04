from django import forms
from django.contrib.auth.forms import AuthenticationForm


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

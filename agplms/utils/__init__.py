from django.http import Http404

def allow_access_to(user_type):
    def decorator(func):
        def inner(request, *args, **kwargs):
            user = request.user
            if not user.is_authenticated:
                raise Http404
            if user.user_type == user_type:
                return func(request, *args, **kwargs)
            else:
                raise Http404
        return inner
    return decorator
                
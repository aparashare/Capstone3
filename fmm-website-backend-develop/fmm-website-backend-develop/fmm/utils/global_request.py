from threading import local

_active = local()
_active.request = None


def get_current_request():
    return _active.request


def get_current_user():
    """
    Returns current User
    return: User
    """
    req = get_current_request()
    if req and req.user and not req.user.is_anonymous:
        return req.user
    else:
        return None


class GlobalRequestMiddleware(object):

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        _active.request = request

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.
        _active.request = None

        return response

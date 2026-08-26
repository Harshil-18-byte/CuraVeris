from slowapi import Limiter
from slowapi.util import get_remote_address

# Global rate limiter instance keyed by client remote IP address
limiter = Limiter(key_func=get_remote_address)

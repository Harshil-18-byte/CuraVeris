"""Consistent public API errors without internal exception disclosure."""
from typing import Any, Optional

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.request_context import get_request_id


class CuraVerisError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details: Optional[Any] = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


def error_payload(code: str, message: str, details: Optional[Any] = None) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "error": {"code": code, "message": message},
        "request_id": get_request_id(),
    }
    if details is not None:
        payload["error"]["details"] = details
    return payload


async def curaveris_error_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, CuraVerisError):
        return JSONResponse(content=error_payload(exc.code, exc.message, exc.details), status_code=exc.status_code)
    return JSONResponse(content=error_payload("INTERNAL_SERVER_ERROR", "An internal error occurred."), status_code=500)


async def http_error_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, StarletteHTTPException):
        message = exc.detail if isinstance(exc.detail, str) else "Request could not be completed."
        return JSONResponse(content=error_payload("HTTP_ERROR", message), status_code=exc.status_code)
    return JSONResponse(content=error_payload("HTTP_ERROR", str(exc)), status_code=500)


async def validation_error_handler(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, RequestValidationError):
        return JSONResponse(content=error_payload("VALIDATION_ERROR", "Request validation failed.", exc.errors()), status_code=422)
    return JSONResponse(content=error_payload("VALIDATION_ERROR", "Request validation failed."), status_code=422)


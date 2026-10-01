from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.internal.models.banner import Banner
from app.internal.db.session import get_db
from app.internal.db.banner import get_banner_db, set_banner_db, delete_banner_db
from app.internal.token import authorize

router = APIRouter()

MAX_MESSAGE_LENGTH = 500
MAX_LINK_LENGTH = 255
ALLOWED_URL_PREFIXES = ("/", "http://", "https://")


def clean_banner(banner: Banner) -> Banner:
    """
    Normalizes whitespace and validates the incoming banner fields.

    Raises HTTPException(400) for an empty message, an over-long field,
    a half-specified link, or a link URL with a disallowed scheme.
    """
    message = banner.message.strip()
    link_text = (banner.link_text or "").strip() or None
    link_url = (banner.link_url or "").strip() or None

    if not message:
        raise HTTPException(status_code=400, detail="Banner message cannot be empty.")

    if len(message) > MAX_MESSAGE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Banner message must be {MAX_MESSAGE_LENGTH} characters or fewer.")

    if (link_text is None) != (link_url is None):
        raise HTTPException(
            status_code=400,
            detail="Provide both link text and link URL, or leave both blank.")

    if link_text is not None and (len(link_text) > MAX_LINK_LENGTH or len(link_url) > MAX_LINK_LENGTH):
        raise HTTPException(
            status_code=400,
            detail=f"Link text and link URL must each be {MAX_LINK_LENGTH} characters or fewer.")

    if link_url is not None and not link_url.startswith(ALLOWED_URL_PREFIXES):
        raise HTTPException(
            status_code=400,
            detail="Link URL must start with '/', 'http://', or 'https://'.")

    return Banner(message=message, link_text=link_text, link_url=link_url)


@router.get("/banner")
def get_banner(db: Session = Depends(get_db)):
    """
    Returns the current home page banner, or null when no banner is set.
    """
    return get_banner_db(db)


@router.put("/banner")
def set_banner(banner: Banner, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    """
    Creates or replaces the single home page banner.
    """
    return set_banner_db(db, clean_banner(banner))


@router.delete("/banner")
def delete_banner(db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    """
    Removes the home page banner. Succeeds even if no banner is currently set.
    """
    delete_banner_db(db)
    return {"message": "Banner removed."}

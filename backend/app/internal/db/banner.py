from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.internal.models.banner import Banner, BannerModel

# The site only ever has one banner, so it always lives at this id.
BANNER_ID = 1


def _serialize(banner: BannerModel) -> dict:
    updated_at = banner.updated_at
    if updated_at is not None:
        # Stored as naive UTC; attach the offset so clients parse it correctly.
        updated_at = updated_at.replace(tzinfo=timezone.utc).isoformat()

    return {
        "id": banner.id,
        "message": banner.message,
        "link_text": banner.link_text,
        "link_url": banner.link_url,
        "updated_at": updated_at,
    }


def get_banner_db(db: Session):
    """
    Returns the current banner as a dict, or None when no banner is set.
    """
    banner = db.query(BannerModel).filter(BannerModel.id == BANNER_ID).first()
    return _serialize(banner) if banner else None


def set_banner_db(db: Session, banner: Banner) -> dict:
    """
    Creates the banner if it does not exist, otherwise replaces its contents.
    """
    record = db.query(BannerModel).filter(BannerModel.id == BANNER_ID).first()

    if record is None:
        record = BannerModel(id=BANNER_ID)
        db.add(record)

    record.message = banner.message
    record.link_text = banner.link_text
    record.link_url = banner.link_url
    record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return _serialize(record)


def delete_banner_db(db: Session) -> int:
    """
    Removes the banner. Clears every row so the single-banner invariant
    holds even if stray rows were ever inserted by hand.

    Returns the number of rows removed.
    """
    deleted = db.query(BannerModel).delete()
    db.commit()
    return deleted

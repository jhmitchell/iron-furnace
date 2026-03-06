from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.internal.models.sponsors import Sponsor, SponsorModel


def get_sponsors_db(db: Session):
    sponsors = db.query(SponsorModel).order_by(SponsorModel.display_order.asc()).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "display_order": s.display_order,
        } for s in sponsors
    ]


def create_sponsor_db(db: Session, sponsor: Sponsor):
    max_order = db.query(func.max(SponsorModel.display_order)).scalar()
    new_order = (max_order + 1) if max_order is not None else 0

    new_sponsor = SponsorModel(
        name=sponsor.name,
        display_order=new_order,
    )
    db.add(new_sponsor)
    db.commit()
    db.refresh(new_sponsor)
    return new_sponsor


def edit_sponsor_db(db: Session, sponsor_id: int, name: str):
    stmt = select(SponsorModel).where(SponsorModel.id == sponsor_id)
    sponsor = db.execute(stmt).scalar_one_or_none()

    if sponsor is None:
        raise ValueError(f"Sponsor with ID {sponsor_id} does not exist.")

    sponsor.name = name
    db.commit()
    db.refresh(sponsor)
    return sponsor


def delete_sponsor_db(db: Session, sponsor_id: int):
    sponsor = db.query(SponsorModel).filter(SponsorModel.id == sponsor_id).first()

    if sponsor is None:
        raise ValueError(f"Sponsor with ID {sponsor_id} does not exist.")

    db.delete(sponsor)
    db.commit()


def reorder_sponsors_db(db: Session, ordered_ids: list):
    for index, sponsor_id in enumerate(ordered_ids):
        stmt = select(SponsorModel).where(SponsorModel.id == sponsor_id)
        sponsor = db.execute(stmt).scalar_one_or_none()
        if sponsor:
            sponsor.display_order = index
    db.commit()

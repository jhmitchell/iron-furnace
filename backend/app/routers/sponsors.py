from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.internal.models.sponsors import Sponsor, SponsorReorder
from app.internal.db.session import get_db
from app.internal.db.sponsors import (
    get_sponsors_db,
    create_sponsor_db,
    edit_sponsor_db,
    delete_sponsor_db,
    reorder_sponsors_db,
)
from app.internal.token import authorize

router = APIRouter()


@router.get("/sponsors")
def get_sponsors(db: Session = Depends(get_db)):
    return get_sponsors_db(db)


@router.post("/sponsors")
def create_sponsor(sponsor: Sponsor, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        new_sponsor = create_sponsor_db(db, sponsor)
        return new_sponsor
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/sponsors/{sponsor_id}")
def edit_sponsor(sponsor_id: int, sponsor: Sponsor, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        updated = edit_sponsor_db(db, sponsor_id, sponsor.name)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/sponsors/{sponsor_id}")
def delete_sponsor(sponsor_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        delete_sponsor_db(db, sponsor_id)
        return {"message": "Sponsor deleted successfully."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/sponsors/reorder")
def reorder_sponsors(body: SponsorReorder, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        reorder_sponsors_db(db, body.ordered_ids)
        return {"message": "Sponsors reordered successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

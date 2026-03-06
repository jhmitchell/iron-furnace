from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.internal.models.board_members import BoardMember, BoardMemberReorder
from app.internal.db.session import get_db
from app.internal.db.board_members import (
    get_board_members_db,
    create_board_member_db,
    edit_board_member_db,
    delete_board_member_db,
    reorder_board_members_db,
)
from app.internal.token import authorize

router = APIRouter()


@router.get("/board-members")
def get_board_members(db: Session = Depends(get_db)):
    return get_board_members_db(db)


@router.post("/board-members")
def create_board_member(member: BoardMember, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        new_member = create_board_member_db(db, member)
        return new_member
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/board-members/{member_id}")
def edit_board_member(member_id: int, member: BoardMember, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        updated_data = {"name": member.name}
        if member.title is not None:
            updated_data["title"] = member.title
        else:
            updated_data["title"] = None
        updated = edit_board_member_db(db, member_id, updated_data)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/board-members/{member_id}")
def delete_board_member(member_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        delete_board_member_db(db, member_id)
        return {"message": "Board member deleted successfully."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/board-members/reorder")
def reorder_board_members(body: BoardMemberReorder, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    try:
        reorder_board_members_db(db, body.ordered_ids)
        return {"message": "Board members reordered successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

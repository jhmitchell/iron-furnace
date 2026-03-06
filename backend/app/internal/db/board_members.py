from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.internal.models.board_members import BoardMember, BoardMemberModel


def get_board_members_db(db: Session):
    members = db.query(BoardMemberModel).order_by(BoardMemberModel.display_order.asc()).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "title": m.title,
            "display_order": m.display_order,
        } for m in members
    ]


def create_board_member_db(db: Session, member: BoardMember):
    max_order = db.query(func.max(BoardMemberModel.display_order)).scalar()
    new_order = (max_order + 1) if max_order is not None else 0

    new_member = BoardMemberModel(
        name=member.name,
        title=member.title,
        display_order=new_order,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


def edit_board_member_db(db: Session, member_id: int, updated_data: dict):
    stmt = select(BoardMemberModel).where(BoardMemberModel.id == member_id)
    member = db.execute(stmt).scalar_one_or_none()

    if member is None:
        raise ValueError(f"Board member with ID {member_id} does not exist.")

    for key, value in updated_data.items():
        if hasattr(member, key):
            setattr(member, key, value)

    db.commit()
    db.refresh(member)
    return member


def delete_board_member_db(db: Session, member_id: int):
    member = db.query(BoardMemberModel).filter(BoardMemberModel.id == member_id).first()

    if member is None:
        raise ValueError(f"Board member with ID {member_id} does not exist.")

    db.delete(member)
    db.commit()


def reorder_board_members_db(db: Session, ordered_ids: list):
    for index, member_id in enumerate(ordered_ids):
        stmt = select(BoardMemberModel).where(BoardMemberModel.id == member_id)
        member = db.execute(stmt).scalar_one_or_none()
        if member:
            member.display_order = index
    db.commit()

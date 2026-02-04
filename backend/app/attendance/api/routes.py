from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List
from datetime import date, datetime, timedelta
from app.core.database import get_async_session
from app.attendance.models.models import Attendance, AttendanceStatus
from app.core.dependencies import get_current_user
from calendar import monthrange
from app.center.models.models import CenterTimeSlot
from app.settings.models.models import CenterOperationalSetting, CenterHoliday
from app.auth.models.models import Member


router = APIRouter()

@router.post("/attendance/check-in")
async def attendance_check_in(
    center_id: str = Query(...),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    today = date.today()
    att_result = await session.execute(
        select(Attendance).where(
            and_(
                Attendance.user_id == current_user["user_id"],
                Attendance.center_id == center_id,
                Attendance.date == today
            )
        )
    )
    att = att_result.scalar_one_or_none()
    if att:
        return {
            "message": f"Check-in already recorded. Check-in time is {att.check_in_time.strftime('%H:%M:%S') if att.check_in_time else 'N/A'}.",
            "attendance": {
                "id": str(att.id),
                "user_id": str(att.user_id),
                "center_id": str(att.center_id),
                "date": att.date,
                "check_in_time": att.check_in_time,
                "check_out_time": att.check_out_time,
                "status": att.status.value,
                "remarks": att.remarks
            }
        }
    now = datetime.utcnow()
    att = Attendance(
        user_id=current_user["user_id"],
        center_id=center_id,
        date=today,
        check_in_time=now,
        status=AttendanceStatus.present,
        created_at=now,
        created_by=current_user["user_id"],
        updated_at=now,
        updated_by=current_user["user_id"]
    )
    session.add(att)
    await session.commit()
    await session.refresh(att)
    return {
        "message": "Check-in successful.",
        "attendance": {
            "id": str(att.id),
            "user_id": str(att.user_id),
            "center_id": str(att.center_id),
            "date": att.date,
            "check_in_time": att.check_in_time,
            "check_out_time": att.check_out_time,
            "status": att.status.value,
            "remarks": att.remarks
        }
    }

@router.post("/attendance/check-out")
async def attendance_check_out(
    center_id: str = Query(...),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    today = date.today()
    att_result = await session.execute(
        select(Attendance).where(
            and_(
                Attendance.user_id == current_user["user_id"],
                Attendance.center_id == center_id,
                Attendance.date == today
            )
        )
    )
    att = att_result.scalar_one_or_none()
    if not att:
        raise HTTPException(status_code=404, detail="No check-in found for today.")
    if att.check_out_time:
        duration = None
        if att.check_in_time and att.check_out_time:
            duration_td = att.check_out_time - att.check_in_time
            duration = str(duration_td)
        return {
            "message": f"Check-out already recorded. Check-out time is {att.check_out_time.strftime('%H:%M:%S')}.",
            "attendance": {
                "id": str(att.id),
                "user_id": str(att.user_id),
                "center_id": str(att.center_id),
                "date": att.date,
                "check_in_time": att.check_in_time,
                "check_out_time": att.check_out_time,
                "status": att.status.value,
                "remarks": att.remarks,
                "duration": duration
            }
        }
    now = datetime.utcnow()
    att.check_out_time = now
    att.updated_at = now
    att.updated_by = current_user["user_id"]
    await session.commit()
    await session.refresh(att)
    duration = None
    if att.check_in_time and att.check_out_time:
        duration_td = att.check_out_time - att.check_in_time
        duration = str(duration_td)
    return {
        "message": "Check-out successful.",
        "attendance": {
            "id": str(att.id),
            "user_id": str(att.user_id),
            "center_id": str(att.center_id),
            "date": att.date,
            "check_in_time": att.check_in_time,
            "check_out_time": att.check_out_time,
            "status": att.status.value,
            "remarks": att.remarks,
            "duration": duration
        }
    }



@router.get("/attendance/member-monthly-summary")
async def member_monthly_attendance(
    member_id: str = Query(...),
    center_id: str = Query(...),
    year: int = Query(...),
    month: int = Query(...),
    session: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user)
):
    # 1. Get member and their active time slot
    member_result = await session.execute(
        select(Member).where(Member.id == member_id)
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    time_slot_id = member.time_slot_id

    # 2. Get time slot details
    slot = None
    if time_slot_id:
        slot_result = await session.execute(
            select(CenterTimeSlot).where(CenterTimeSlot.id == time_slot_id)
        )
        slot = slot_result.scalar_one_or_none()

    # 3. Get center operational settings (week-offs)
    ops_result = await session.execute(
        select(CenterOperationalSetting).where(CenterOperationalSetting.center_id == center_id)
    )
    ops = ops_result.scalar_one_or_none()
    week_off_days = [d.value for d in ops.week_off_days] if ops and ops.week_off_days else []

    # 4. Get holidays for the month
    start_date = date(year, month, 1)
    end_date = date(year, month, monthrange(year, month)[1])
    holidays_result = await session.execute(
        select(CenterHoliday).where(
            and_(
                CenterHoliday.center_id == center_id,
                or_(
                    and_(CenterHoliday.start_date <= end_date, CenterHoliday.end_date >= start_date)
                )
            )
        )
    )
    holidays = holidays_result.scalars().all()
    holiday_dates = set()
    for h in holidays:
        d = h.start_date
        while d <= h.end_date:
            holiday_dates.add(d)
            d += timedelta(days=1)

    # 5. Get all attendance records for the member in this month
    attendance_result = await session.execute(
        select(Attendance).where(
            and_(
                Attendance.user_id == member_id,
                Attendance.center_id == center_id,
                Attendance.date >= start_date,
                Attendance.date <= end_date
            )
        )
    )
    attendance_map = {a.date: a for a in attendance_result.scalars().all()}

    # 6. Build the monthly summary
    summary = []
    for day in range(1, monthrange(year, month)[1] + 1):
        d = date(year, month, day)
        weekday = d.strftime("%A")
        status = "upcoming"
        attendance = attendance_map.get(d)
        duration = None
        if d > date.today():
            status = "upcoming"
        elif d in holiday_dates:
            status = "holiday"
        elif weekday in week_off_days:
            status = "week_off"
        elif attendance:
            status = attendance.status.value
            if status == "present" and attendance.check_in_time and attendance.check_out_time:
                duration_td = attendance.check_out_time - attendance.check_in_time
                duration = str(duration_td)
        else:
            status = "absent"
        summary.append({
            "date": d.isoformat(),
            "weekday": weekday,
            "status": status,
            "check_in_time": attendance.check_in_time if attendance else None,
            "check_out_time": attendance.check_out_time if attendance else None,
            "duration": duration,
            "time_slot": {
                "id": str(slot.id) if slot else None,
                "start_time": slot.start_time if slot else None,
                "end_time": slot.end_time if slot else None,
            } if slot else None
        })

    return {
        "member_id": member_id,
        "center_id": center_id,
        "year": year,
        "month": month,
        "time_slot": {
            "id": str(slot.id) if slot else None,
            "start_time": slot.start_time if slot else None,
            "end_time": slot.end_time if slot else None,
        } if slot else None,
        "attendance_summary": summary
    }
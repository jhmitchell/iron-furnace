import React from 'react';
import { MdDelete } from 'react-icons/md';
import { DateBadge, ui } from '../ui';
import { parseLocalDate, formatHolidayDate } from '../../utils/dates';
import styles from './HolidayEntry.module.css';

const HolidayEntry = ({ holiday, onDelete, disabled }) => {
  const date = parseLocalDate(holiday.holiday_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = date < today;

  return (
    <div className={`${ui.listItem} ${isPast ? ui.past : ''}`}>
      <DateBadge date={date} />
      <div className={ui.listItemMain}>
        <div className={styles.description}>{holiday.description || 'Closed'}</div>
        <div className={ui.listItemMeta}>
          {formatHolidayDate(holiday.holiday_date)}
          {isPast && ' · Past'}
        </div>
      </div>
      <div className={ui.listItemActions}>
        <button
          type="button"
          className={`${ui.iconButton} ${ui.iconButtonDanger}`}
          onClick={onDelete}
          title="Remove closure"
          disabled={disabled}
        >
          <MdDelete />
        </button>
      </div>
    </div>
  );
};

export default HolidayEntry;

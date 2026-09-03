import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator, MdEdit, MdDelete } from 'react-icons/md';
import { ui } from '../ui';
import styles from './SortableItem.module.css';

/**
 * Drag-to-reorder list row with optional edit and delete actions.
 */
const SortableItem = ({ id, children, onEdit, onDelete }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} className={`${ui.listItem} ${isDragging ? styles.dragging : ''}`}>
			<span className={styles.dragHandle} title="Drag to reorder" {...attributes} {...listeners}>
				<MdDragIndicator size={20} />
			</span>
			<span className={ui.listItemMain}>{children}</span>
			<span className={ui.listItemActions}>
				{onEdit && (
					<button type="button" className={ui.iconButton} onClick={onEdit} title="Edit">
						<MdEdit size={18} />
					</button>
				)}
				{onDelete && (
					<button type="button" className={`${ui.iconButton} ${ui.iconButtonDanger}`} onClick={onDelete} title="Delete">
						<MdDelete size={18} />
					</button>
				)}
			</span>
		</div>
	);
};

export default SortableItem;

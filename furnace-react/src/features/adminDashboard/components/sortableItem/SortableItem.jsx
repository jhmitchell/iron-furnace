import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MdDragIndicator, MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md';

const itemStyle = {
	display: 'flex',
	alignItems: 'center',
	gap: '10px',
	padding: '10px 14px',
	marginBottom: '6px',
	backgroundColor: '#3b3c45',
	borderRadius: '6px',
	color: 'var(--text-off-white)',
};

const dragHandleStyle = {
	cursor: 'grab',
	display: 'flex',
	alignItems: 'center',
	color: '#888',
};

const contentStyle = {
	flex: 1,
	fontSize: '0.95rem',
};

const buttonStyle = {
	background: 'none',
	border: 'none',
	color: '#aaa',
	cursor: 'pointer',
	display: 'flex',
	alignItems: 'center',
	padding: '4px',
	fontSize: '1.1rem',
};

const SortableItem = ({ id, children, onEdit, onDelete }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id });

	const style = {
		...itemStyle,
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<span style={dragHandleStyle} {...attributes} {...listeners}>
				<MdDragIndicator size={20} />
			</span>
			<span style={contentStyle}>{children}</span>
			{onEdit && (
				<button style={buttonStyle} onClick={onEdit} title="Edit">
					<MdEdit size={18} />
				</button>
			)}
			{onDelete && (
				<button style={{ ...buttonStyle, color: '#e57373' }} onClick={onDelete} title="Delete">
					<MdDelete size={18} />
				</button>
			)}
		</div>
	);
};

export default SortableItem;

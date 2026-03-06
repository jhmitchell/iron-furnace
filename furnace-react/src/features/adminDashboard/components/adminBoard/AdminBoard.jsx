import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { getAllBoardMembers, createBoardMember, editBoardMember, deleteBoardMember, reorderBoardMembers } from '/src/features/boardMembers';
import SortableItem from '../sortableItem/SortableItem';
import styles from './AdminBoard.module.css';

const AdminBoard = () => {
	const [members, setMembers] = useState([]);
	const [newName, setNewName] = useState('');
	const [newTitle, setNewTitle] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editName, setEditName] = useState('');
	const [editTitle, setEditTitle] = useState('');

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
	);

	const fetchMembers = async () => {
		try {
			const data = await getAllBoardMembers();
			setMembers(data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchMembers();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!newName.trim()) return;
		try {
			await createBoardMember({
				name: newName.trim(),
				title: newTitle.trim() || null,
			});
			setNewName('');
			setNewTitle('');
			fetchMembers();
		} catch (error) {
			alert('Failed to create board member.');
		}
	};

	const handleEdit = async (id) => {
		if (!editName.trim()) return;
		try {
			await editBoardMember(id, {
				name: editName.trim(),
				title: editTitle.trim() || null,
			});
			setEditingId(null);
			setEditName('');
			setEditTitle('');
			fetchMembers();
		} catch (error) {
			alert('Failed to edit board member.');
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this board member?')) return;
		try {
			await deleteBoardMember(id);
			fetchMembers();
		} catch (error) {
			alert('Failed to delete board member.');
		}
	};

	const handleDragEnd = async (event) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = members.findIndex(m => m.id === active.id);
		const newIndex = members.findIndex(m => m.id === over.id);
		const reordered = arrayMove(members, oldIndex, newIndex);
		setMembers(reordered);

		try {
			await reorderBoardMembers(reordered.map(m => m.id));
		} catch (error) {
			console.error('Failed to save order:', error);
			fetchMembers();
		}
	};

	const startEdit = (member) => {
		setEditingId(member.id);
		setEditName(member.name);
		setEditTitle(member.title || '');
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditName('');
		setEditTitle('');
	};

	const formatMember = (member) => {
		if (member.title) {
			return <>{member.name}, <b>{member.title}</b></>;
		}
		return member.name;
	};

	return (
		<div className={styles.container}>
			<h2>Manage Board of Directors</h2>

			<form onSubmit={handleCreate} className={styles.createForm}>
				<input
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					placeholder="Name"
					className={styles.input}
				/>
				<input
					type="text"
					value={newTitle}
					onChange={(e) => setNewTitle(e.target.value)}
					placeholder="Title (optional)"
					className={styles.input}
				/>
				<button type="submit" className={styles.addButton}>Add</button>
			</form>

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
					{members.map((member) => (
						<SortableItem
							key={member.id}
							id={member.id}
							onEdit={() => startEdit(member)}
							onDelete={() => handleDelete(member.id)}
						>
							{editingId === member.id ? (
								<span className={styles.editRow}>
									<input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										className={styles.editInput}
										placeholder="Name"
										autoFocus
										onKeyDown={(e) => {
											if (e.key === 'Enter') handleEdit(member.id);
											if (e.key === 'Escape') cancelEdit();
										}}
									/>
									<input
										type="text"
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										className={styles.editInput}
										placeholder="Title (optional)"
										onKeyDown={(e) => {
											if (e.key === 'Enter') handleEdit(member.id);
											if (e.key === 'Escape') cancelEdit();
										}}
									/>
									<button className={styles.saveButton} onClick={() => handleEdit(member.id)}>Save</button>
									<button className={styles.cancelButton} onClick={cancelEdit}>Cancel</button>
								</span>
							) : (
								formatMember(member)
							)}
						</SortableItem>
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
};

export default AdminBoard;

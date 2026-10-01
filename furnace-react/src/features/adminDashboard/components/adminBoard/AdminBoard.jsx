import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { getAllBoardMembers, createBoardMember, editBoardMember, deleteBoardMember, reorderBoardMembers } from '/src/features/boardMembers';
import SortableItem from '../sortableItem/SortableItem';
import { AdminPage, AdminCard, StatusMessage, EmptyState, ui } from '../ui';
import styles from './AdminBoard.module.css';

const AdminBoard = () => {
	const [members, setMembers] = useState([]);
	const [newName, setNewName] = useState('');
	const [newTitle, setNewTitle] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editName, setEditName] = useState('');
	const [editTitle, setEditTitle] = useState('');
	const [status, setStatus] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
	);

	const fetchMembers = async () => {
		try {
			const data = await getAllBoardMembers();
			setMembers(data);
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to load board members.' });
		}
	};

	useEffect(() => {
		fetchMembers();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!newName.trim()) return;
		setStatus(null);
		try {
			await createBoardMember({
				name: newName.trim(),
				title: newTitle.trim() || null,
			});
			setNewName('');
			setNewTitle('');
			fetchMembers();
			setStatus({ type: 'success', text: 'Board member added.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to add the board member.' });
		}
	};

	const handleEdit = async (id) => {
		if (!editName.trim()) return;
		setStatus(null);
		try {
			await editBoardMember(id, {
				name: editName.trim(),
				title: editTitle.trim() || null,
			});
			setEditingId(null);
			setEditName('');
			setEditTitle('');
			fetchMembers();
			setStatus({ type: 'success', text: 'Board member updated.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to update the board member.' });
		}
	};

	const handleDelete = async (member) => {
		if (!window.confirm(`Remove ${member.name} from the board?`)) return;
		setStatus(null);
		try {
			await deleteBoardMember(member.id);
			fetchMembers();
			setStatus({ type: 'success', text: 'Board member removed.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to remove the board member.' });
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
			setStatus({ type: 'error', text: 'Failed to save the new order.' });
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

	const handleEditKeys = (id) => (e) => {
		if (e.key === 'Enter') handleEdit(id);
		if (e.key === 'Escape') cancelEdit();
	};

	return (
		<AdminPage
			narrow
			title="Board of Directors"
			description="Board members shown on the website, in this order. Drag a row by its handle to reorder."
		>
			<div className={ui.stack}>
				<AdminCard title="Add a board member">
					<form onSubmit={handleCreate} className={styles.createForm}>
						<input
							type="text"
							className={ui.input}
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Name"
							aria-label="Name"
						/>
						<input
							type="text"
							className={ui.input}
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							placeholder="Title (optional), e.g. President"
							aria-label="Title (optional)"
						/>
						<button type="submit" className={`${ui.button} ${ui.buttonPrimary}`} disabled={!newName.trim()}>
							Add
						</button>
					</form>
				</AdminCard>

				<AdminCard title="Current board" aside={<span className={ui.countPill}>{members.length}</span>}>
					{members.length === 0 ? (
						<EmptyState>No board members yet. Add one above.</EmptyState>
					) : (
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
								<div className={ui.list}>
									{members.map((member) => (
										<SortableItem
											key={member.id}
											id={member.id}
											onEdit={() => startEdit(member)}
											onDelete={() => handleDelete(member)}
										>
											{editingId === member.id ? (
												<span className={styles.editRow}>
													<input
														type="text"
														className={`${ui.input} ${ui.inputSmall}`}
														value={editName}
														onChange={(e) => setEditName(e.target.value)}
														placeholder="Name"
														autoFocus
														onKeyDown={handleEditKeys(member.id)}
													/>
													<input
														type="text"
														className={`${ui.input} ${ui.inputSmall}`}
														value={editTitle}
														onChange={(e) => setEditTitle(e.target.value)}
														placeholder="Title (optional)"
														onKeyDown={handleEditKeys(member.id)}
													/>
													<button type="button" className={`${ui.button} ${ui.buttonPrimary} ${ui.buttonSmall}`} onClick={() => handleEdit(member.id)}>Save</button>
													<button type="button" className={`${ui.button} ${ui.buttonSecondary} ${ui.buttonSmall}`} onClick={cancelEdit}>Cancel</button>
												</span>
											) : (
												<>
													<span className={styles.memberName}>{member.name}</span>
													{member.title && <span className={styles.memberTitle}>{member.title}</span>}
												</>
											)}
										</SortableItem>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}
					<StatusMessage status={status} className={ui.spaceTop} />
				</AdminCard>
			</div>
		</AdminPage>
	);
};

export default AdminBoard;

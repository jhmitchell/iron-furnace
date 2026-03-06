import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { getAllSponsors, createSponsor, editSponsor, deleteSponsor, reorderSponsors } from '/src/features/sponsors';
import SortableItem from '../sortableItem/SortableItem';
import styles from './AdminSponsors.module.css';

const AdminSponsors = () => {
	const [sponsors, setSponsors] = useState([]);
	const [newName, setNewName] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editName, setEditName] = useState('');

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
	);

	const fetchSponsors = async () => {
		try {
			const data = await getAllSponsors();
			setSponsors(data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		fetchSponsors();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!newName.trim()) return;
		try {
			await createSponsor({ name: newName.trim() });
			setNewName('');
			fetchSponsors();
		} catch (error) {
			alert('Failed to create sponsor.');
		}
	};

	const handleEdit = async (id) => {
		if (!editName.trim()) return;
		try {
			await editSponsor(id, { name: editName.trim() });
			setEditingId(null);
			setEditName('');
			fetchSponsors();
		} catch (error) {
			alert('Failed to edit sponsor.');
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this sponsor?')) return;
		try {
			await deleteSponsor(id);
			fetchSponsors();
		} catch (error) {
			alert('Failed to delete sponsor.');
		}
	};

	const handleDragEnd = async (event) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = sponsors.findIndex(s => s.id === active.id);
		const newIndex = sponsors.findIndex(s => s.id === over.id);
		const reordered = arrayMove(sponsors, oldIndex, newIndex);
		setSponsors(reordered);

		try {
			await reorderSponsors(reordered.map(s => s.id));
		} catch (error) {
			console.error('Failed to save order:', error);
			fetchSponsors();
		}
	};

	const startEdit = (sponsor) => {
		setEditingId(sponsor.id);
		setEditName(sponsor.name);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditName('');
	};

	return (
		<div className={styles.container}>
			<h2>Manage Sponsors</h2>

			<form onSubmit={handleCreate} className={styles.createForm}>
				<input
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					placeholder="New sponsor name"
					className={styles.input}
				/>
				<button type="submit" className={styles.addButton}>Add</button>
			</form>

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={sponsors.map(s => s.id)} strategy={verticalListSortingStrategy}>
					{sponsors.map((sponsor) => (
						<SortableItem
							key={sponsor.id}
							id={sponsor.id}
							onEdit={() => startEdit(sponsor)}
							onDelete={() => handleDelete(sponsor.id)}
						>
							{editingId === sponsor.id ? (
								<span className={styles.editRow}>
									<input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										className={styles.editInput}
										autoFocus
										onKeyDown={(e) => {
											if (e.key === 'Enter') handleEdit(sponsor.id);
											if (e.key === 'Escape') cancelEdit();
										}}
									/>
									<button className={styles.saveButton} onClick={() => handleEdit(sponsor.id)}>Save</button>
									<button className={styles.cancelButton} onClick={cancelEdit}>Cancel</button>
								</span>
							) : (
								sponsor.name
							)}
						</SortableItem>
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
};

export default AdminSponsors;

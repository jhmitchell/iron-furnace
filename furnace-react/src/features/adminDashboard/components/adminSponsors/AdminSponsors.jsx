import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { getAllSponsors, createSponsor, editSponsor, deleteSponsor, reorderSponsors } from '/src/features/sponsors';
import SortableItem from '../sortableItem/SortableItem';
import { AdminPage, AdminCard, StatusMessage, EmptyState, ui } from '../ui';
import styles from './AdminSponsors.module.css';

const AdminSponsors = () => {
	const [sponsors, setSponsors] = useState([]);
	const [newName, setNewName] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editName, setEditName] = useState('');
	const [status, setStatus] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
	);

	const fetchSponsors = async () => {
		try {
			const data = await getAllSponsors();
			setSponsors(data);
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to load sponsors.' });
		}
	};

	useEffect(() => {
		fetchSponsors();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!newName.trim()) return;
		setStatus(null);
		try {
			await createSponsor({ name: newName.trim() });
			setNewName('');
			fetchSponsors();
			setStatus({ type: 'success', text: 'Sponsor added.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to add the sponsor.' });
		}
	};

	const handleEdit = async (id) => {
		if (!editName.trim()) return;
		setStatus(null);
		try {
			await editSponsor(id, { name: editName.trim() });
			setEditingId(null);
			setEditName('');
			fetchSponsors();
			setStatus({ type: 'success', text: 'Sponsor updated.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to update the sponsor.' });
		}
	};

	const handleDelete = async (sponsor) => {
		if (!window.confirm(`Delete "${sponsor.name}"?`)) return;
		setStatus(null);
		try {
			await deleteSponsor(sponsor.id);
			fetchSponsors();
			setStatus({ type: 'success', text: 'Sponsor deleted.' });
		} catch (error) {
			setStatus({ type: 'error', text: 'Failed to delete the sponsor.' });
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
			setStatus({ type: 'error', text: 'Failed to save the new order.' });
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
		<AdminPage
			narrow
			title="Sponsors"
			description="Sponsor names shown on the website. Drag a row by its handle to change the display order."
		>
			<div className={ui.stack}>
				<AdminCard title="Add a sponsor">
					<form onSubmit={handleCreate} className={styles.createForm}>
						<input
							type="text"
							className={ui.input}
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							placeholder="Sponsor name"
							aria-label="Sponsor name"
						/>
						<button type="submit" className={`${ui.button} ${ui.buttonPrimary}`} disabled={!newName.trim()}>
							Add
						</button>
					</form>
				</AdminCard>

				<AdminCard title="Current sponsors" aside={<span className={ui.countPill}>{sponsors.length}</span>}>
					{sponsors.length === 0 ? (
						<EmptyState>No sponsors yet. Add one above.</EmptyState>
					) : (
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={sponsors.map(s => s.id)} strategy={verticalListSortingStrategy}>
								<div className={ui.list}>
									{sponsors.map((sponsor) => (
										<SortableItem
											key={sponsor.id}
											id={sponsor.id}
											onEdit={() => startEdit(sponsor)}
											onDelete={() => handleDelete(sponsor)}
										>
											{editingId === sponsor.id ? (
												<span className={styles.editRow}>
													<input
														type="text"
														className={`${ui.input} ${ui.inputSmall}`}
														value={editName}
														onChange={(e) => setEditName(e.target.value)}
														autoFocus
														onKeyDown={(e) => {
															if (e.key === 'Enter') handleEdit(sponsor.id);
															if (e.key === 'Escape') cancelEdit();
														}}
													/>
													<button type="button" className={`${ui.button} ${ui.buttonPrimary} ${ui.buttonSmall}`} onClick={() => handleEdit(sponsor.id)}>Save</button>
													<button type="button" className={`${ui.button} ${ui.buttonSecondary} ${ui.buttonSmall}`} onClick={cancelEdit}>Cancel</button>
												</span>
											) : (
												sponsor.name
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

export default AdminSponsors;

'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx'
import { formatDate } from '../../../utils/formatDate'
import { operationFilterStore } from '../../../store/operationFilter.store'
import { cn } from '@/app/lib/utils'
import {
	useUcodeRequestInfinite,
	useDeleteOperation,
	useUcodeRequestMutation,
} from '@/hooks/useDashboard'
import { OperationsFiltersSidebar } from '@/components/operations/OperationsFiltersSidebar/OperationsFiltersSidebar'
import { OperationsHeader } from '@/components/operations/OperationsHeader/OperationsHeader'
import OperationModal from '@/components/operations/OperationModal/OperationModal'
import CreateShipment from '@/components/deals/details/CreatingShipment'
import { DeleteConfirmModal } from '@/components/operations/OperationsTable/DeleteConfirmModal'
import OperationTableRow from '@/components/operations/TableRow'
import styles from './operations.module.scss'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'
import { useQueryClient } from '@tanstack/react-query'
import operationsDto from '../../../lib/dtos/operationsDto'
import { OperationsFooter } from '../../../components/operations/OperationsFooter/OperationsFooter'

const OperationsPage = observer(() => {
	const [isModalClosing, setIsModalClosing] = useState(false)
	const [isModalOpening, setIsModalOpening] = useState(false)

	const [selectedOperations, setSelectedOperations] = useState([])
	const [openModal, setOpenModal] = useState(false)
	const [modalType, setModalType] = useState(null)
	const [operationToDelete, setOperationToDelete] = useState(null)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const queryClient = useQueryClient()

	// Shipment state
	const [showShipmentModal, setShowShipmentModal] = useState(false)
	const [selectedShipment, setSelectedShipment] = useState(null)
	const [isShipmentEditing, setIsShipmentEditing] = useState(false)
	const [isShipmentCopying, setIsShipmentCopying] = useState(false)
	const [isShipmentDeleting, setIsShipmentDeleting] = useState(false)
	// Block body scroll for this page only
	useEffect(() => {
		document.body.style.overflow = 'hidden'
		document.body.style.height = '100vh'

		return () => {
			document.body.style.overflow = ''
			document.body.style.height = ''
		}
	}, [])

	// Filter states
	const [isFilterOpen, setIsFilterOpen] = useState(true)

	const {
		limit,
		searchQuery,
		debouncedSearchQuery,
		selectedDatePaymentRange,
		selectedDateStartRange,
		selectedCounterAgents,
		selectedLegalEntities,
		selectedFilters,
		amountRange,
		selectedChartOfAccounts,
		paymentType,
		dateFilters,
		dateStartFilters,
		deals
	} = operationFilterStore

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			operationFilterStore.setDebouncedSearchQuery(searchQuery)
		}, 500)

		return () => clearTimeout(timer)
	}, [searchQuery])



	// Pagination state
	const tableWrapperRef = useRef(null)


	const requestOperationFilters = useMemo(() => {
		const safeFormatDate = (date) => {
			if (!date) return undefined;
			try {
				const d = date instanceof Date ? date : new Date(date);
				if (isNaN(d.getTime())) return undefined;
				return formatDate(d);
			} catch {
				return undefined;
			}
		};

		const startDate = safeFormatDate(selectedDatePaymentRange?.start);
		const endDate = safeFormatDate(selectedDatePaymentRange?.end);

		const accrualStartDate = safeFormatDate(selectedDateStartRange?.start);
		const accrualEndDate = safeFormatDate(selectedDateStartRange?.end);

		const result = {
			limit,
			...(debouncedSearchQuery && { search: debouncedSearchQuery.toLowerCase() }),
			...(startDate && endDate && {
				paymentDateStart: startDate,
				paymentDateEnd: endDate,
			}),
			...(accrualStartDate && accrualEndDate && {
				accrualDateStart: accrualStartDate,
				accrualDateEnd: accrualEndDate,
			}),
			...(selectedCounterAgents.length > 0 && {
				counterparties_ids: toJS(selectedCounterAgents),
			}),
			...(selectedLegalEntities.length > 0 && {
				my_accounts_ids: toJS(selectedLegalEntities),
			}),
			...(selectedFilters.length > 0 && { tip: toJS(selectedFilters) }),
			...((amountRange.min !== "" || amountRange.max !== "") && {
				amount_range: {
					...(amountRange.min !== "" && { min: Number(amountRange.min) }),
					...(amountRange.max !== "" && { max: Number(amountRange.max) }),
				},
			}),
			...(selectedChartOfAccounts.length > 0 && {
				chart_of_accounts_ids: toJS(selectedChartOfAccounts),
			}),
			...(paymentType && { payment_type: paymentType }),
			paymentConfirmed: dateFilters.podtverzhdena,
			paymentNotConfirmed: dateFilters.nePodtverzhdena,
			accrualConfirmed: dateStartFilters.podtverzhdena,
			accrualNotConfirmed: dateStartFilters.nePodtverzhdena,
			sellingDealId: deals
		};

		return result;
	}, [
		limit,
		debouncedSearchQuery,
		selectedDatePaymentRange,
		selectedDateStartRange,
		selectedCounterAgents,
		selectedLegalEntities,
		selectedFilters,
		amountRange,
		selectedChartOfAccounts,
		paymentType,
		dateFilters,
		dateStartFilters,
		deals
	])

	const {
		data: infiniteData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLoadingOperations,
		isFetching
	} = useUcodeRequestInfinite({
		method: 'find_operations',
		data: requestOperationFilters,
		querySetting: {
			select: (response) => response
		}
	})

	const allOperations = useMemo(() => {
		return infiniteData?.pages?.flatMap(page => page?.data?.data?.data || []) || []
	}, [infiniteData])

	const totalSummary = useMemo(() => {
		return infiniteData?.pages?.[0]?.data?.data?.totalSummary
	}, [infiniteData])


	const isAllSelected = allOperations.length > 0 && selectedOperations.length === allOperations.length

	const toggleSelectAll = () => {
		if (isAllSelected) {
			setSelectedOperations([])
		} else {
			setSelectedOperations(allOperations.map(op => op.id))
		}
	}

	// Infinite scroll handler
	useEffect(() => {
		const tableWrapper = tableWrapperRef.current
		if (!tableWrapper) return

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = tableWrapper
			// Load more when scrolled to the bottom (with small threshold)
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 30

			if (isAtBottom && hasNextPage && !isLoadingOperations && !isFetchingNextPage) {
				fetchNextPage()
			}
		}

		tableWrapper.addEventListener('scroll', handleScroll)
		return () => tableWrapper.removeEventListener('scroll', handleScroll)
	}, [hasNextPage, isLoadingOperations, isFetchingNextPage, fetchNextPage])





	const operationsList = useMemo(() => {
		return {
			today: operationsDto(allOperations, 'today'),
			before: operationsDto(allOperations, 'before'),
		}
	}, [allOperations])



	const { mutateAsync: deleteShipmentMutationForShipment, isPending: isDeletingShipment } = useUcodeRequestMutation()

	// Close modal when clicking on header
	useEffect(() => {
		if (!openModal) return

		const handleHeaderClick = e => {
			// Check if click is on header element
			const header = document.querySelector('header')
			if (header && header.contains(e.target)) {
				// closeOperationModal()
			}
		}

		document.addEventListener('click', handleHeaderClick)
		return () => document.removeEventListener('click', handleHeaderClick)
	}, [openModal])

	// Delete operation mutation
	const deleteOperationMutation = useDeleteOperation()

	const toggleOperation = id => {
		setSelectedOperations(prev =>
			prev.includes(id) ? prev.filter(opId => opId !== id) : [...prev, id],
		)
	}

	const openOperationModal = operation => {
		if (operation.tip === 'Отгрузка') {
			handleEditShipment(operation)
			return
		}
		setOpenModal(operation)
		setIsModalClosing(false)
		setIsModalOpening(true)
		if (operation.typeCategory === 'transfer') {
			setModalType('transfer')
		} else if (operation.typeCategory === 'out') {
			setModalType('payment')
		} else if (operation.typeCategory === 'in') {
			setModalType('income')
		} else {
			setModalType('accrual')
		}
		// Запускаем анимацию появления
		setTimeout(() => {
			setIsModalOpening(false)
		}, 50)
	}

	const handleEditShipment = (shipment) => {
		setSelectedShipment(shipment)
		setIsShipmentEditing(true)
		setIsShipmentCopying(false)
		setShowShipmentModal(true)
	}

	const handleCopyShipment = (shipment) => {
		setSelectedShipment(shipment)
		setIsShipmentEditing(false)
		setIsShipmentCopying(true)
		setShowShipmentModal(true)
	}

	const handleDeleteShipment = (shipment) => {
		setOperationToDelete(shipment)
		setIsShipmentDeleting(true)
		setIsDeleteModalOpen(true)
	}

	const closeOperationModal = () => {
		setIsModalClosing(true)
		// Разблокируем скролл страницы
		document.body.style.overflow = 'auto'
		setTimeout(() => {
			setOpenModal(null)
			setIsModalClosing(false)
		}, 300) // Длительность анимации
	}

	const handleEditOperation = operation => {
		if (operation.tip === 'Отгрузка') {
			handleEditShipment(operation)
			return
		}
		if (operation.typeCategory === 'transfer') {
			setModalType('transfer')
		} else if (operation.typeCategory === 'out') {
			setModalType('payment')
		} else if (operation.typeCategory === 'in') {
			setModalType('income')
		} else {
			setModalType('accrual')
		}
		openOperationModal(operation)
	}



	const handleDeleteOperation = operation => {
		if (operation.tip === 'Отгрузка') {
			handleDeleteShipment(operation)
			return
		}
		setOperationToDelete(operation)
		setIsDeleteModalOpen(true)
	}

	const handleCopyOperation = operation => {
		if (operation.tip === 'Отгрузка') {
			handleCopyShipment(operation)
			return
		}
		// Open modal as "new" but with the copied operation's data
		const copiedOperation = { ...operation };

		// Strip the primary GUIDs completely
		delete copiedOperation.guid;
		delete copiedOperation.id;

		if (copiedOperation.rawData) {
			copiedOperation.rawData = { ...copiedOperation.rawData };
			delete copiedOperation.rawData.guid;
		}


		setOpenModal({
			...copiedOperation,
			id: 'new',
			isNew: true,
			isCopy: true
		})

		setIsModalClosing(false)
		// setIsModalOpening(true)


		if (operation.typeCategory === 'transfer') {
			setModalType('accrual')
		} else if (operation.typeCategory === 'out') {
			setModalType('payment')
		} else if (operation.typeCategory === 'in') {
			setModalType('income')
		} else {
			setModalType('payment')
		}

		setTimeout(() => {
			setIsModalOpening(false)
		}, 50)
	}

	const handleDeleteConfirm = async () => {
		if (!operationToDelete) return

		const guid = operationToDelete.rawData?.guid || operationToDelete.guid
		if (!guid) {
			console.error('GUID операции не найден')
			return
		}

		try {
			if (isShipmentDeleting) {
				await deleteShipmentMutationForShipment({
					"method": "delete_shipment_transaction",
					"data": {
						"guid": guid
					}
				})
			} else {
				await deleteOperationMutation.mutateAsync([guid])
			}
			setIsDeleteModalOpen(false)
			setOperationToDelete(null)
			setIsShipmentDeleting(false)
			queryClient.invalidateQueries({ queryKey: ['dashboard'] })
			queryClient.invalidateQueries({ queryKey: ['operationsList'] })
			queryClient.invalidateQueries({ queryKey: ['find_operations'] })
			queryClient.invalidateQueries({ queryKey: ['get_counterparty_by_id'] })
			queryClient.invalidateQueries({ queryKey: ["list_sales_operations"] })
			queryClient.invalidateQueries({ queryKey: ["get_sales_transaction"] })
			queryClient.invalidateQueries({ queryKey: ['myAccountsBoard'] })
			queryClient.invalidateQueries({ queryKey: ['legalEntitiesPlanFact'] })
			queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })
		} catch (error) {
			console.error('Error deleting operation:', error)
		}
	}

	const handleDeleteCancel = () => {
		setIsDeleteModalOpen(false)
		setOperationToDelete(null)
		setIsShipmentDeleting(false)
	}

	const selectedTotal = useMemo(() => {
		return allOperations
			.filter(op => selectedOperations.includes(op.id))
			.reduce((sum, op) => {
				const amount = op.rawData?.summa || 0
				return sum + amount
			}, 0)
	}, [allOperations, selectedOperations])


	return (
		<div className={styles.container}>
			{/* Sidebar Filters */}
			<OperationsFiltersSidebar
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
			/>

			{/* Filter Toggle Bar */}
			{!isFilterOpen && (
				<div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
					<button className={styles.filterToggleButton}>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				</div>
			)}

			{/* Main Content */}
			<div className={styles.mainContent}>
				{/* Header */}
				<OperationsHeader
					isFilterOpen={isFilterOpen}
					onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
					onCreateClick={() => {
						setOpenModal({ id: 'new', isNew: true })
						setModalType('income')
						setIsModalClosing(false)
						setIsModalOpening(true)
						document.body.style.overflow = 'hidden'
						setTimeout(() => {
							setIsModalOpening(false)
						}, 50)
					}}
					selectedCount={selectedOperations.length}
					searchQuery={searchQuery}
					onSearchChange={(val) => operationFilterStore.setSearchQuery(val)}
				/>

				{/* Table */}
				<div className={styles.tableArea} style={{ position: 'relative' }}>
					{/* Refetch overlay spinner */}
					{isFetching && !isLoadingOperations && (
						<div style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: 'rgba(255,255,255,0.55)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 30,
							borderRadius: '4px',
						}}>
							<div className={styles.loadingSpinner} style={{ width: 28, height: 28, borderWidth: 3 }} />
						</div>
					)}
					{/* Selection Bar */}
					{selectedOperations.length > 0 && (
						<div className={styles.selectionBar}>
							<div className={styles.selectionBarLeft}>
								<button
									onClick={() => setSelectedOperations([])}
									className={styles.selectionBarClose}
								>
									✕
								</button>
								<span className={styles.selectionBarText}>
									Выбрано:{' '}
									<strong className={styles.selectionBarTextBold}>
										{selectedOperations.length}
									</strong>{' '}
									на сумму{' '}
									<strong
										className={cn(
											styles.selectionBarTextBold,
											selectedTotal >= 0
												? styles.selectionBarTextPositive
												: styles.selectionBarTextNegative,
										)}
									>
										{selectedTotal >= 0 ? '+' : ''}
										{selectedTotal.toLocaleString('ru-RU')}
									</strong>
								</span>
							</div>
							<div className={styles.selectionBarRight}>
								<button className={styles.selectionBarExport}>
									<svg
										className={styles.selectionBarExportIcon}
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
										/>
									</svg>
									Экспорт выбранных
								</button>
							</div>
						</div>
					)}

					<div className={styles.tableWrapper} ref={tableWrapperRef}>
						<table className={styles.table}>
							<thead className={styles.tableHeader}>
								<tr className={styles.tableHeaderRow}>
									<th className={cn(styles.tableHeaderCell, styles.tableHeaderCellIndex)}>
										<OperationCheckbox
											checked={isAllSelected}
											onChange={toggleSelectAll}
										/>
									</th>
									<th className={styles.tableHeaderCell}>
										<button className={styles.tableHeaderButton}>
											Дата
											<svg
												className={styles.tableHeaderIcon}
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' />
											</svg>
										</button>
									</th>
									<th className={styles.tableHeaderCell}>Счет</th>
									<th className={styles.tableHeaderCell}>Тип</th>
									<th className={styles.tableHeaderCell}>Контрагент</th>
									<th className={styles.tableHeaderCell}>Статья</th>
									<th className={styles.tableHeaderCell}>Сделка</th>
									<th className={cn(styles.tableHeaderCell, styles.tableHeaderCellRight)}>Сумма</th>
									<th className={cn(styles.tableHeaderCell, styles.tableHeaderCellActions)}></th>
								</tr>
							</thead>
							<tbody style={{ backgroundColor: 'white' }}>
								{isLoadingOperations ? (
									<tr className={styles.emptyRow}>
										<td colSpan='9' className={styles.emptyCell}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem' }}>
												<div className={styles.loadingSpinner} />
												<span>Загрузка данных...</span>
											</div>
										</td>
									</tr>
								) : allOperations.length === 0 ? (
									<tr className={styles.emptyRow}>
										<td colSpan='9' className={styles.emptyCell}>
											Нет данных
										</td>
									</tr>
								) : (
									<>
										{/* Сегодня - Section Header */}
										{operationsList?.today?.length > 0 && (
											<tr className={styles.sectionHeader}>
												<td colSpan='9' className={styles.sectionHeaderCell}>
													<h3 className={styles.sectionHeaderTitle}>Сегодня</h3>
												</td>
											</tr>
										)}

										{operationsList?.today?.map(op => (
											<OperationTableRow
												key={op.guid}
												op={op}
												selectedOperations={selectedOperations}
												toggleOperation={toggleOperation}
												openOperationModal={openOperationModal}
												handleEditOperation={handleEditOperation}
												handleDeleteOperation={handleDeleteOperation}
												handleCopyOperation={handleCopyOperation}
											/>
										))}
										{/* Вчера и ранее - Section Header */}
										{operationsList?.before?.length > 0 && (
											<tr className={styles.sectionHeader}>
												<td colSpan='9' className={styles.sectionHeaderCell}>
													<h3 className={styles.sectionHeaderTitle}>Вчера и ранее</h3>
												</td>
											</tr>
										)}
										{operationsList?.before?.map(op => (
											<OperationTableRow
												key={op.guid}
												op={op}
												selectedOperations={selectedOperations}
												toggleOperation={toggleOperation}
												openOperationModal={openOperationModal}
												handleEditOperation={handleEditOperation}
												handleDeleteOperation={handleDeleteOperation}
												handleCopyOperation={handleCopyOperation}
											/>
										))}

									</>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Loading indicator at the bottom outside the table */}
				{/* {isFetchingNextPage && (
					<div className={styles.loadingMore}>
						<div className={styles.loadingSpinner}></div>
						<span>Загрузка...</span>
					</div>
				)} */}


				<OperationsFooter totalSummary={totalSummary} isFilterOpen={isFilterOpen} />

			</div>

			{/* Right Side Modal */}
			{openModal && (
				<OperationModal
					operation={openModal}
					initialTab={modalType}
					isClosing={isModalClosing}
					isOpening={isModalOpening}
					onClose={closeOperationModal}
					onSuccess={() => {
						queryClient.invalidateQueries({ queryKey: ['find_operations'] })
						queryClient.invalidateQueries({ queryKey: ['dashboard'] })
					}}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				operation={operationToDelete}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				isDeleting={isShipmentDeleting ? isDeletingShipment : deleteOperationMutation.isPending}
			/>

			{showShipmentModal && (
				<CreateShipment
					open={showShipmentModal}
					onClose={() => setShowShipmentModal(false)}
					initialData={selectedShipment}
					isEditing={isShipmentEditing}
					isCopying={isShipmentCopying}
					dealName={selectedShipment?.selling_deal_name}
					dealGuid={selectedShipment?.selling_deal_id}
					kontragentId={selectedShipment?.counterparties_id}
				/>
			)}
		</div>
	)
})


export default OperationsPage
'use client'

import { useState, useRef, useEffect, Fragment, useMemo } from 'react'
import { cn } from '@/app/lib/utils'
import {
	useCounterpartiesPlanFact,
	useCounterpartiesGroupsPlanFact,
	useMyAccountsV2,
	useLegalEntitiesPlanFact,
	useOperationsList,
	useDeleteOperation,
} from '@/hooks/useDashboard'
import { OperationsFiltersSidebar } from '@/components/operations/OperationsFiltersSidebar/OperationsFiltersSidebar'
import { OperationsHeader } from '@/components/operations/OperationsHeader/OperationsHeader'
import { OperationsFooter } from '@/components/operations/OperationsFooter/OperationsFooter'
import { OperationModal } from '@/components/operations/OperationModal/OperationModal'
import { OperationMenu } from '@/components/operations/OperationsTable/OperationMenu'
import { DeleteConfirmModal } from '@/components/operations/OperationsTable/DeleteConfirmModal'
import styles from './operations.module.scss'

export default function OperationsPage() {
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
	const [selectedFilters, setSelectedFilters] = useState({
		postupleniye: true,
		vyplata: true,
		peremeshcheniye: true,
		nachisleniye: true,
		otmena: true,
		postavka: true,
	})

	const [dateFilters, setDateFilters] = useState({
		podtverzhdena: true,
		nePodtverzhdena: true,
	})

	const [dateStartFilters, setDateStartFilters] = useState({
		podtverzhdena: true,
		nePodtverzhdena: true,
	})

	const [selectedDatePaymentRange, setSelectedDatePaymentRange] = useState(null)
	const [selectedDateStartRange, setSelectedDateStartRange] = useState(null)
	const [selectedLegalEntities, setSelectedLegalEntities] = useState({}) // Will store legal entity GUIDs
	const [selectedCounterAgents, setSelectedCounterAgents] = useState({})
	const [selectedFinancialAccounts, setSelectedFinancialAccounts] = useState({})

	// Build filters object for API request using correct API keys
	const filtersForAPI = useMemo(() => {
		const filters = {}

		// Type filters - tip is an array in API, so we build array of selected types
		const selectedTypes = []
		if (selectedFilters.postupleniye) selectedTypes.push('Поступление')
		if (selectedFilters.vyplata) selectedTypes.push('Выплата')
		if (selectedFilters.peremeshcheniye) selectedTypes.push('Перемещение')
		if (selectedFilters.nachisleniye) selectedTypes.push('Начисление')
		if (selectedFilters.otmena) selectedTypes.push('Отмена')
		if (selectedFilters.postavka) selectedTypes.push('Поставка')

		// Only add tip filter if not all types are selected (to avoid unnecessary filtering)
		if (selectedTypes.length > 0 && selectedTypes.length < 6) {
			filters.tip = selectedTypes
		}

		// Payment confirmation filter - oplata_podtverzhdena
		if (!dateFilters.podtverzhdena && !dateFilters.nePodtverzhdena) {
			// Both unchecked - don't filter
		} else if (dateFilters.podtverzhdena && !dateFilters.nePodtverzhdena) {
			filters.oplata_podtverzhdena = true
		} else if (!dateFilters.podtverzhdena && dateFilters.nePodtverzhdena) {
			filters.oplata_podtverzhdena = false
		}
		// If both are checked, don't add filter (show all)

		// Date ranges - API doesn't support date range filtering
		// We'll filter on frontend after receiving data
		// Commenting out date filters for now
		/*
    if (selectedDatePaymentRange?.start && selectedDatePaymentRange.start !== '') {
      filters.data_operatsii = selectedDatePaymentRange.start
    }
    
    if (selectedDateStartRange?.start && selectedDateStartRange.start !== '') {
      filters.data_nachisleniya = selectedDateStartRange.start
    }
    */

		// Counter agents - counterparties_id (array of IDs)
		const selectedCounterAgentGuids = Object.keys(selectedCounterAgents).filter(
			guid => selectedCounterAgents[guid],
		)
		if (selectedCounterAgentGuids.length > 0) {
			filters.counterparties_id = selectedCounterAgentGuids
		}

		// Financial accounts (chart of accounts) - chart_of_accounts_id (array of IDs)
		const selectedFinancialAccountGuids = Object.keys(selectedFinancialAccounts).filter(
			guid => selectedFinancialAccounts[guid],
		)
		if (selectedFinancialAccountGuids.length > 0) {
			filters.chart_of_accounts_id = selectedFinancialAccountGuids
		}

		return filters
	}, [
		selectedFilters,
		dateFilters,
		selectedDatePaymentRange,
		selectedDateStartRange,
		selectedCounterAgents,
		selectedFinancialAccounts,
	])

	// Log filters for debugging
	useEffect(() => {
		console.log('Filters for API:', filtersForAPI)
	}, [filtersForAPI])

	// Reset pagination when filters change
	useEffect(() => {
		setPage(1)
		setAllOperations([])
		setHasMore(true)
	}, [
		selectedFilters,
		dateFilters,
		selectedDatePaymentRange,
		selectedDateStartRange,
		selectedLegalEntities,
		selectedCounterAgents,
		selectedFinancialAccounts,
	])

	// Fetch data from API - using V2 endpoints
	const { data: counterAgentsData } = useCounterpartiesPlanFact({
		page: 1,
		limit: 100,
	})
	const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact({
		page: 1,
		limit: 100,
	})
	const { data: legalEntitiesData } = useLegalEntitiesPlanFact({
		page: 1,
		limit: 100,
	})
	
	// Pagination state
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [allOperations, setAllOperations] = useState([])
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const limit = 20
	const tableWrapperRef = useRef(null)
	
	const { data: operationsListData, isLoading: isLoadingOperations, isFetching } = useOperationsList({
		date_range: {
			start_date: '2026-01-01',
			end_date: '2026-12-31',
		},
		page: page,
		limit: limit,
	})

	console.log('operationsListData => ', operationsListData)
	
	// Update operations when new data arrives
	useEffect(() => {
		if (operationsListData?.data?.data?.data) {
			const newOps = operationsListData.data.data.data
			
			// Only update if we actually have new data
			if (newOps.length === 0) return
			
			if (page === 1) {
				// First page - replace all operations
				setAllOperations(newOps)
			} else {
				// Subsequent pages - append to existing operations
				setAllOperations(prev => {
					// Avoid duplicates by checking if operations already exist
					const existingGuids = new Set(prev.map(op => op.guid))
					const uniqueNewOps = newOps.filter(op => !existingGuids.has(op.guid))
					
					// Only append if we have new unique operations
					if (uniqueNewOps.length > 0) {
						return [...prev, ...uniqueNewOps]
					}
					return prev
				})
			}
			
			// Check if there are more pages
			if (newOps.length < limit) {
				setHasMore(false)
			}
			setIsLoadingMore(false)
		}
	}, [operationsListData, page, limit])
	
	// Infinite scroll handler
	useEffect(() => {
		const tableWrapper = tableWrapperRef.current
		if (!tableWrapper) return
		
		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = tableWrapper
			// Load more when scrolled to the bottom (with small threshold)
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
			
			if (isAtBottom && hasMore && !isLoadingOperations && !isLoadingMore) {
				setIsLoadingMore(true)
				setPage(prev => prev + 1)
			}
		}
		
		tableWrapper.addEventListener('scroll', handleScroll)
		return () => tableWrapper.removeEventListener('scroll', handleScroll)
	}, [hasMore, isLoadingOperations, isLoadingMore])

	// Extract and transform data from API responses - build tree structure for filter
	const counterAgents = useMemo(() => {
		const counterparties = counterAgentsData?.data?.data?.data || []
		const groups = counterpartiesGroupsData?.data?.data?.data || []

		// Create a map of groups by guid
		const groupsMap = new Map()
		groups.forEach(group => {
			groupsMap.set(group.guid, group)
		})

		// Build flat list for filter sidebar (backward compatibility)
		return counterparties.map(item => ({
			guid: item.guid,
			label: item.nazvanie || '',
			group: item.counterparties_group_id_data?.nazvanie_gruppy || 'Без группы',
		}))
	}, [counterAgentsData, counterpartiesGroupsData])

	// Extract operations list from API response (v2/items/operations format)
	const operationsItems = allOperations

	// Filter operations by date ranges on frontend (since API doesn't support it)
	const filteredOperationsItems = useMemo(() => {
		if (!operationsItems || operationsItems.length === 0) return []

		return operationsItems.filter(item => {
			// Filter by data_operatsii range
			if (selectedDatePaymentRange?.start || selectedDatePaymentRange?.end) {
				const operationDate = item.data_operatsii ? new Date(item.data_operatsii) : null
				if (!operationDate) return false

				if (selectedDatePaymentRange.start) {
					const startDate = new Date(selectedDatePaymentRange.start)
					if (operationDate < startDate) return false
				}

				if (selectedDatePaymentRange.end) {
					const endDate = new Date(selectedDatePaymentRange.end)
					if (operationDate > endDate) return false
				}
			}

			// Filter by data_nachisleniya range
			if (selectedDateStartRange?.start || selectedDateStartRange?.end) {
				const accrualDate = item.data_nachisleniya ? new Date(item.data_nachisleniya) : null
				if (!accrualDate) return false

				if (selectedDateStartRange.start) {
					const startDate = new Date(selectedDateStartRange.start)
					if (accrualDate < startDate) return false
				}

				if (selectedDateStartRange.end) {
					const endDate = new Date(selectedDateStartRange.end)
					if (accrualDate > endDate) return false
				}
			}

			return true
		})
	}, [operationsItems, selectedDatePaymentRange, selectedDateStartRange])

	// Transform operations data for display
	const operations = useMemo(() => {
		if (!filteredOperationsItems || filteredOperationsItems.length === 0) return []

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		return filteredOperationsItems.map((item, index) => {
			const operationDate = item.data_operatsii ? new Date(item.data_operatsii) : null
			const accrualDate = item.data_nachisleniya ? new Date(item.data_nachisleniya) : null

			// Determine section based on date
			let section = 'yesterday'
			if (operationDate) {
				const opDate = new Date(operationDate)
				opDate.setHours(0, 0, 0, 0)
				const diffTime = today - opDate
				const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

				if (diffDays === 0) {
					section = 'today'
				} else if (diffDays === 1) {
					section = 'yesterday'
				}
			}

			// Determine operation type from tip array
			let type = 'out'
			let typeLabel = 'Выплата'
			if (item.tip && Array.isArray(item.tip)) {
				if (item.tip.includes('Поступление')) {
					type = 'in'
					typeLabel = 'Поступление'
				} else if (item.tip.includes('Перемещение')) {
					type = 'transfer'
					typeLabel = 'Перемещение'
				} else if (item.tip.includes('Начисление')) {
					type = 'transfer'
					typeLabel = 'Начисление'
				} else if (item.tip.includes('Выплата')) {
					type = 'out'
					typeLabel = 'Выплата'
				} else {
					// Use first type from array
					typeLabel = item.tip[0] || 'Выплата'
				}
			}

			// Format dates
			const formatDate = date => {
				if (!date) return ''
				try {
					const d = new Date(date)
					const months = [
						'янв',
						'фев',
						'мар',
						'апр',
						'май',
						'июн',
						'июл',
						'авг',
						'сен',
						'окт',
						'ноя',
						'дек',
					]
					return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
				} catch {
					return ''
				}
			}

			// Format amount
			const amount = item.summa || 0
			const amountFormatted = amount.toLocaleString('ru-RU')

			// Get type text from tip array
			const typeText = typeLabel

			return {
				id: item.guid || index,
				guid: item.guid,
				type: typeText,
				typeCategory: type, // 'in', 'out', 'transfer'
				typeLabel: typeLabel,
				accrualDate: formatDate(accrualDate),
				operationDate: formatDate(operationDate),
				paymentConfirmed: item.oplata_podtverzhdena,
				payment_confirmed: item.payment_confirmed, // Добавляем новое поле
				payment_accrual: item.payment_accrual, // Добавляем новое поле
				amount: amountFormatted,
				amountRaw: amount,
				currency: item.currenies_kod || item.currenies_id_data?.nazvanie || '',
				currencyId: item.currenies_id || null,
				description: item.opisanie || '',
				chartOfAccounts: item.chart_of_accounts_id_data?.nazvanie || item.chart_of_accounts_name || '',
				chartOfAccountsId: item.chart_of_accounts_id || null,
				bankAccount: item.my_accounts_name || '',
				bankAccountId: item.my_accounts_id || null,
				counterparty: item.counterparties_name || '',
				counterpartyId: item.counterparties_id || null,
				createdAt: formatDate(item.data_sozdaniya ? new Date(item.data_sozdaniya) : null),
				createdAtRaw: item.data_sozdaniya,
				updatedAt: formatDate(item.data_obnovleniya ? new Date(item.data_obnovleniya) : null),
				updatedAtRaw: item.data_obnovleniya,
				section: section,
				rawData: item,
			}
		})
	}, [filteredOperationsItems])

	const [isDatePaymentModalOpen, setIsDatePaymentModalOpen] = useState(false)
	const [isDateStartModalOpen, setIsDateStartModalOpen] = useState(false)
	const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0))
	const [activeInput, setActiveInput] = useState(null) // 'start' or 'end'
	const [tempStartDate, setTempStartDate] = useState(null)
	const [tempEndDate, setTempEndDate] = useState(null)
	const [isClosing, setIsClosing] = useState(false)
	const datePickerRef = useRef(null)
	const dateStartPickerRef = useRef(null)
	const [openParameterDropdown, setOpenParameterDropdown] = useState(null)
	const parameterDropdownRef = useRef(null)

	const closeDatePaymentModal = () => {
		setIsClosing(true)
		setTimeout(() => {
			setIsDatePaymentModalOpen(false)
			setIsClosing(false)
			setActiveInput(null)
		}, 200)
	}

	const closeDateStartModal = () => {
		setIsClosing(true)
		setTimeout(() => {
			setIsDateStartModalOpen(false)
			setIsClosing(false)
			setActiveInput(null)
		}, 200)
	}

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				datePickerRef.current &&
				!datePickerRef.current.contains(event.target) &&
				dateStartPickerRef.current &&
				!dateStartPickerRef.current.contains(event.target)
			) {
				closeDatePaymentModal()
				closeDateStartModal()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const [selectedOperations, setSelectedOperations] = useState([])
	const [expandedRows, setExpandedRows] = useState([])
	const [openModal, setOpenModal] = useState(null)
	const [modalType, setModalType] = useState(null)
	const [isModalClosing, setIsModalClosing] = useState(false)
	const [isModalOpening, setIsModalOpening] = useState(false)
	const [operationToDelete, setOperationToDelete] = useState(null)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

	const toggleSelectAll = () => {
		if (selectedOperations.length === operations.length) {
			setSelectedOperations([])
		} else {
			setSelectedOperations(operations.map(op => op.id))
		}
	}

	const isAllSelected = operations.length > 0 && selectedOperations.length === operations.length

	const toggleExpand = id => {
		setExpandedRows(prev =>
			prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id],
		)
	}

	const openOperationModal = operation => {
		setOpenModal(operation)
		setIsModalClosing(false)
		setIsModalOpening(true)
		// Блокируем скролл страницы
		// document.body.style.overflow = 'hidden'
		// Определяем тип модалки по типу операции
		if (operation.typeCategory === 'transfer') {
			setModalType('accrual')
		} else if (operation.typeCategory === 'out') {
			setModalType('payment')
		} else if (operation.typeCategory === 'in') {
			setModalType('income')
		} else {
			setModalType('payment')
		}
		// Запускаем анимацию появления
		setTimeout(() => {
			setIsModalOpening(false)
		}, 50)
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
		openOperationModal(operation)
	}

	const handleDeleteOperation = operation => {
		setOperationToDelete(operation)
		setIsDeleteModalOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!operationToDelete) return

		const guid = operationToDelete.rawData?.guid || operationToDelete.guid
		if (!guid) {
			console.error('GUID операции не найден')
			return
		}

		try {
			await deleteOperationMutation.mutateAsync([guid])
			setIsDeleteModalOpen(false)
			setOperationToDelete(null)
		} catch (error) {
			console.error('Error deleting operation:', error)
		}
	}

	const handleDeleteCancel = () => {
		setIsDeleteModalOpen(false)
		setOperationToDelete(null)
	}

	const selectedTotal = useMemo(() => {
		return operations
			.filter(op => selectedOperations.includes(op.id))
			.reduce((sum, op) => {
				const amount = op.rawData?.summa || 0
				return sum + amount
			}, 0)
	}, [operations, selectedOperations])

	const toggleFilter = (category, key) => { 
		if (category === 'type') {
			setSelectedFilters(prev => {
				const newValue = !prev[key]
				console.log('Updating filter:', { key, oldValue: prev[key], newValue })
				return { ...prev, [key]: newValue }
			})
		} else if (category === 'date') {
			setDateFilters(prev => ({ ...prev, [key]: !prev[key] }))
		} else if (category === 'dateStart') {
			setDateStartFilters(prev => ({ ...prev, [key]: !prev[key] }))
		}
	}

	const handleLegalEntityToggle = guid => {
		setSelectedLegalEntities(prev => ({ ...prev, [guid]: !prev[guid] }))
	}

	const handleSelectAllLegalEntities = () => {
		const legalEntities = legalEntitiesData?.data?.data?.data || []
		const allLegalEntityGuids = legalEntities.map(le => le.guid)
		const allSelected = allLegalEntityGuids.every(guid => selectedLegalEntities[guid])

		if (allSelected) {
			setSelectedLegalEntities({})
		} else {
			const newSelected = {}
			legalEntities.forEach(le => (newSelected[le.guid] = true))
			setSelectedLegalEntities(newSelected)
		}
	}

	const handleSelectAllCounterAgents = () => {
		// Check if all counter agents are already selected
		const allCounterAgentGuids = counterAgents.map(ca => ca.guid)
		const allSelected = allCounterAgentGuids.every(guid => selectedCounterAgents[guid])

		if (allSelected) {
			// If all are selected, deselect all
			setSelectedCounterAgents({})
		} else {
			// If not all are selected, select all
			const newSelected = {}
			counterAgents.forEach(ca => (newSelected[ca.guid] = true))
			setSelectedCounterAgents(newSelected)
		}
	}

	const handleCounterAgentToggle = guid => {
		setSelectedCounterAgents(prev => ({ ...prev, [guid]: !prev[guid] }))
	}
 

	return (
		<div className={styles.container}>
			{/* Sidebar Filters */}
			<OperationsFiltersSidebar
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
				selectedFilters={selectedFilters}
				onFilterChange={toggleFilter}
				dateFilters={dateFilters}
				onDateFilterChange={key => toggleFilter('date', key)}
				dateStartFilters={dateStartFilters}
				onDateStartFilterChange={key => toggleFilter('dateStart', key)}
				selectedDatePaymentRange={selectedDatePaymentRange}
				onDatePaymentRangeChange={setSelectedDatePaymentRange}
				selectedDateStartRange={selectedDateStartRange}
				onDateStartRangeChange={setSelectedDateStartRange}
				legalEntities={legalEntitiesData?.data?.data?.data || []}
				selectedLegalEntities={selectedLegalEntities}
				onLegalEntityToggle={handleLegalEntityToggle}
				onSelectAllLegalEntities={handleSelectAllLegalEntities}
				counterAgents={counterAgents}
				selectedCounterAgents={selectedCounterAgents}
				onCounterAgentToggle={handleCounterAgentToggle}
				onSelectAllCounterAgents={handleSelectAllCounterAgents}
			/>

			{/* Main Content */}
			<div className={styles.mainContent}>
				{/* Header */}
				<OperationsHeader
					isFilterOpen={isFilterOpen}
					onFilterToggle={() => setIsFilterOpen(true)}
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
				/>

				{/* Table */}
				<div className={styles.tableArea}>
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
										<input
											type='checkbox'
											checked={isAllSelected}
											onChange={toggleSelectAll}
											className={styles.tableCheckbox}
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
									<th className={styles.tableHeaderCell}>Проект</th>
									<th className={cn(styles.tableHeaderCell, styles.tableHeaderCellRight)}>Сумма</th>
									<th className={cn(styles.tableHeaderCell, styles.tableHeaderCellActions)}></th>
								</tr>
							</thead>
							<tbody style={{ backgroundColor: 'white' }}>
								{isLoadingOperations ? (
									<tr className={styles.emptyRow}>
										<td colSpan='9' className={styles.emptyCell}>
											Загрузка данных...
										</td>
									</tr>
								) : operations.length === 0 ? (
									<tr className={styles.emptyRow}>
										<td colSpan='9' className={styles.emptyCell}>
											Нет данных
										</td>
									</tr>
								) : (
									<>
										{/* Сегодня - Section Header */}
										{operations.filter(op => op.section === 'today').length > 0 && (
											<tr className={styles.sectionHeader}>
												<td colSpan='9' className={styles.sectionHeaderCell}>
													<h3 className={styles.sectionHeaderTitle}>Сегодня</h3>
												</td>
											</tr>
										)}

										{/* Today Operations */}
										{operations
											.filter(op => op.section === 'today')
											.map((op, index) => (
												<tr
													key={op.id}
													className={styles.tableRow}
													onClick={e => {
														if (!e.target.closest('input') && !e.target.closest('button')) {
															openOperationModal(op)
														}
													}}
												>
													<td className={cn(styles.tableCell, styles.tableCellIndex)}>
														<input
															type='checkbox'
															checked={selectedOperations.includes(op.id)}
															onChange={() => toggleOperation(op.id)}
															className={styles.tableCheckbox}
															onClick={e => e.stopPropagation()}
														/>
													</td>
													<td className={styles.tableCell}>{op.operationDate || '-'}</td>
													<td className={cn(styles.tableCell, styles.accountCell)}>
														{op.bankAccount || '-'}
													</td>
													<td className={styles.tableCell}>
														{op.typeLabel ? (
															<div className={styles.typeIcon}>
																{op.typeLabel === 'Поступление' ? (
															<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#065986" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/></svg>
																) : op.typeLabel === 'Выплата' ? (
															<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.33325 10H16.6666M16.6666 10L11.6666 5M16.6666 10L11.6666 15" stroke="#F04438" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/></svg>
																) : (op.typeLabel === 'Перемещение' || op.typeLabel === 'Начисление') ? (
															<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6666 14.1667H3.33325M3.33325 14.1667L6.66659 10.8333M3.33325 14.1667L6.66658 17.5M3.33325 5.83333H16.6666M16.6666 5.83333L13.3333 2.5M16.6666 5.83333L13.3333 9.16667" stroke="#1D2939" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/></svg>
																) : null}
															</div>
														) : null}
													</td>
													<td className={cn(styles.tableCell, styles.counterpartyCell)}>
														{op.counterparty || '-'}
													</td>
													<td className={cn(styles.tableCell, styles.statusCell)}>
														{op.chartOfAccounts || '-'}
													</td>
													<td className={styles.tableCell}>-</td>
													<td
														className={cn(
															styles.tableCell,
															styles.amountCell,
															op.typeCategory === 'in' && styles.positive,
															op.typeCategory === 'out' && styles.negative,
															op.typeCategory === 'transfer' && styles.neutral,
														)}
													>
														<div className={styles.amountWithIcons}>
															{/* Debit icon (Дебет) - показываем если payment_confirmed = true, но не показываем если оба true */}
															{op.payment_confirmed && !(op.payment_confirmed && op.payment_accrual) && (
																<svg width="22" height="27" viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.debitIcon}>
																	<rect width="22" height="27" rx="6" fill="#1E98AD"/>
																	<path d="M6.80096 20.1136V17.0625H7.36346C7.55664 16.8864 7.73846 16.6378 7.90891 16.3168C8.08221 15.9929 8.22852 15.5611 8.34783 15.0213C8.46999 14.4787 8.55096 13.7898 8.59073 12.9545L8.77823 9.27273H13.9601V17.0625H14.9657V20.0966H13.9601V18H7.80664V20.1136H6.80096ZM8.62482 17.0625H12.9544V10.2102H9.73278L9.59641 12.9545C9.56232 13.5909 9.50266 14.1676 9.41744 14.6847C9.33221 15.1989 9.22283 15.6548 9.08931 16.0526C8.95579 16.4474 8.80096 16.7841 8.62482 17.0625Z" fill="#FCFCFD"/>
																</svg>
															)}
															{/* Credit icon (Кредит) - показываем если payment_accrual = true, но не показываем если оба true */}
															{op.payment_accrual && !(op.payment_confirmed && op.payment_accrual) && (
																<svg width="22" height="27" viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.creditIcon}>
																	<rect width="22" height="27" rx="6" fill="#6C64BC"/>
																	<path d="M8.05682 18V9.27273H9.11364V13.6023H9.21591L13.1364 9.27273H14.517L10.8523 13.2102L14.517 18H13.2386L10.2045 13.9432L9.11364 15.1705V18H8.05682Z" fill="#FCFCFD"/>
																</svg>
															)}
															<span className={styles.amountText}>{op.amount}</span>
														</div>
													</td>
													<td
														className={cn(styles.tableCell, styles.tableCellActions)}
														onClick={e => e.stopPropagation()}
													>
														<OperationMenu
															operation={op}
															onEdit={handleEditOperation}
															onDelete={handleDeleteOperation}
														/>
													</td>
												</tr>
											))}

										{/* Вчера и ранее - Section Header */}
										{operations.filter(op => op.section === 'yesterday').length > 0 && (
											<tr className={styles.sectionHeader}>
												<td colSpan='9' className={styles.sectionHeaderCell}>
													<h3 className={styles.sectionHeaderTitle}>Вчера и ранее</h3>
												</td>
											</tr>
										)}

										{/* Yesterday Operations */}
										{operations
											.filter(op => op.section === 'yesterday')
											.map((op, index) => (
												<tr
													key={op.id}
													className={styles.tableRow}
													onClick={e => {
														if (!e.target.closest('input') && !e.target.closest('button')) {
															openOperationModal(op)
														}
													}}
												>
													<td className={cn(styles.tableCell, styles.tableCellIndex)}>
														<input
															type='checkbox'
															checked={selectedOperations.includes(op.id)}
															onChange={() => toggleOperation(op.id)}
															className={styles.tableCheckbox}
															onClick={e => e.stopPropagation()}
														/>
													</td>
													<td className={styles.tableCell}>{op.operationDate || '-'}</td>
													<td className={cn(styles.tableCell, styles.accountCell)}>
														{op.bankAccount || '-'}
													</td>
													<td className={styles.tableCell}>
														{op.typeLabel ? (
															<div
																className={cn(
																	styles.typeIcon,
																	op.typeCategory === 'in' && styles.typeIconIn,
																	op.typeCategory === 'out' && styles.typeIconOut,
																	op.typeCategory === 'transfer' && styles.typeIconTransfer,
																)}
															>
																{op.typeCategory === 'in' ? (
															<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#065986" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/></svg>
																) : op.typeCategory === 'out' ? (
																	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
																		<path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#065986" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
																	</svg>
																) : (
															<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6666 14.1667H3.33325M3.33325 14.1667L6.66659 10.8333M3.33325 14.1667L6.66658 17.5M3.33325 5.83333H16.6666M16.6666 5.83333L13.3333 2.5M16.6666 5.83333L13.3333 9.16667" stroke="#1D2939" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/></svg>
																)}
															</div>
														) : null}
													</td>
													<td className={cn(styles.tableCell, styles.counterpartyCell)}>
														{op.counterparty || '-'}
													</td>
													<td className={cn(styles.tableCell, styles.statusCell)}>
														{op.chartOfAccounts || '-'}
													</td>
													<td className={styles.tableCell}>-</td>
													<td
														className={cn(
															styles.tableCell,
															styles.amountCell,
															op.typeCategory === 'in' && styles.positive,
															op.typeCategory === 'out' && styles.negative,
															op.typeCategory === 'transfer' && styles.neutral,
														)}
													>
														<div className={styles.amountWithIcons}>
															{/* Debit icon (Дебет) - показываем если payment_confirmed = true, но не показываем если оба true */}
															{op.payment_confirmed && !(op.payment_confirmed && op.payment_accrual) && (
																<svg width="22" height="27" viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.debitIcon}>
																	<rect width="22" height="27" rx="6" fill="#1E98AD"/>
																	<path d="M6.80096 20.1136V17.0625H7.36346C7.55664 16.8864 7.73846 16.6378 7.90891 16.3168C8.08221 15.9929 8.22852 15.5611 8.34783 15.0213C8.46999 14.4787 8.55096 13.7898 8.59073 12.9545L8.77823 9.27273H13.9601V17.0625H14.9657V20.0966H13.9601V18H7.80664V20.1136H6.80096ZM8.62482 17.0625H12.9544V10.2102H9.73278L9.59641 12.9545C9.56232 13.5909 9.50266 14.1676 9.41744 14.6847C9.33221 15.1989 9.22283 15.6548 9.08931 16.0526C8.95579 16.4474 8.80096 16.7841 8.62482 17.0625Z" fill="#FCFCFD"/>
																</svg>
															)}
															{/* Credit icon (Кредит) - показываем если payment_accrual = true, но не показываем если оба true */}
															{op.payment_accrual && !(op.payment_confirmed && op.payment_accrual) && (
																<svg width="22" height="27" viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.creditIcon}>
																	<rect width="22" height="27" rx="6" fill="#6C64BC"/>
																	<path d="M8.05682 18V9.27273H9.11364V13.6023H9.21591L13.1364 9.27273H14.517L10.8523 13.2102L14.517 18H13.2386L10.2045 13.9432L9.11364 15.1705V18H8.05682Z" fill="#FCFCFD"/>
																</svg>
															)}
															<span className={styles.amountText}>{op.amount}</span>
														</div>
													</td>
													<td
														className={cn(styles.tableCell, styles.tableCellActions)}
														onClick={e => e.stopPropagation()}
													>
														<OperationMenu
															operation={op}
															onEdit={handleEditOperation}
															onDelete={handleDeleteOperation}
														/>
													</td>
												</tr>
											))}
									</>
								)}
							</tbody>
						</table>
						{/* Loading indicator */}
						{(isLoadingMore || (isLoadingOperations && page > 1)) && (
							<div className={styles.loadingMore}>
								<div className={styles.loadingSpinner}></div>
								<span>Загрузка...</span>
							</div>
						)}
						{!hasMore && operations.length > 0 && (
							<div className={styles.noMoreData}>
								Все операции загружены
							</div>
						)}
					</div>
				</div>

				{/* Footer Stats */}
				<OperationsFooter isFilterOpen={isFilterOpen} operations={operations} />
			</div>

			{/* Right Side Modal */}
			{openModal && (
				<OperationModal
					operation={openModal}
					modalType={modalType}
					isClosing={isModalClosing}
					isOpening={isModalOpening}
					onClose={closeOperationModal}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<DeleteConfirmModal
				isOpen={isDeleteModalOpen}
				operation={operationToDelete}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				isDeleting={deleteOperationMutation.isPending}
			/>
		</div>
	)
}

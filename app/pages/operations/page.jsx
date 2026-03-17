'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/app/lib/utils'
import {
	useCounterpartiesGroupsPlanFact,
	useLegalEntitiesPlanFact,
	useOperationsList,
	useDeleteOperation,
	useChartOfAccountsPlanFact,
} from '@/hooks/useDashboard'
import { OperationsFiltersSidebar } from '@/components/operations/OperationsFiltersSidebar/OperationsFiltersSidebar'
import { OperationsHeader } from '@/components/operations/OperationsHeader/OperationsHeader'
import { OperationsFooter } from '@/components/operations/OperationsFooter/OperationsFooter'
import OperationModal from '@/components/operations/OperationModal/OperationModal'
import { DeleteConfirmModal } from '@/components/operations/OperationsTable/DeleteConfirmModal'
import OperationTableRow from '@/components/operations/TableRow'
import styles from './operations.module.scss'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'
import { formatDate } from '../../../utils/formatDate'
import { useBankAccountsPlanFact } from '../../../hooks/useDashboard'
import { formatDateRu } from '../../../utils/helpers'
import { useQueryClient } from '@tanstack/react-query'
import operationsDto from '../../../lib/dtos/operationsDto'

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
	const [selectedFilters, setSelectedFilters] = useState([])

	// Search state
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

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
	const [selectedLegalEntities, setSelectedLegalEntities] = useState([]) // Will store legal entity GUIDs
	const [selectedCounterAgents, setSelectedCounterAgents] = useState([])
	const [amountRange, setAmountRange] = useState({ min: '', max: '' })
	const [selectedChartOfAccounts, setSelectedChartOfAccounts] = useState([])
	const [paymentType, setPaymentType] = useState(null)

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery)
		}, 500)

		return () => clearTimeout(timer)
	}, [searchQuery])

	// No filtering - filters are just UI elements
	const filtersForAPI = useMemo(() => {
		return {} // Empty object - no filters sent to API
	}, [])

	// Log filters for debugging
	useEffect(() => {
		console.log('Filters for API:', filtersForAPI)
	}, [filtersForAPI])


	const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact()

	const { data: legalEntitiesData } = useLegalEntitiesPlanFact({
		page: 1,
		limit: 100,
	})

	const { data: chartOfAccountsData } = useChartOfAccountsPlanFact({
		page: 1,
		limit: 100,
	})

	const { data: myAccountsData } = useBankAccountsPlanFact({
		page: 1,
		limit: 100,
	})

	const leagatEntities = useMemo(() => {
		const data = myAccountsData?.data?.data?.data || []
		return data.map(item => ({
			value: item.guid,
			label: item.nazvanie,
		}))
	}, [myAccountsData])

	const chartOfAccountsOptions = useMemo(() => {
		const rawData = chartOfAccountsData?.data?.data?.data || []
		const flatten = (items) => {
			let result = []
			items.forEach(item => {
				result.push(item)
				if (item.children && item.children.length > 0) {
					result = result.concat(flatten(item.children))
				}
			})
			return result
		}
		const flat = Array.isArray(rawData) ? flatten(rawData) : []
		return flat.map(item => ({
			value: item.guid,
			label: item.nazvanie || 'Без названия',
			group: (Array.isArray(item.tip) && item.tip.length > 0) ? item.tip[0] : 'Без группы'
		}))
	}, [chartOfAccountsData])

	console.log('chartOfAccountsOptions', chartOfAccountsOptions)

	// Pagination state
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [allOperations, setAllOperations] = useState([])
	const [isLoadingMore, setIsLoadingMore] = useState(false)
	const limit = 50
	const tableWrapperRef = useRef(null)


	const requestOperationFilters = useMemo(() => {
		const safeFormatDate = (date) => {
			if (!date) return undefined
			try {
				return formatDate(new Date(date))
			} catch {
				return undefined
			}
		}

		const startDate = safeFormatDate(selectedDatePaymentRange?.start)
		const endDate = safeFormatDate(selectedDatePaymentRange?.end)

		return {
			page: page,
			limit: limit,
			...(debouncedSearchQuery && { search: debouncedSearchQuery.toLowerCase() }),
			...(startDate && endDate && {
				date_range: {
					start_date: startDate,
					end_date: endDate,
				}
			}),
			...(selectedCounterAgents.length > 0 && { counterparties_ids: selectedCounterAgents }),
			...(selectedLegalEntities.length > 0 && { my_accounts_ids: selectedLegalEntities }),
			...(selectedFilters.length > 0 && { tip: selectedFilters }),
			...((amountRange.min !== '' || amountRange.max !== '') && {
				amount_range: {
					...(amountRange.min !== '' && { min: Number(amountRange.min) }),
					...(amountRange.max !== '' && { max: Number(amountRange.max) }),
				}
			}),
			...(selectedChartOfAccounts.length > 0 && { chart_of_accounts_ids: selectedChartOfAccounts }),
			...(paymentType && { payment_type: paymentType }),
			podtverzhdena: dateFilters.podtverzhdena,
			ne_podtverzhdena: dateFilters.nePodtverzhdena,
		}
	}, [page, limit, debouncedSearchQuery, selectedLegalEntities, selectedCounterAgents, selectedFilters, selectedDatePaymentRange, amountRange, selectedChartOfAccounts, dateFilters, paymentType])

	const { data: operationsListData, isLoading: isLoadingOperations, isFetching } = useOperationsList(requestOperationFilters)


	// Reset pagination when filters change
	useEffect(() => {
		setPage(1)
		setHasMore(true)
		setAllOperations([])
	}, [debouncedSearchQuery, selectedLegalEntities, selectedCounterAgents, selectedFilters, selectedDatePaymentRange, amountRange, selectedChartOfAccounts, dateFilters, paymentType])

	// Update operations when new data arrives
	useEffect(() => {
		if (operationsListData?.data?.data?.data !== undefined) {
			const newOps = operationsListData.data.data.data || []

			if (page === 1) {
				// First page - replace all operations (even if empty)
				setAllOperations(newOps)
			} else {
				// Only update if we actually have new data for appended pages
				if (newOps.length === 0) {
					setHasMore(false)
					setIsLoadingMore(false)
					return
				}
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
			setHasMore(newOps.length === limit)
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


	// Extract and transform data from API responses - use groups with children
	const counterAgents = useMemo(() => {
		const groups = counterpartiesGroupsData?.data?.data?.data || []

		const hasChildren = groups.filter(item => item.children && item.children.length > 0)

		return hasChildren.map(item => [
			{ value: '', label: item.nazvanie_gruppy, group: item.nazvanie_gruppy },
			...(item.children || []).map(child => ({
				value: child.guid,
				label: child.nazvanie || '',
				group: item.nazvanie_gruppy
			}))
		]).flat()
	}, [counterpartiesGroupsData])



	// Transform operations data for display
	const operations = useMemo(() => {
		if (!allOperations || allOperations.length === 0) return []

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		return allOperations.map((item, index) => {
			const operationDate = item.data_operatsii ? new Date(item.data_operatsii) : null
			const accrualDate = item.data_nachisleniya ? new Date(item.data_nachisleniya) : null

			// operation_parts

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
				accrualDate: formatDateRu(accrualDate),
				operationDate: formatDateRu(operationDate),
				paymentConfirmed: item.oplata_podtverzhdena,
				payment_confirmed: item.payment_confirmed !== undefined
					? item.payment_confirmed
					: (item.oplata_podtverzhdena !== undefined ? item.oplata_podtverzhdena : false),
				payment_accrual: item.payment_accrual !== undefined
					? item.payment_accrual
					: false,
				amount: amountFormatted,
				amountRaw: amount,
				currency: item.currenies_kod || item.currenies_id_data?.nazvanie || '',
				currencyId: item.currenies_id || null,
				description: item.opisanie || '',
				chartOfAccounts: item.chart_of_accounts_id_data?.nazvanie || item.chart_of_accounts_name || '',
				chartOfAccountsId: item.chart_of_accounts_id || null,
				bankAccount: item.my_accounts_name || '',
				bankAccount2: item.my_accounts_name_2 || '',
				bankAccountId: item.my_accounts_id || null,
				counterparty: item.counterparties_name || '',
				counterpartyId: item.counterparties_id || null,
				createdAt: formatDate(item.data_sozdaniya ? new Date(item.data_sozdaniya) : null),
				createdAtRaw: item.data_sozdaniya,
				updatedAt: formatDate(item.data_obnovleniya ? new Date(item.data_obnovleniya) : null),
				updatedAtRaw: item.data_obnovleniya,
				section: section,
				rawData: item,
				operationParts: item.operation_parts?.map(part => ({
					...part,
					tip: part.tip?.[0],
					typeCategory: part.tip?.[0] === 'Поступление' ? 'in' : part.tip?.[0] === 'Выплата' ? 'out' : 'transfer',
					amount: part?.summa?.toLocaleString('ru-RU'),
					amountFormatted: part.summa.toLocaleString('ru-RU'),
					currency: part.currenies_kod || part.currenies_id_data?.nazvanie || '',
					currencyId: part.currenies_id || null,
					description: part.opisanie || '',
					chartOfAccounts: part.chart_of_accounts_id_data?.nazvanie || part.chart_of_accounts_name || '',
					chartOfAccountsId: part.chart_of_accounts_id || null,
					bankAccount: part.my_accounts_name || '',
					bankAccount2: part.my_accounts_name_2 || '',
					bankAccountId: part.my_accounts_id || null,
					counterparty: part.counterparties_name || '',
					counterpartyId: part.counterparties_id || null,
					data_nachisleniya: part?.data_nachisleniya,
					accrualDate: formatDateRu(part?.data_nachisleniya),
					operationDate: formatDateRu(part?.data_operatsii),
					createdAt: formatDate(part.data_sozdaniya ? new Date(part.data_sozdaniya) : null),
					createdAtRaw: part.data_sozdaniya,
					updatedAt: formatDate(part.data_obnovleniya ? new Date(part.data_obnovleniya) : null),
					updatedAtRaw: part.data_obnovleniya,
					section: section,
					payment_confirmed: part.payment_confirmed !== undefined
						? part.payment_confirmed
						: (part.oplata_podtverzhdena !== undefined ? part.oplata_podtverzhdena : false),
					payment_accrual: part.payment_accrual !== undefined
						? part.payment_accrual
						: false,
				}))
			}
		})
	}, [allOperations])

	const operationsList = useMemo(() => {
		return {
			today: operationsDto(operationsListData?.data?.data?.data || [], 'today'),
			before: operationsDto(operationsListData?.data?.data?.data || [], 'before'),
		}
	}, [operationsListData])

	const [isDatePaymentModalOpen, setIsDatePaymentModalOpen] = useState(false)
	const [isDateStartModalOpen, setIsDateStartModalOpen] = useState(false)
	const [activeInput, setActiveInput] = useState(null) // 'start' or 'end'
	const [isClosing, setIsClosing] = useState(false)
	const datePickerRef = useRef(null)
	const dateStartPickerRef = useRef(null)

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
	const queryClient = useQueryClient()

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
		setOperationToDelete(operation)
		setIsDeleteModalOpen(true)
	}

	const handleCopyOperation = operation => {
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
			await deleteOperationMutation.mutateAsync([guid])
			setIsDeleteModalOpen(false)
			setOperationToDelete(null)
			queryClient.invalidateQueries({ queryKey: ['dashboard'] })
			queryClient.invalidateQueries({ queryKey: ['operationsList'] })
			queryClient.invalidateQueries({ queryKey: ['operations'] })
			queryClient.invalidateQueries({ queryKey: ['get_counterparty_by_id'] })
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

	const toggleFilter = (category, key, forceValue) => {
		if (category === 'type') {
			setSelectedFilters(prev => {
				const arr = prev || []
				const shouldAdd = forceValue !== undefined ? forceValue : !arr.includes(key)
				if (shouldAdd) {
					return arr.includes(key) ? arr : [...arr, key]
				} else {
					return arr.filter(v => v !== key)
				}
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
				legalEntities={leagatEntities}
				selectedLegalEntities={selectedLegalEntities}
				onLegalEntityToggle={setSelectedLegalEntities}
				onSelectAllLegalEntities={handleSelectAllLegalEntities}
				counterAgents={counterAgents}
				selectedCounterAgents={selectedCounterAgents}
				onCounterAgentToggle={setSelectedCounterAgents}
				onSelectAllCounterAgents={handleSelectAllCounterAgents}
				amountRange={amountRange}
				onAmountRangeChange={setAmountRange}
				isLoading={isLoadingOperations || isFetching}
				chartOfAccountsOptions={chartOfAccountsOptions}
				selectedChartOfAccounts={selectedChartOfAccounts}
				onChartOfAccountsChange={setSelectedChartOfAccounts}
				paymentType={paymentType}
				onPaymentTypeChange={setPaymentType}
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
					onSearchChange={setSearchQuery}
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
									<th className={styles.tableHeaderCell}>Проект</th>
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
												{/* {operations
											.filter(op => op.section === 'today')
													.map(op => (
												<OperationTableRow
													key={op.id}
													op={op}
													selectedOperations={selectedOperations}
													toggleOperation={toggleOperation}
													openOperationModal={openOperationModal}
													handleEditOperation={handleEditOperation}
													handleDeleteOperation={handleDeleteOperation}
													handleCopyOperation={handleCopyOperation}
												/>
											))} */}

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
										{operations.filter(op => op.section === 'yesterday').length > 0 && (
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

										{/* Yesterday Operations */}
												{/* {operations
											.filter(op => op.section === 'yesterday')
													.map(op => (
														<OperationTableRow
													key={op.id}
													op={op}
													selectedOperations={selectedOperations}
													toggleOperation={toggleOperation}
													openOperationModal={openOperationModal}
													handleEditOperation={handleEditOperation}
													handleDeleteOperation={handleDeleteOperation}
													handleCopyOperation={handleCopyOperation}
												/>
											))} */}
									</>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Loading indicator at the bottom outside the table */}
				{isLoadingMore && page > 1 && (
					<div className={styles.loadingMore}>
						<div className={styles.loadingSpinner}></div>
						<span>Загрузка...</span>
					</div>
				)}

				{/* Footer Stats */}
				<OperationsFooter
					isFilterOpen={isFilterOpen}
					operations={operations}
					totalOperations={operationsListData?.data?.data?.pagination?.total || operations.length}
				/>
			</div>

			{/* Right Side Modal */}
			{openModal && (
				<OperationModal
					operation={openModal}
					isClosing={isModalClosing}
					isOpening={isModalOpening}
					onClose={closeOperationModal}
					onSuccess={(operationData, isUpdate) => {

						if (isUpdate) {
							// Обновляем существующую операцию в списке
							setAllOperations(prev => {
								console.log('Previous operations count:', prev.length)
								const updated = prev.map(op => {
									if (op.guid === operationData.guid) {
										console.log('Found and updating operation:', op.guid)
										// Создаем новый объект с обновленными данными
										const updatedOp = {
											...op,
											...operationData,
											// Убеждаемся что guid сохранен
											guid: op.guid
										}
										console.log('Updated operation:', updatedOp)
										return updatedOp
									}
									return op
								})
								console.log('Updated operations count:', updated.length)
								return updated
							})
						} else {
							// Добавляем новую операцию в начало списка
							console.log('Adding new operation to beginning of list')
							setAllOperations(prev => {
								console.log('Previous operations count:', prev.length)
								const newList = [operationData, ...prev]
								console.log('New operations count:', newList.length)
								return newList
							})
						}
					}}
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

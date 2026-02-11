'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/app/lib/utils'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { TreeSelect } from '@/components/common/TreeSelect/TreeSelect'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import {
	useCounterpartiesV2,
	useCounterpartiesGroupsV2,
	useChartOfAccountsV2,
	useMyAccountsV2,
	useLegalEntitiesV2,
	useCurrencies,
} from '@/hooks/useDashboard'
import { showSuccessNotification, showErrorNotification } from '@/lib/utils/notifications'
import styles from './OperationModal.module.scss'

export function OperationModal({
	operation,
	modalType,
	isClosing,
	isOpening,
	onClose,
	preselectedCounterparty = null,
}) {
	const queryClient = useQueryClient()
	const isNew = operation?.isNew || false

	console.log('OperationModal', operation)
	// Current active tab
	const [activeTab, setActiveTab] = useState(modalType || 'income')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Block body scroll when modal is open
	useEffect(() => {
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
		}
	}, [])

	// Format number with spaces (1000000 -> 1 000 000)
	const formatAmount = value => {
		if (!value) return ''
		// Remove all non-digit characters
		const digitsOnly = value.toString().replace(/\D/g, '')
		if (!digitsOnly) return ''
		// Add spaces every 3 digits from the right
		return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	}

	// Parse formatted amount back to number (1 000 000 -> 1000000)
	const parseAmount = value => {
		if (!value) return ''
		return value.toString().replace(/\s/g, '')
	}

	// Initialize form data from operation or defaults
	const getInitialFormData = () => {
		if (operation && !isNew && operation.rawData) {
			// Editing existing operation - use rawData
			const raw = operation.rawData
			const paymentDate = raw.data_operatsii
				? new Date(raw.data_operatsii).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0]
			const accrualDate = raw.data_nachisleniya
				? new Date(raw.data_nachisleniya).toISOString().split('T')[0]
				: paymentDate

			return {
				paymentDate,
				confirmPayment: raw.oplata_podtverzhdena || false,
				accountAndLegalEntity: raw.bank_accounts_id || null,
				amount: raw.summa ? Math.abs(raw.summa) : '',
				counterparty: raw.counterparties_id || null,
				chartOfAccount: raw.chart_of_accounts_id || null,
				project: null,
				purchaseDeal: null,
				salesDeal: null,
				purpose: raw.opisanie || '',
				// For transfer
				fromDate: paymentDate,
				fromAccount: raw.bank_accounts_id || null,
				fromAmount: raw.summa ? Math.abs(raw.summa) : '',
				toDate: paymentDate,
				toAccount: null,
				toAmount: '0',
				// For accrual
				accrualDate,
				confirmAccrual: false,
				legalEntity: raw.legal_entity_id || null,
				expenseItem: raw.chart_of_accounts_id || null,
				cashMethod: true,
				creditItem: null,
				currenies_id: raw.currenies_id || null,
			}
		}

		// New operation - use defaults
		return {
			paymentDate: new Date().toISOString().split('T')[0],
			confirmPayment: false,
			accountAndLegalEntity: null,
			amount: '',
			counterparty: preselectedCounterparty || null,
			chartOfAccount: null,
			project: null,
			purchaseDeal: null,
			salesDeal: null,
			purpose: '',
			// For transfer
			fromDate: new Date().toISOString().split('T')[0],
			fromAccount: null,
			fromAmount: '',
			toDate: new Date().toISOString().split('T')[0],
			toAccount: null,
			toAmount: '0',
			// For accrual
			accrualDate: new Date().toISOString().split('T')[0],
			confirmAccrual: false,
			legalEntity: null,
			expenseItem: null,
			cashMethod: true,
			creditItem: null,
			currenies_id: null,
		}
	}

	// Form state
	const [formData, setFormData] = useState(getInitialFormData())

	// Validation errors state
	const [errors, setErrors] = useState({})

	// Clear errors when switching tabs
	useEffect(() => {
		setErrors({})
	}, [activeTab])

	// Fetch data from API - using V2 endpoints
	const { data: counterpartiesData, isLoading: loadingCounterparties } = useCounterpartiesV2({
		data: {},
	})
	const { data: counterpartiesGroupsData } = useCounterpartiesGroupsV2({ data: {} })
	const { data: chartOfAccountsData, isLoading: loadingChartOfAccounts } = useChartOfAccountsV2({
		data: {},
	})
	const { data: bankAccountsData, isLoading: loadingBankAccounts } = useMyAccountsV2({ data: {} })
	const { data: legalEntitiesData, isLoading: loadingLegalEntities } = useLegalEntitiesV2({
		data: {},
	})
	const { data: currenciesData, isLoading: loadingCurrencies } = useCurrencies({ limit: 100 })

	// Build tree structure for counterparties (groups and their children)
	const counterAgentsTree = useMemo(() => {
		const counterparties = counterpartiesData?.data?.data?.response || []
		const groups = counterpartiesGroupsData?.data?.data?.response || []

		if (counterparties.length === 0) return []

		// Create a map of groups by guid
		const groupsMap = new Map()
		groups.forEach(group => {
			groupsMap.set(group.guid, group)
		})

		// Build child items map: groupGuid -> [counterparties]
		const childItemsMap = new Map()
		const allChildGuids = new Set()

		counterparties.forEach(item => {
			if (item.counterparties_group_id) {
				const groupGuid = item.counterparties_group_id
				if (!childItemsMap.has(groupGuid)) {
					childItemsMap.set(groupGuid, [])
				}
				childItemsMap.get(groupGuid).push(item)
				allChildGuids.add(item.guid)
			}
		})

		// Find root items (groups and ungrouped counterparties)
		const rootItems = []

		// Add groups with their children - only if they have children
		groups.forEach(group => {
			const children = childItemsMap.get(group.guid) || []
			// Only add group if it has children
			if (children.length > 0) {
				rootItems.push({
					guid: group.guid,
					nazvanie: group.nazvanie_gruppy || 'Без названия',
					isGroup: true,
					children: children,
				})
			}
		})

		// Add ungrouped counterparties as root items
		counterparties.forEach(item => {
			if (!item.counterparties_group_id) {
				rootItems.push({
					guid: item.guid,
					nazvanie: item.nazvanie || 'Без названия',
					isGroup: false,
					children: [],
				})
			}
		})

		// Build tree structure recursively
		const buildTree = item => {
			const treeNode = {
				value: item.guid,
				title: item.nazvanie || item.nazvanie_gruppy || 'Без названия',
				selectable: !item.isGroup, // Groups are not selectable, only counterparties
				children:
					item.children && item.children.length > 0
						? item.children.map(child => ({
								value: child.guid,
								title: child.nazvanie || 'Без названия',
								selectable: true,
							}))
						: undefined,
			}
			return treeNode
		}

		return rootItems.map(buildTree)
	}, [counterpartiesData, counterpartiesGroupsData])

	// Also keep flat list for backward compatibility (if needed)
	const counterAgents = (counterpartiesData?.data?.data?.response || []).map(item => ({
		guid: item.guid,
		label: item.nazvanie || '',
		group: item.counterparties_group_id_data?.nazvanie_gruppy || 'Без группы',
	}))

	// Transform legal entities data
	const legalEntities = useMemo(() => {
		const items = legalEntitiesData?.data?.data?.response || []
		return items.map(item => ({
			guid: item.guid,
			label: item.nazvanie || 'Без названия',
			group: 'Юрлица', // All legal entities in one group
		}))
	}, [legalEntitiesData])

	// Transform chart of accounts data - show full tree filtered by type
	const chartOfAccountsTree = useMemo(() => {
		const items = chartOfAccountsData?.data?.data?.response || []
		if (items.length === 0) return []

		// Filter out items without tip (type)
		const itemsWithType = items.filter(
			item => item.tip && Array.isArray(item.tip) && item.tip.length > 0,
		)

		// For accrual tab, group by type
		if (activeTab === 'accrual') {
			// Build a map for quick lookup
			const itemsMap = new Map()
			itemsWithType.forEach(item => {
				itemsMap.set(item.guid, item)
			})

			// Build child items map: parentGuid -> [children]
			const childItemsMap = new Map()
			itemsWithType.forEach(item => {
				if (item.chart_of_accounts_id_2) {
					const parentGuid = item.chart_of_accounts_id_2
					if (!childItemsMap.has(parentGuid)) {
						childItemsMap.set(parentGuid, [])
					}
					childItemsMap.get(parentGuid).push(item)
				}
			})

			// Helper to get all descendants of an item
			const getAllDescendants = (itemGuid, collected = new Set()) => {
				const children = childItemsMap.get(itemGuid) || []
				children.forEach(child => {
					if (!collected.has(child.guid)) {
						collected.add(child.guid)
						getAllDescendants(child.guid, collected)
					}
				})
				return collected
			}

			// Group items by type (including all their descendants)
			const groupedByType = {
				Актив: new Set(),
				Капитал: new Set(),
				Обязательства: new Set(),
			}

			itemsWithType.forEach(item => {
				if (item.tip && Array.isArray(item.tip) && item.tip.length > 0) {
					const tipText = item.tip[0]
					let targetGroup = null

					if (tipText && tipText.includes('Актив')) {
						targetGroup = 'Актив'
					} else if (tipText && tipText.includes('Капитал')) {
						targetGroup = 'Капитал'
					} else if (tipText && tipText.includes('Обязательства')) {
						targetGroup = 'Обязательства'
					}

					if (targetGroup) {
						// Add item itself
						groupedByType[targetGroup].add(item.guid)
						// Add all descendants
						const descendants = getAllDescendants(item.guid)
						descendants.forEach(guid => groupedByType[targetGroup].add(guid))
					}
				}
			})

			// Build tree for each type
			const result = []

			Object.entries(groupedByType).forEach(([typeName, itemGuids]) => {
				if (itemGuids.size === 0) return

				// Get items for this type
				const typeItems = Array.from(itemGuids)
					.map(guid => itemsMap.get(guid))
					.filter(Boolean)

				// Build child items map for this type only
				const typeChildItemsMap = new Map()
				typeItems.forEach(item => {
					if (item.chart_of_accounts_id_2 && itemGuids.has(item.chart_of_accounts_id_2)) {
						const parentGuid = item.chart_of_accounts_id_2
						if (!typeChildItemsMap.has(parentGuid)) {
							typeChildItemsMap.set(parentGuid, [])
						}
						typeChildItemsMap.get(parentGuid).push(item)
					}
				})

				// Build tree structure recursively
				const buildTree = item => {
					const children = typeChildItemsMap.get(item.guid) || []
					const hasChildren = children.length > 0

					const treeNode = {
						value: item.guid,
						title: item.nazvanie || 'Без названия',
						selectable: true, // Allow selecting any node
						expanded: false, // Collapsed by default
						tip: item.tip,
						children: hasChildren ? children.map(child => buildTree(child)) : undefined,
					}
					return treeNode
				}

				// Find root items for this type (items that don't have parent in this type)
				const rootItems = typeItems.filter(
					item => !item.chart_of_accounts_id_2 || !itemGuids.has(item.chart_of_accounts_id_2),
				)

				// Create type group node
				const typeNode = {
					value: `type_${typeName}`,
					title: typeName,
					selectable: false,
					expanded: false, // Collapsed by default
					tip: [typeName],
					children: rootItems.map(root => buildTree(root)),
				}

				result.push(typeNode)
			})

			return result
		}

		// For other tabs, use existing logic
		// Build a map for quick lookup
		const itemsMap = new Map()
		itemsWithType.forEach(item => {
			itemsMap.set(item.guid, item)
		})

		// Build child items map: parentGuid -> [children]
		const childItemsMap = new Map()
		itemsWithType.forEach(item => {
			if (item.chart_of_accounts_id_2) {
				const parentGuid = item.chart_of_accounts_id_2
				if (!childItemsMap.has(parentGuid)) {
					childItemsMap.set(parentGuid, [])
				}
				childItemsMap.get(parentGuid).push(item)
			}
		})

		// Helper to check if item or any of its descendants match the filter
		const hasMatchingDescendants = item => {
			const children = childItemsMap.get(item.guid) || []

			// Check if item itself matches the filter first
			const itemMatches =
				item.tip &&
				Array.isArray(item.tip) &&
				item.tip.length > 0 &&
				((activeTab === 'income' && item.tip.some(t => t && t.includes('Доход'))) ||
					(activeTab === 'payment' && item.tip.some(t => t && t.includes('Расход'))))

			// If item has children, check if any child matches
			if (children.length > 0) {
				const hasMatchingChild = children.some(child => hasMatchingDescendants(child))
				// Include item if it matches OR has matching children
				return itemMatches || hasMatchingChild
			}

			// If no children (leaf node), return whether item itself matches
			return itemMatches
		}

		// Build tree structure recursively
		const buildTree = item => {
			const children = childItemsMap.get(item.guid) || []

			// Filter children - only include those that match or have matching descendants
			const filteredChildren = children.filter(child => hasMatchingDescendants(child))

			const hasChildren = filteredChildren.length > 0

			const treeNode = {
				value: item.guid,
				title: item.nazvanie || 'Без названия',
				selectable: true, // Allow selecting any node
				expanded: false, // Collapsed by default
				tip: item.tip,
				children: hasChildren ? filteredChildren.map(child => buildTree(child)) : undefined,
			}
			return treeNode
		}

		// Find root items (level 1)
		const rootItems = itemsWithType.filter(item => !item.chart_of_accounts_id_2)

		// Filter root items - only include those that have matching descendants
		const filteredRootItems = rootItems.filter(root => hasMatchingDescendants(root))

		// Debug: log tree structure
		console.log('=== Chart of Accounts Tree ===')
		console.log('Active Tab:', activeTab)
		console.log(
			'Filtered Root Items:',
			filteredRootItems.map(r => r.nazvanie),
		)

		return filteredRootItems.map(buildTree)
	}, [chartOfAccountsData, activeTab])

	// Debug: log the tree structure
	useEffect(() => {
		console.log('=== Chart of Accounts Tree ===')
		console.log('Active Tab:', activeTab)
		console.log('Tree:', JSON.stringify(chartOfAccountsTree, null, 2))
		console.log('Tree length:', chartOfAccountsTree.length)
	}, [chartOfAccountsTree, activeTab])

	// Remove the old filteredChartOfAccountsTree since filtering is now done in chartOfAccountsTree
	const filteredChartOfAccountsTree = chartOfAccountsTree

	const bankAccounts = useMemo(() => {
		const items = bankAccountsData?.data?.data?.response || []
		return items.map(item => ({
			guid: item.guid,
			label: item.nazvanie || '',
			group: item.legal_entity_id_data?.nazvanie || 'Без группы',
			currenies_id: item.currenies_id || null,
			currenies_id_data: item.currenies_id_data || null,
		}))
	}, [bankAccountsData])

	// Transform currencies data
	const currencies = (
		currenciesData?.data?.data?.response ||
		currenciesData?.data?.response ||
		[]
	).map(item => ({
		guid: item.guid,
		label: `${item.kod || ''} (${item.nazvanie || ''})`.trim(),
		kod: item.kod || '',
		nazvanie: item.nazvanie || '',
	}))

	// Get currency from selected account
	const getAccountCurrency = accountGuid => {
		if (!accountGuid) return null
		const account = bankAccounts.find(acc => acc.guid === accountGuid)
		if (!account || !account.currenies_id_data) return null
		return `${account.currenies_id_data.kod || ''} (${account.currenies_id_data.nazvanie || ''})`.trim()
	}

	// Get currency from selected legal entity (through its accounts)
	const getLegalEntityCurrency = legalEntityGuid => {
		if (!legalEntityGuid) return null
		// Find first account of this legal entity to get currency
		const legalEntityAccounts = bankAccounts.filter(
			acc => acc.group === legalEntities.find(le => le.guid === legalEntityGuid)?.label,
		)
		if (legalEntityAccounts.length === 0 || !legalEntityAccounts[0].currenies_id_data) return null
		return `${legalEntityAccounts[0].currenies_id_data.kod || ''} (${legalEntityAccounts[0].currenies_id_data.nazvanie || ''})`.trim()
	}

	// Handle form submission
	const handleSubmit = async () => {
		setIsSubmitting(true)
		console.log('formData.confirmPayment', formData)
		// if ('formData.confirmPayment') return
		try {
			// Validation for income tab
			if (activeTab === 'income') {
				const validationErrors = {}

				if (!formData.paymentDate) {
					validationErrors.paymentDate = 'Обязательное поле'
				}
				if (!formData.accountAndLegalEntity) {
					validationErrors.accountAndLegalEntity = 'Обязательное поле'
				}
				if (!formData.amount || parseFloat(formData.amount) <= 0) {
					validationErrors.amount = 'Обязательное поле'
				}
				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Обязательное поле'
				}

				if (Object.keys(validationErrors).length > 0) {
					setErrors(validationErrors)
					setIsSubmitting(false)
					return
				}
			}

			// Validation for payment tab
			if (activeTab === 'payment') {
				const validationErrors = {}

				if (!formData.paymentDate) {
					validationErrors.paymentDate = 'Обязательное поле'
				}
				if (!formData.accountAndLegalEntity) {
					validationErrors.accountAndLegalEntity = 'Обязательное поле'
				}
				if (!formData.amount || parseFloat(formData.amount) <= 0) {
					validationErrors.amount = 'Обязательное поле'
				}
				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Обязательное поле'
				}

				if (Object.keys(validationErrors).length > 0) {
					setErrors(validationErrors)
					setIsSubmitting(false)
					return
				}
			}

			// Validation for transfer tab
			if (activeTab === 'transfer') {
				const validationErrors = {}

				if (!formData.fromDate) {
					validationErrors.fromDate = 'Обязательное поле'
				}
				if (!formData.fromAccount) {
					validationErrors.fromAccount = 'Обязательное поле'
				}
				if (!formData.fromAmount || parseFloat(formData.fromAmount) <= 0) {
					validationErrors.fromAmount = 'Обязательное поле'
				}
				if (!formData.toDate) {
					validationErrors.toDate = 'Обязательное поле'
				}
				if (!formData.toAccount) {
					validationErrors.toAccount = 'Обязательное поле'
				}
				if (!formData.toAmount || parseFloat(formData.toAmount) <= 0) {
					validationErrors.toAmount = 'Обязательное поле'
				}
				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Обязательное поле'
				}

				if (Object.keys(validationErrors).length > 0) {
					setErrors(validationErrors)
					setIsSubmitting(false)
					return
				}
			}

			// Validation for accrual tab
			if (activeTab === 'accrual') {
				const validationErrors = {}

				if (!formData.accrualDate) {
					validationErrors.accrualDate = 'Обязательное поле'
				}
				if (!formData.legalEntity) {
					validationErrors.legalEntity = 'Обязательное поле'
				}
				if (!formData.expenseItem) {
					validationErrors.expenseItem = 'Обязательное поле'
				}
				if (!formData.amount || parseFloat(formData.amount) <= 0) {
					validationErrors.amount = 'Обязательное поле'
				}
				if (!formData.creditItem) {
					validationErrors.creditItem = 'Обязательное поле'
				}
				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Обязательное поле'
				}

				if (Object.keys(validationErrors).length > 0) {
					setErrors(validationErrors)
					setIsSubmitting(false)
					return
				}
			}

			// Clear errors if validation passed
			setErrors({})

			// Map form data to API format
			const tipMap = {
				income: 'Поступление',
				payment: 'Выплата',
				transfer: 'Перемещение',
				accrual: 'Начисление',
			}

			const now = new Date()

			// Parse dates correctly - if it's a date string (YYYY-MM-DD), set time to noon UTC to avoid timezone issues
			let paymentDate = now
			if (formData.paymentDate) {
				const dateStr = formData.paymentDate
				if (typeof dateStr === 'string') {
					// Check if it's already an ISO string
					if (dateStr.includes('T') || dateStr.includes('Z')) {
						paymentDate = new Date(dateStr)
					} else if (dateStr.includes('-')) {
						// Date string format (YYYY-MM-DD): set to noon UTC (12:00:00) to avoid timezone issues
						paymentDate = new Date(dateStr + 'T12:00:00.000Z')
					} else {
						paymentDate = new Date(dateStr)
					}
				} else {
					paymentDate = new Date(dateStr)
				}
			}

			let accrualDate = paymentDate
			if (formData.accrualDate) {
				const dateStr = formData.accrualDate
				if (typeof dateStr === 'string') {
					if (dateStr.includes('T') || dateStr.includes('Z')) {
						accrualDate = new Date(dateStr)
					} else if (dateStr.includes('-')) {
						accrualDate = new Date(dateStr + 'T12:00:00.000Z')
					} else {
						accrualDate = new Date(dateStr)
					}
				} else {
					accrualDate = new Date(dateStr)
				}
			}

			// Validate dates
			if (isNaN(paymentDate.getTime())) {
				console.error('Invalid payment date:', formData.paymentDate)
				paymentDate = now
			}
			if (isNaN(accrualDate.getTime())) {
				console.error('Invalid accrual date:', formData.accrualDate)
				accrualDate = paymentDate
			}

			// Get currency ID from selected bank account if available
			let currencyId = formData.currenies_id
			if (!currencyId && formData.accountAndLegalEntity) {
				const selectedAccount = bankAccounts.find(
					acc => acc.guid === formData.accountAndLegalEntity,
				)
				if (selectedAccount && selectedAccount.currenies_id) {
					currencyId = selectedAccount.currenies_id
				}
			}

			// Build request data object
			const requestData = {
				tip: [tipMap[activeTab] || 'Поступление'],
				data_operatsii: paymentDate.toISOString(),
				data_nachisleniya:
					activeTab === 'accrual' ? accrualDate.toISOString() : paymentDate.toISOString(),
				oplata_podtverzhdena: formData.confirmPayment || false,
				summa: parseFloat(formData.amount) || 0,
				opisanie: formData.purpose || '',
				data_sozdaniya: now.toISOString(),
				data_obnovleniya: now.toISOString(),
			}

			// Add optional fields only if they have values (don't send empty strings or null)
			if (formData.accountAndLegalEntity) {
				requestData.bank_accounts_id = formData.accountAndLegalEntity
			}
			if (formData.counterparty) {
				requestData.counterparties_id = formData.counterparty
			}
			if (formData.chartOfAccount) {
				requestData.chart_of_accounts_id = formData.chartOfAccount
			}
			if (formData.legalEntity) {
				requestData.legal_entity_id = formData.legalEntity
			}
			if (currencyId) {
				requestData.currenies_id = currencyId
			}

			// Remove empty strings
			Object.keys(requestData).forEach(key => {
				if (
					requestData[key] === '' ||
					requestData[key] === null ||
					requestData[key] === undefined
				) {
					delete requestData[key]
				}
			})

			// Determine if this is create or update
			const isUpdate = !isNew && operation?.rawData?.guid
			const endpoint = isUpdate ? '/api/operations/update' : '/api/operations/create'
			const method = isUpdate ? 'PUT' : 'POST'

			// For update, add guid to request data
			if (isUpdate && operation.rawData.guid) {
				requestData.guid = operation.rawData.guid
				// Keep original creation date for update
				if (operation.rawData.data_sozdaniya) {
					requestData.data_sozdaniya = operation.rawData.data_sozdaniya
				}
			}

			console.log(
				`${isUpdate ? 'Updating' : 'Creating'} operation with data:`,
				JSON.stringify({ data: requestData }, null, 2),
			)
			console.log('Form data:', formData)
			console.log(
				'Selected account:',
				formData.accountAndLegalEntity
					? bankAccounts.find(acc => acc.guid === formData.accountAndLegalEntity)
					: 'none',
			)

			// Use fetch to call the API endpoint
			const response = await fetch(endpoint, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ data: requestData }),
			})

			const result = await response.json()

			if (result.status === 'ERROR') {
				throw new Error(
					result.data ||
						result.description ||
						`Ошибка при ${isUpdate ? 'обновлении' : 'создании'} операции`,
				)
			}

			showSuccessNotification(`Операция успешно ${isUpdate ? 'обновлена' : 'создана'}!`)
			// Инвалидируем запросы для обновления списка операций
			queryClient.invalidateQueries({ queryKey: ['operationsList'] })
			queryClient.invalidateQueries({ queryKey: ['operations'] })
			queryClient.invalidateQueries({ queryKey: ['dashboard'] })
			onClose()
		} catch (error) {
			console.error(
				`Error ${!isNew && operation?.rawData?.guid ? 'updating' : 'creating'} operation:`,
				error,
			)
			showErrorNotification(
				error.message ||
					`Ошибка при ${!isNew && operation?.rawData?.guid ? 'обновлении' : 'создании'} операции`,
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Don't return null for new operations
	if (!operation && !isNew) return null

	return (
		<>
			{/* Overlay */}
			<div
				onClick={onClose}
				className={cn(styles.overlay, isClosing ? styles.closing : styles.opening)}
			/>

			{/* Modal */}
			<div
				className={cn(
					styles.modal,
					isOpening ? styles.opening : isClosing ? styles.closing : styles.open,
				)}
				onClick={e => e.stopPropagation()}
			>
				<div className={styles.modalContent}>
					{/* Header */}
					<div className={styles.header}>
						<div className={styles.headerTop}>
							<div className={styles.headerLeft}>
								<h2 className={styles.title}>
									{isNew ? 'Создание операции' : 'Редактирование операции'}
								</h2>
								<div className={styles.headerDate}>
									<svg
										className={styles.headerIcon}
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
									{!isNew && <span>Создана {operation?.createdAt || '—'}</span>}
								</div>
							</div>
							<button onClick={onClose} className={styles.closeButton}>
								✕
							</button>
						</div>
						{/* Tabs */}
						<div className={styles.tabs}>
							<button
								className={cn(
									styles.tab,
									activeTab === 'income' ? cn(styles.tabIncome, styles.active) : styles.inactive,
								)}
								onClick={() => setActiveTab('income')}
							>
								Поступление
							</button>
							<button
								className={cn(
									styles.tab,
									activeTab === 'payment' ? cn(styles.tabPayment, styles.active) : styles.inactive,
								)}
								onClick={() => setActiveTab('payment')}
							>
								Выплата
							</button>
							<button
								className={cn(
									styles.tab,
									activeTab === 'transfer'
										? cn(styles.tabTransfer, styles.active)
										: styles.inactive,
								)}
								onClick={() => setActiveTab('transfer')}
							>
								Перемещение
							</button>
							<button
								className={cn(
									styles.tab,
									activeTab === 'accrual' ? cn(styles.tabAccrual, styles.active) : styles.inactive,
								)}
								onClick={() => setActiveTab('accrual')}
							>
								Начисление
							</button>
						</div>
					</div>

					{/* Form */}
					<div className={styles.body}>
						<div className={styles.form}>
							{/* Поступление */}
							{activeTab === 'income' && (
								<>
									{/* Дата оплаты */}
									<div className={styles.formRow}>
										<label className={styles.label}>
											Дата оплаты <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<DatePicker
												value={formData.paymentDate}
												onChange={value => {
													setFormData({ ...formData, paymentDate: value })
													if (errors.paymentDate) {
														setErrors({ ...errors, paymentDate: null })
													}
												}}
												placeholder='Выберите дату'
												showCheckbox={true}
												checkboxLabel='Подтвердить оплату'
												checkboxValue={formData.confirmPayment}
												onCheckboxChange={checked =>
													setFormData({ ...formData, confirmPayment: checked })
												}
												className={errors.paymentDate ? styles.error : ''}
											/>
											{errors.paymentDate && (
												<span className={styles.errorText}>{errors.paymentDate}</span>
											)}
										</div>
									</div>

									{/* Счет и юрлицо */}
									<div className={styles.formRow}>
										<label className={styles.label}>
											Счет и юрлицо <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<GroupedSelect
												data={bankAccounts}
												value={formData.accountAndLegalEntity}
												onChange={value => {
													setFormData({ ...formData, accountAndLegalEntity: value })
													if (errors.accountAndLegalEntity) {
														setErrors({ ...errors, accountAndLegalEntity: null })
													}
												}}
												placeholder='Выберите счет...'
												groupBy={true}
												labelKey='label'
												valueKey='guid'
												groupKey='group'
												loading={loadingBankAccounts}
												hasError={!!errors.accountAndLegalEntity}
											/>
											{errors.accountAndLegalEntity && (
												<span className={styles.errorText}>{errors.accountAndLegalEntity}</span>
											)}
										</div>
									</div>

									{/* Сумма */}
									<div className={styles.formRow}>
										<label className={styles.label}>
											Сумма <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<div className={styles.inputGroup}>
												<input
													type='text'
													value={formatAmount(formData.amount)}
													onChange={e => {
														setFormData({ ...formData, amount: parseAmount(e.target.value) })
														if (errors.amount) {
															setErrors({ ...errors, amount: null })
														}
													}}
													placeholder='0'
													className={cn(styles.input, errors.amount && styles.error)}
												/>
												<div className={styles.currencyDisplay}>
													{getAccountCurrency(formData.accountAndLegalEntity) || 'Выберите счет'}
												</div>
											</div>
											{errors.amount && <span className={styles.errorText}>{errors.amount}</span>}
										</div>
									</div>

									{/* Дата начисления */}
									<div className={styles.formRow}>
										<label className={styles.label}>Дата начисления</label>
										<DatePicker
											value={formData.accrualDate}
											onChange={value => setFormData({ ...formData, accrualDate: value })}
											placeholder='Выберите дату'
											showCheckbox
											checkboxLabel='Подтвердить начисление'
										/>
									</div>

									{/* Контрагент */}
									<div className={styles.formRow}>
										<label className={styles.label}>Контрагент</label>
										<TreeSelect
											data={counterAgentsTree}
											value={formData.counterparty}
											onChange={value => setFormData({ ...formData, counterparty: value })}
											placeholder='Выберите контрагента...'
											className='flex-1'
										/>
									</div>

									{/* Статья */}
									<div className={styles.formRow}>
										<label className={styles.label}>Статья</label>
										<TreeSelect
											data={filteredChartOfAccountsTree}
											value={formData.chartOfAccount}
											onChange={value => setFormData({ ...formData, chartOfAccount: value })}
											placeholder='Выберите статью...'
											loading={loadingChartOfAccounts}
											className='flex-1'
										/>
									</div>

									{/* Назначение платежа */}
									<div className={styles.formRowStart}>
										<label className={styles.label} style={{ paddingTop: '0.5rem' }}>
											Назначение платежа <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<textarea
												value={formData.purpose}
												onChange={e => {
													setFormData({ ...formData, purpose: e.target.value })
													if (errors.purpose) {
														setErrors({ ...errors, purpose: null })
													}
												}}
												placeholder='Назначение платежа'
												rows={3}
												className={cn(styles.textarea, errors.purpose && styles.error)}
											/>
											{errors.purpose && <span className={styles.errorText}>{errors.purpose}</span>}
										</div>
									</div>
								</>
							)}

							{/* Выплата */}
							{activeTab === 'payment' && (
								<>
									{/* Дата оплаты */}
									<div className={styles.formRow}>
										<label className={styles.label}>
											Дата оплаты <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<DatePicker
												value={formData.paymentDate}
												onChange={value => {
													setFormData({ ...formData, paymentDate: value })
													if (errors.paymentDate) {
														setErrors({ ...errors, paymentDate: null })
													}
												}}
												placeholder='Выберите дату'
												showCheckbox={true}
												checkboxLabel='Подтвердить оплату'
												checkboxValue={formData.confirmPayment}
												onCheckboxChange={checked =>
													setFormData({ ...formData, confirmPayment: checked })
												}
												className={errors.paymentDate ? styles.error : ''}
											/>
											{errors.paymentDate && (
												<span className={styles.errorText}>{errors.paymentDate}</span>
											)}
										</div>
									</div>

									{/* Счет и юрлицо */}
									<div className={styles.formRow}>
										<label className={styles.label}>
											Счет и юрлицо <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<GroupedSelect
												data={bankAccounts}
												value={formData.accountAndLegalEntity}
												onChange={value => {
													setFormData({ ...formData, accountAndLegalEntity: value })
													if (errors.accountAndLegalEntity) {
														setErrors({ ...errors, accountAndLegalEntity: null })
													}
												}}
												placeholder='Выберите счет...'
												groupBy={true}
												labelKey='label'
												valueKey='guid'
												groupKey='group'
												loading={loadingBankAccounts}
												hasError={!!errors.accountAndLegalEntity}
											/>
											{errors.accountAndLegalEntity && (
												<span className={styles.errorText}>{errors.accountAndLegalEntity}</span>
											)}
										</div>
									</div>

									{/* Сумма */}
									<div className={styles.formRow}>
										<label className={styles.label}>
											Сумма <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<div className={styles.inputGroup}>
												<input
													type='text'
													value={formatAmount(formData.amount)}
													onChange={e => {
														setFormData({ ...formData, amount: parseAmount(e.target.value) })
														if (errors.amount) {
															setErrors({ ...errors, amount: null })
														}
													}}
													placeholder='0'
													className={cn(styles.input, errors.amount && styles.error)}
												/>
												<span className={styles.inputText}>
													{operation.currency || 'RUB (Российский рубль)'}
												</span>
											</div>
											{errors.amount && <span className={styles.errorText}>{errors.amount}</span>}
										</div>
									</div>

									{/* Дата начисления */}
									<div className={styles.formRow}>
										<label className={styles.label}>Дата начисления</label>
										<DatePicker
											value={formData.accrualDate}
											onChange={value => setFormData({ ...formData, accrualDate: value })}
											placeholder='Выберите дату'
											showCheckbox
											checkboxLabel='Подтвердить начисление'
										/>
									</div>

									{/* Контрагент */}
									<div className={styles.formRow}>
										<label className={styles.label}>Контрагент</label>
										<TreeSelect
											data={counterAgentsTree}
											value={formData.counterparty}
											onChange={value => setFormData({ ...formData, counterparty: value })}
											placeholder='Выберите контрагента...'
											className='flex-1'
										/>
									</div>

									{/* Статья */}
									<div className={styles.formRow}>
										<label className={styles.label}>Статья</label>
										<TreeSelect
											data={filteredChartOfAccountsTree}
											value={formData.chartOfAccount}
											onChange={value => setFormData({ ...formData, chartOfAccount: value })}
											placeholder='Выберите статью...'
											loading={loadingChartOfAccounts}
											className='flex-1'
										/>
									</div>

									{/* Назначение платежа */}
									<div className={styles.formRowStart}>
										<label className={styles.label} style={{ paddingTop: '0.5rem' }}>
											Назначение платежа <span className={styles.required}>*</span>
										</label>
										<div className={styles.fieldWrapper}>
											<textarea
												value={formData.purpose}
												onChange={e => {
													setFormData({ ...formData, purpose: e.target.value })
													if (errors.purpose) {
														setErrors({ ...errors, purpose: null })
													}
												}}
												placeholder='Назначение платежа'
												rows={3}
												className={cn(styles.textarea, errors.purpose && styles.error)}
											/>
											{errors.purpose && <span className={styles.errorText}>{errors.purpose}</span>}
										</div>
									</div>
								</>
							)}

							{/* Перемещение */}
							{activeTab === 'transfer' && (
								<>
									{/* Секция ОТКУДА */}
									<div className={styles.formSection}>
										<div className={styles.sectionHeader}>
											<div className={styles.sectionLine}></div>
											<h3 className={styles.sectionTitle}>ОТКУДА</h3>
											<div className={styles.sectionLine}></div>
										</div>

										{/* Дата оплаты */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Дата оплаты <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<DatePicker
													value={formData.fromDate}
													onChange={value => {
														setFormData({ ...formData, fromDate: value })
														if (errors.fromDate) {
															setErrors({ ...errors, fromDate: null })
														}
													}}
													placeholder='Выберите дату'
													showCheckbox={true}
													checkboxLabel='Подтвердить оплату'
													checkboxValue={formData.confirmPayment}
													onCheckboxChange={checked =>
														setFormData({ ...formData, confirmPayment: checked })
													}
													className={errors.fromDate ? styles.error : ''}
												/>
												{errors.fromDate && (
													<span className={styles.errorText}>{errors.fromDate}</span>
												)}
											</div>
										</div>

										{/* Счет и юрлицо */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Счет и юрлицо <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<GroupedSelect
													data={bankAccounts}
													value={formData.fromAccount}
													onChange={value => {
														setFormData({ ...formData, fromAccount: value })
														if (errors.fromAccount) {
															setErrors({ ...errors, fromAccount: null })
														}
													}}
													placeholder='Выберите счет...'
													groupBy={true}
													labelKey='label'
													valueKey='guid'
													groupKey='group'
													loading={loadingBankAccounts}
													hasError={!!errors.fromAccount}
												/>
												{errors.fromAccount && (
													<span className={styles.errorText}>{errors.fromAccount}</span>
												)}
											</div>
										</div>

										{/* Сумма списания */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Сумма списания <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<div className={styles.inputGroup}>
													<input
														type='text'
														value={formatAmount(formData.fromAmount)}
														onChange={e => {
															setFormData({ ...formData, fromAmount: parseAmount(e.target.value) })
															if (errors.fromAmount) {
																setErrors({ ...errors, fromAmount: null })
															}
														}}
														placeholder='0'
														className={cn(styles.input, errors.fromAmount && styles.error)}
													/>
													<div className={styles.currencyDisplay}>
														{getAccountCurrency(formData.fromAccount) || 'Выберите счет'}
													</div>
												</div>
												{errors.fromAmount && (
													<span className={styles.errorText}>{errors.fromAmount}</span>
												)}
											</div>
										</div>
									</div>

									{/* Секция КУДА */}
									<div className={styles.formSection}>
										<div className={styles.sectionHeader}>
											<div className={styles.sectionLine}></div>
											<h3 className={styles.sectionTitle}>КУДА</h3>
											<div className={styles.sectionLine}></div>
										</div>

										{/* Дата */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Дата <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<DatePicker
													value={formData.toDate}
													onChange={value => {
														setFormData({ ...formData, toDate: value })
														if (errors.toDate) {
															setErrors({ ...errors, toDate: null })
														}
													}}
													placeholder='Выберите дату'
													className={errors.toDate ? styles.error : ''}
												/>
												{errors.toDate && <span className={styles.errorText}>{errors.toDate}</span>}
											</div>
										</div>

										{/* Счет и юрлицо */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Счет и юрлицо <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<GroupedSelect
													data={bankAccounts}
													value={formData.toAccount}
													onChange={value => {
														setFormData({ ...formData, toAccount: value })
														if (errors.toAccount) {
															setErrors({ ...errors, toAccount: null })
														}
													}}
													placeholder='Выберите счет...'
													groupBy={true}
													labelKey='label'
													valueKey='guid'
													groupKey='group'
													loading={loadingBankAccounts}
													hasError={!!errors.toAccount}
												/>
												{errors.toAccount && (
													<span className={styles.errorText}>{errors.toAccount}</span>
												)}
											</div>
										</div>

										{/* Сумма зачисления */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Сумма зачисления <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<div className={styles.inputGroup}>
													<input
														type='text'
														value={formatAmount(formData.toAmount)}
														onChange={e => {
															setFormData({ ...formData, toAmount: parseAmount(e.target.value) })
															if (errors.toAmount) {
																setErrors({ ...errors, toAmount: null })
															}
														}}
														placeholder='0'
														className={cn(styles.input, errors.toAmount && styles.error)}
													/>
													<div className={styles.currencyDisplay}>
														{getAccountCurrency(formData.toAccount) || 'Выберите счет'}
													</div>
												</div>
												{errors.toAmount && (
													<span className={styles.errorText}>{errors.toAmount}</span>
												)}
											</div>
										</div>

										{/* Назначение платежа */}
										<div className={styles.formRowStart}>
											<label className={styles.label} style={{ paddingTop: '0.5rem' }}>
												Назначение платежа <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<textarea
													value={formData.purpose}
													onChange={e => {
														setFormData({ ...formData, purpose: e.target.value })
														if (errors.purpose) {
															setErrors({ ...errors, purpose: null })
														}
													}}
													placeholder='Назначение платежа'
													rows={3}
													className={cn(styles.textarea, errors.purpose && styles.error)}
												/>
												{errors.purpose && (
													<span className={styles.errorText}>{errors.purpose}</span>
												)}
											</div>
										</div>
									</div>
								</>
							)}

							{/* Начисление */}
							{activeTab === 'accrual' && (
								<>
									{/* Секция ОТКУДА */}
									<div className={styles.formSection}>
										<div className={styles.sectionHeader}>
											<div className={styles.sectionLine}></div>
											<h3 className={styles.sectionTitle}>ОТКУДА</h3>
											<div className={styles.sectionLine}></div>
										</div>

										{/* Дата начисления */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Дата начисления <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<DatePicker
													value={formData.accrualDate}
													onChange={value => {
														setFormData({ ...formData, accrualDate: value })
														if (errors.accrualDate) {
															setErrors({ ...errors, accrualDate: null })
														}
													}}
													placeholder='Выберите дату'
													className={errors.accrualDate ? styles.error : ''}
												/>
												{errors.accrualDate && (
													<span className={styles.errorText}>{errors.accrualDate}</span>
												)}
											</div>
										</div>

										{/* Подтвердить начисление */}
										<div className={styles.formRow}>
											<div className={styles.labelSpacer}></div>
											<label className={styles.checkboxLabel}>
												<input
													type='checkbox'
													className={styles.checkbox}
													checked={formData.confirmAccrual}
													onChange={e =>
														setFormData({ ...formData, confirmAccrual: e.target.checked })
													}
												/>
												<span>Подтвердить начисление</span>
											</label>
										</div>

										{/* Юрлицо */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Юрлицо <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<GroupedSelect
													data={legalEntities}
													value={formData.legalEntity}
													onChange={value => {
														setFormData({ ...formData, legalEntity: value })
														if (errors.legalEntity) {
															setErrors({ ...errors, legalEntity: null })
														}
													}}
													placeholder='Выберите юрлицо...'
													groupBy={false}
													labelKey='label'
													valueKey='guid'
													loading={loadingLegalEntities}
													hasError={!!errors.legalEntity}
												/>
												{errors.legalEntity && (
													<span className={styles.errorText}>{errors.legalEntity}</span>
												)}
											</div>
										</div>

										{/* Статья списания */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Статья списания <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<TreeSelect
													data={filteredChartOfAccountsTree}
													value={formData.expenseItem}
													onChange={value => {
														setFormData({ ...formData, expenseItem: value })
														if (errors.expenseItem) {
															setErrors({ ...errors, expenseItem: null })
														}
													}}
													placeholder='Выберите статью списания...'
													loading={loadingChartOfAccounts}
													hasError={!!errors.expenseItem}
												/>
												{errors.expenseItem && (
													<span className={styles.errorText}>{errors.expenseItem}</span>
												)}
											</div>
										</div>

										{/* Сумма */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Сумма <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<div className={styles.inputGroup}>
													<input
														type='text'
														value={formatAmount(formData.amount)}
														onChange={e => {
															setFormData({ ...formData, amount: parseAmount(e.target.value) })
															if (errors.amount) {
																setErrors({ ...errors, amount: null })
															}
														}}
														placeholder='0'
														className={cn(styles.input, errors.amount && styles.error)}
													/>
													<div className={styles.currencyDisplay}>
														{getLegalEntityCurrency(formData.legalEntity) || 'Выберите юрлицо'}
													</div>
												</div>
												{errors.amount && <span className={styles.errorText}>{errors.amount}</span>}
											</div>
										</div>

										{/* Учитывать в ОПиУ кассовым методом */}
										<div className={styles.formRow}>
											<div className={styles.labelSpacer}></div>
											<label className={styles.checkboxLabel}>
												<input
													type='checkbox'
													className={styles.checkbox}
													checked={formData.cashMethod}
													onChange={e => setFormData({ ...formData, cashMethod: e.target.checked })}
												/>
												<span>Учитывать в ОПиУ кассовым методом</span>
											</label>
										</div>
									</div>

									{/* Секция КУДА */}
									<div className={styles.formSection}>
										<div className={styles.sectionHeader}>
											<div className={styles.sectionLine}></div>
											<h3 className={styles.sectionTitle}>КУДА</h3>
											<div className={styles.sectionLine}></div>
										</div>

										{/* Статья зачисления */}
										<div className={styles.formRow}>
											<label className={styles.label}>
												Статья зачисления <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<TreeSelect
													data={filteredChartOfAccountsTree}
													value={formData.creditItem}
													onChange={value => {
														setFormData({ ...formData, creditItem: value })
														if (errors.creditItem) {
															setErrors({ ...errors, creditItem: null })
														}
													}}
													placeholder='Выберите статью зачисления...'
													loading={loadingChartOfAccounts}
													hasError={!!errors.creditItem}
												/>
												{errors.creditItem && (
													<span className={styles.errorText}>{errors.creditItem}</span>
												)}
											</div>
										</div>

										{/* Контрагент */}
										<div className={styles.formRow}>
											<label className={styles.label}>Контрагент</label>
											<TreeSelect
												data={counterAgentsTree}
												value={formData.counterparty}
												onChange={value => setFormData({ ...formData, counterparty: value })}
												placeholder='Не выбран'
												className='flex-1'
											/>
										</div>

										{/* Назначение */}
										<div className={styles.formRowStart}>
											<label className={styles.label} style={{ paddingTop: '0.5rem' }}>
												Назначение <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<textarea
													value={formData.purpose}
													onChange={e => {
														setFormData({ ...formData, purpose: e.target.value })
														if (errors.purpose) {
															setErrors({ ...errors, purpose: null })
														}
													}}
													placeholder='Назначение платежа'
													rows={3}
													className={cn(styles.textarea, errors.purpose && styles.error)}
												/>
												{errors.purpose && (
													<span className={styles.errorText}>{errors.purpose}</span>
												)}
											</div>
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Footer */}
					<div className={styles.footer}>
						<button className={styles.cancelButton} onClick={onClose}>
							Отмена
						</button>
						<button className={styles.saveButton} onClick={handleSubmit} disabled={isSubmitting}>
							{isSubmitting ? 'Создание...' : isNew ? 'Создать' : 'Сохранить'}
						</button>
					</div>
				</div>
			</div>
		</>
	)
}

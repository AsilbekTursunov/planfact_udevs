'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/app/lib/utils'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { TreeSelect } from '@/components/common/TreeSelect/TreeSelect'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import {
	useCounterpartiesGroupsPlanFact,
	useChartOfAccountsPlanFact,
	useBankAccountsPlanFact,
	useLegalEntitiesPlanFact,
	useCurrencies,
	useOperation,
} from '@/hooks/useDashboard'
import { showSuccessNotification, showErrorNotification } from '@/lib/utils/notifications'
import Input from '@/components/shared/Input'
import TextArea from '@/components/shared/TextArea'
import styles from './OperationModal.module.scss'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import { CreditIcon, DebitIcon } from '../../../constants/icons'

export function OperationModal({
	operation,
	modalType,
	isClosing,
	isOpening,
	onClose,
	onSuccess,
	preselectedCounterparty = null,
}) {
	const queryClient = useQueryClient()
	const isNew = operation?.isNew || false


	// Extract guid from operation - check multiple possible locations
	const operationGuid = useMemo(() => {
		if (isNew) return null
		// Try to get guid from various possible locations
		return operation?.rawData?.guid || operation?.guid || null
	}, [isNew, operation])


	// Fetch full operation data if editing existing operation
	const { data: fullOperationData, isLoading: isLoadingOperation, refetch } = useOperation(operationGuid, {
		enabled: !isNew && !!operationGuid
	})

	// Refetch operation data when modal opens (when isOpening becomes true)
	useEffect(() => {
		if (!isNew && operationGuid && isOpening) {
			console.log('Refetching operation data for guid:', operationGuid)
			refetch()
		}
	}, [isOpening, operationGuid, isNew, refetch])

	// Use full operation data if available, otherwise use passed operation
	const operationData = useMemo(() => {
		if (isNew) {
			console.log('Using new operation mode')
			return operation
		}
		if (fullOperationData?.data?.data?.data) {
			console.log('Using full operation data from API:', fullOperationData.data.data.data)
			return {
				...operation,
				rawData: fullOperationData.data.data.data
			}
		}
		console.log('Using passed operation data:', operation)
		return operation
	}, [isNew, operation, fullOperationData])

	// Determine if this is create or update
	const isUpdate = !isNew && !operation?.isCopy && (operationData?.rawData?.guid || operationData?.guid)

	// Current active tab
	const type = operationData?.type == 'Начисление' ? 'accrual' : operationData?.type == 'Поступление' ? 'income' : operationData?.type == 'Перемещение' ? 'transfer' : 'payment'
	const [activeTab, setActiveTab] = useState(type)
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
		if (operationData && (!isNew || operation?.isCopy) && operationData.rawData) {
			// Editing existing operation or copying - use rawData
			const raw = operationData.rawData
			const paymentDate = raw.data_operatsii
				? new Date(raw.data_operatsii).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0]
			const accrualDate = raw.data_nachisleniya
				? new Date(raw.data_nachisleniya).toISOString().split('T')[0]
				: paymentDate

			return {
				paymentDate,
				confirmPayment: raw.payment_confirmed !== undefined ? raw.payment_confirmed : (raw.oplata_podtverzhdena || false),
				accountAndLegalEntity: raw.my_accounts_id || raw.bank_accounts_id || null,
				amount: raw.summa ? formatAmount(Math.abs(raw.summa)) : '',
				counterparty: raw.counterparties_id || null,
				chartOfAccount: raw.chart_of_accounts_id || null,
				project: null,
				purchaseDeal: null,
				salesDeal: null,
				purpose: raw.opisanie || '',
				// For transfer
				fromDate: paymentDate,
				fromAccount: raw.my_accounts_id || raw.bank_accounts_id || null,
				fromAmount: raw.summa ? formatAmount(Math.abs(raw.summa)) : '',
				toDate: paymentDate,
				toAccount: null,
				toAmount: '0',
				// For accrual
				accrualDate,
				confirmAccrual: raw.payment_accrual !== undefined ? raw.payment_accrual : false,
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
			confirmPayment: true, // Включен по умолчанию
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
			confirmAccrual: true, // Включен по умолчанию
			legalEntity: null,
			expenseItem: null,
			cashMethod: true,
			creditItem: null,
			currenies_id: null,
		}
	}

	// Form states per tab
	const [formStates, setFormStates] = useState(() => {
		const init = getInitialFormData()
		return {
			income: { ...init },
			payment: { ...init },
			transfer: { ...init },
			accrual: { ...init }
		}
	})

	const formData = formStates[activeTab] || formStates['income'];

	const setFormData = (updater) => {
		setFormStates(prev => {
			const updated = typeof updater === 'function' ? updater(prev[activeTab]) : updater;
			return {
				...prev,
				[activeTab]: updated
			};
		});
	}

	// Update form data when operationData changes (for editing)
	useEffect(() => {
		if ((!isNew || operation?.isCopy) && operationData && !isLoadingOperation) {
			console.log('Updating form data with operationData:', operationData)
			const newFormData = getInitialFormData()
			console.log('New form data:', newFormData)
			setFormStates({
				income: { ...newFormData },
				payment: { ...newFormData },
				transfer: { ...newFormData },
				accrual: { ...newFormData }
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [operationData, isNew, isLoadingOperation])

	// Reset form when modal closes
	useEffect(() => {
		if (isClosing) {
			console.log('Modal closing, will reset form on next open')
		}
	}, [isClosing])

	// Reset form when modal opens
	useEffect(() => {
		if (isOpening) {
			console.log('Modal opening, resetting form')
			const newFormData = getInitialFormData()
			setFormStates({
				income: { ...newFormData },
				payment: { ...newFormData },
				transfer: { ...newFormData },
				accrual: { ...newFormData }
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpening])

	// Validation errors state
	const [errors, setErrors] = useState({})

	// Clear errors when switching tabs
	useEffect(() => {
		setErrors({})
	}, [activeTab])

	// Fetch data from API - using groups endpoint which includes children
	const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact({
		page: 1,
		limit: 100,
	})
	const { data: chartOfAccountsData, isLoading: loadingChartOfAccounts } = useChartOfAccountsPlanFact({
		page: 1,
		limit: 100,
	})
	const { data: bankAccountsData, isLoading: loadingBankAccounts } = useBankAccountsPlanFact({
		page: 1,
		limit: 100,
	})
	const { data: legalEntitiesData, isLoading: loadingLegalEntities } = useLegalEntitiesPlanFact({
		page: 1,
		limit: 100,
	})
	const { data: currenciesData, isLoading: loadingCurrencies } = useCurrencies({ limit: 100 })

	console.log(modalType)

	// Build tree structure for counterparties (groups and their children)
	// Use data directly from API - groups already contain children
	const counterAgentsTree = useMemo(() => {
		const groups = counterpartiesGroupsData?.data?.data?.data || []

		if (groups.length === 0) return []

		// Build tree structure directly from API response
		const buildTree = item => {
			// Check if this is a group with children
			if (item.children && Array.isArray(item.children) && item.children.length > 0) {
				return {
					value: item.guid,
					title: item.nazvanie_gruppy || 'Без названия',
					selectable: false, // Groups are not selectable
					children: item.children.map(child => ({
						value: child.guid,
						title: child.nazvanie || 'Без названия',
						selectable: true,
					}))
				}
			}

			// This is a standalone item (no children)
			return {
				value: item.guid,
				title: item.nazvanie_gruppy || item.nazvanie || 'Без названия',
				selectable: true,
			}
		}

		const tree = groups.map(buildTree)
		console.log('Built tree:', tree)
		return tree
	}, [counterpartiesGroupsData])

	// Also keep flat list for backward compatibility (if needed)
	const counterAgents = useMemo(() => {
		const groups = counterpartiesGroupsData?.data?.data?.data || []
		const flatList = []

		groups.forEach(group => {
			if (group.children && Array.isArray(group.children)) {
				group.children.forEach(child => {
					flatList.push({
						guid: child.guid,
						label: child.nazvanie || '',
						group: group.nazvanie_gruppy || 'Без группы',
					})
				})
			}
		})

		return flatList
	}, [counterpartiesGroupsData])

	// Transform legal entities data
	const legalEntities = useMemo(() => {
		const items = legalEntitiesData?.data?.data?.data || []
		return items.map(item => ({
			guid: item.guid,
			label: item.nazvanie || 'Без названия',
			group: 'Юрлица', // All legal entities in one group
		}))
	}, [legalEntitiesData])

	// Transform chart of accounts data - show only children of relevant root based on tab
	const chartOfAccountsTree = useMemo(() => {
		const rootItems = chartOfAccountsData?.data?.data?.data || []
		if (rootItems.length === 0) return []

		// Recursive function to transform tree
		const convertToTreeNode = (item) => {
			const children = item.children || []
			const transformedChildren = children.map(child => convertToTreeNode(child))

			return {
				value: item.guid || item.nazvanie,
				title: item.nazvanie || 'Без названия',
				selectable: true,
				children: transformedChildren.length > 0 ? transformedChildren : undefined,
			}
		}

		// For income tab - show only children of "Доходы"
		if (activeTab === 'income') {
			const incomeRoot = rootItems.find(item => item.nazvanie === 'Доходы')
			if (incomeRoot && incomeRoot.children) {
				return incomeRoot.children.map(child => convertToTreeNode(child))
			}
			return []
		}

		// For payment tab - show only children of "Расходы"
		if (activeTab === 'payment') {
			const expenseRoot = rootItems.find(item => item.nazvanie === 'Расходы')
			if (expenseRoot && expenseRoot.children) {
				return expenseRoot.children.map(child => convertToTreeNode(child))
			}
			return []
		}

		// For accrual tab - show children of Актив, Обязательства, Капитал
		if (activeTab === 'accrual') {
			const result = []
			const allowedRoots = ['Актив', 'Обязательства', 'Капитал']

			allowedRoots.forEach(rootName => {
				const root = rootItems.find(item => item.nazvanie === rootName)
				if (root && root.children) {
					// Add children of this root
					root.children.forEach(child => {
						result.push(convertToTreeNode(child))
					})
				}
			})

			return result
		}

		// For transfer tab - no chart of accounts needed
		if (activeTab === 'transfer') {
			return []
		}

		// Default - show all
		return rootItems.map(item => convertToTreeNode(item))
	}, [chartOfAccountsData, activeTab])

	const bankAccounts = useMemo(() => {
		const items = bankAccountsData?.data?.data?.data || []
		const legalEntitiesItems = legalEntitiesData?.data?.data?.data || []
		const currenciesItems = currenciesData?.data?.data?.response || currenciesData?.data?.response || []

		// Create a map of legal entities by guid for quick lookup
		const legalEntitiesMap = new Map()
		legalEntitiesItems.forEach(entity => {
			legalEntitiesMap.set(entity.guid, entity.nazvanie || 'Без названия')
		})

		// Create a map of currencies by guid for quick lookup
		const currenciesMap = new Map()
		currenciesItems.forEach(currency => {
			currenciesMap.set(currency.guid, {
				kod: currency.kod || '',
				nazvanie: currency.nazvanie || ''
			})
		})

		return items.map(item => ({
			guid: item.guid,
			label: item.nazvanie || '',
			group: item.legal_entity_id && legalEntitiesMap.has(item.legal_entity_id)
				? legalEntitiesMap.get(item.legal_entity_id)
				: 'Без группы',
			currenies_id: item.currenies_id || null,
			currenies_kod: item.currenies_kod || '',
			// Build currenies_id_data from currencies map
			currenies_id_data: item.currenies_id && currenciesMap.has(item.currenies_id)
				? currenciesMap.get(item.currenies_id)
				: null,
		}))
	}, [bankAccountsData, legalEntitiesData, currenciesData])

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
		// if ('formData.confirmPayment') return
		try {
			// Validation for income tab
			if (activeTab === 'income') {
				const validationErrors = {}


				if (!formData.accountAndLegalEntity) {
					validationErrors.accountAndLegalEntity = 'Не выбран счет и юрлицо'
				}
				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Укажите назначение платежа'
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


				if (!formData.accountAndLegalEntity) {
					validationErrors.accountAndLegalEntity = 'Не выбран счет и юрлицо'
				}

				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Укажите назначение платежа'
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


				if (!formData.fromAccount) {
					validationErrors.fromAccount = 'Не выбран счет и юрлицо'
				}

				if (!formData.toAccount) {
					validationErrors.toAccount = 'Не выбран счет и юрлицо'
				}
				if (!formData.toAmount || parseFloat(formData.toAmount) <= 0) {
					validationErrors.toAmount = 'Не указана сумма'
				}
				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Укажите назначение платежа'
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


				if (!formData.legalEntity) {
					validationErrors.legalEntity = 'Не выбрано юрлицо'
				}
				if (!formData.expenseItem) {
					validationErrors.expenseItem = 'Не выбрана статья по дебету'
				}

				if (!formData.creditItem) {
					validationErrors.creditItem = 'Не выбрана статья по кредиту'
				}
				if (!formData.purpose || formData.purpose.trim() === '') {
					validationErrors.purpose = 'Укажите назначение'
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


			// Build request data object with all fields
			const requestData = {
				tip: [tipMap[activeTab] || 'Поступление'],
				data_operatsii: paymentDate.toISOString(),
				data_nachisleniya:
					activeTab === 'accrual' ? accrualDate.toISOString() : paymentDate.toISOString(),
				summa: parseFloat(formData.amount?.toString().replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '')) || 0,
				opisanie: formData.purpose || '',
				oplata_podtverzhdena: formData.confirmPayment || false,
				payment_confirmed: formData.confirmPayment || false,
				payment_accrual: formData.confirmAccrual || false,
				data_sozdaniya: now.toISOString(),
				data_obnovleniya: now.toISOString(),
			}


			// Special handling for transfer operations
			if (activeTab === 'transfer') {
				// For transfer, use fromAccount as my_accounts_id and toAccount as my_accounts_id_2
				requestData.my_accounts_id = formData.fromAccount || null
				requestData.my_accounts_id_2 = formData.toAccount || null
				requestData.summa = parseFloat(formData.fromAmount?.toString().replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '')) || 0

				// Get currency from fromAccount
				const fromAccount = bankAccounts.find(acc => acc.guid === formData.fromAccount)
				if (fromAccount && fromAccount.currenies_id) {
					requestData.currenies_id = fromAccount.currenies_id
				} else {
					requestData.currenies_id = null
				}
			} else {
				// Add fields, use null for empty values
				requestData.my_accounts_id = formData.accountAndLegalEntity || null
				requestData.counterparties_id = formData.counterparty || null
				requestData.chart_of_accounts_id = formData.chartOfAccount || null
				requestData.legal_entity_id = formData.legalEntity || null
				requestData.currenies_id = currencyId || null
			}

			// Convert empty strings to null
			Object.keys(requestData).forEach(key => {
				if (requestData[key] === '' || requestData[key] === undefined) {
					requestData[key] = null
				}
			})


			const updateGuid = (!isNew && !operation?.isCopy) ? (operationData?.rawData?.guid || operationData?.guid) : null

			// console.log('=== Submit Operation Debug ===')
			// console.log('isNew:', isNew)
			// console.log('isUpdate:', isUpdate)
			// console.log('updateGuid:', updateGuid)
			// console.log('operationData:', operationData)
			// console.log('operationData.rawData:', operationData?.rawData)

			// For update, add guid and preserve original creation date
			if (isUpdate && updateGuid) {
				requestData.guid = updateGuid
				console.log('Adding guid to request:', updateGuid)

				// Keep original creation date for update
				if (operationData.rawData?.data_sozdaniya) {
					requestData.data_sozdaniya = operationData.rawData.data_sozdaniya
				}
			}

			// Build request body for invoke_function API
			const apiRequestBody = {
				auth: {
					type: 'apikey',
					data: {}
				},
				data: {
					app_id: '3ed54a59-5eda-4cfe-b4ae-8a201c1ea4ed',
					environment_id: 'fc258dff-47c0-4ab1-9beb-91a045b4847c',
					project_id: '3ed54a59-5eda-4cfe-b4ae-8a201c1ea4ed',
					method: isUpdate ? 'update_operation' : 'create_operation',
					user_id: '',
					object_data: requestData
				}
			}

			console.log(
				`${isUpdate ? 'Updating' : 'Creating'} operation with data:`,
				JSON.stringify(apiRequestBody, null, 2),
			)
			console.log('Form data:', formData)
			console.log(
				'Selected account:',
				formData.accountAndLegalEntity
					? bankAccounts.find(acc => acc.guid === formData.accountAndLegalEntity)
					: 'none',
			)

			// Call API directly
			const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
			const apiUrl = 'https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact'

			const headers = {
				'Content-Type': 'application/json',
			}

			if (authToken) {
				headers['Authorization'] = `Bearer ${authToken}`
			}

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers,
				body: JSON.stringify(apiRequestBody),
			})

			const result = await response.json()

			// Check for error status - API can return ERROR, INVALID_ARGUMENT, etc.
			if (result.status && result.status !== 'CREATED' && result.status !== 'OK' && result.status !== 'SUCCESS') {
				throw new Error(
					result.data ||
					result.description ||
					`Ошибка при ${isUpdate ? 'обновлении' : 'создании'} операции`,
				)
			}

			console.log('API Response:', result)

			showSuccessNotification(`Операция успешно ${isUpdate ? 'обновлена' : 'создана'}!`)

			// Вызываем callback для обновления локального состояния
			if (onSuccess) {
				let operationData
				if (isUpdate) {
					// For update, merge request data with guid and timestamps
					operationData = {
						...requestData,
						guid: updateGuid,
						data_obnovleniya: now.toISOString()
					}
				} else {
					// For create, use data from API response
					const apiData = result?.data?.data?.data || result?.data?.data
					if (apiData && typeof apiData === 'object') {
						operationData = apiData
					} else {
						// Fallback if API doesn't return full data
						operationData = {
							...requestData,
							guid: result?.data?.guid || apiData?.guid,
							data_sozdaniya: now.toISOString(),
							data_obnovleniya: now.toISOString()
						}
					}
				}
				console.log('Calling onSuccess with operationData:', operationData)
				onSuccess(operationData, isUpdate)
			}

			// Обновляем связанные запросы в фоне
			queryClient.invalidateQueries({ queryKey: ['dashboard'] })
			queryClient.invalidateQueries({ queryKey: ['operationsList'] })
			queryClient.invalidateQueries({ queryKey: ['operations'] })

			onClose()
		} catch (error) {
			console.error(
				`Error ${!isNew && operationData?.rawData?.guid ? 'updating' : 'creating'} operation:`,
				error,
			)
			showErrorNotification(
				error.message ||
				`Ошибка при ${!isNew && operationData?.rawData?.guid ? 'обновлении' : 'создании'} операции`,
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Don't return null for new operations
	// Show loading state while fetching operation data
	if (!isNew && isLoadingOperation) {
		return (
			<div className={styles.loadingOverlay}>
				<div className={styles.loadingSpinner}></div>
				<span>Загрузка операции...</span>
			</div>
		)
	}

	if (!operationData && !isNew) return null

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
								{!isNew && <div className={styles.headerDate}>
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
									<span>Создана {operationData?.createdAt || '—'}</span>
								</div>}
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
											Дата оплаты
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
												className={styles.datePicker}
												placeholder='Выберите дату'
												showCheckbox={true}
												checkboxLabel='Подтвердить оплату'
												checkboxValue={formData.confirmPayment}
												onCheckboxChange={checked =>
													setFormData({ ...formData, confirmPayment: checked })
												}
											/>
											{errors.paymentDate && (
												<span className={styles.errorText}>{errors.paymentDate}</span>
											)}
										</div>
									</div>

									{/* Счет и юрлицо currenies_id currencyID */}
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
												groupBy={false}
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

									{/* Сумма new form value summa */}
									<div className={styles.formRow}>
										<label className={styles.label}>
											Сумма
										</label>
										<div className={styles.fieldWrapper}>
											<div className={styles.inputGroup}>
												<Input
													value={formatAmount(formData.amount)}
													onChange={e => {
														setFormData({ ...formData, amount: parseAmount(e.target.value) })
														if (errors.amount) {
															setErrors({ ...errors, amount: null })
														}
													}}
													placeholder='0'
													className={styles.input}
												/>
												<div>
													{!formData.confirmPayment && formData.confirmAccrual && <DebitIcon />}
													{formData.confirmPayment && !formData.confirmAccrual && <CreditIcon />}
												</div>
												{getAccountCurrency(formData.accountAndLegalEntity) && <div className={styles.currencyDisplay}>
													{getAccountCurrency(formData.accountAndLegalEntity) || 'Выберите счет'}
												</div>}
											</div>
										</div>
									</div>

									{/* Дата начисления new value data_nachisleniya if confirmAccrual is true */}
									<div className={styles.formRow}>
										<label className={styles.label}>Дата начисления</label>
										<DatePicker
											value={formData.accrualDate}
											onChange={value => setFormData({ ...formData, accrualDate: value })}
											placeholder='Выберите дату'
											showCheckbox
											className={styles.datePicker}
											checkboxLabel='Подтвердить начисление'
											checkboxValue={formData.confirmAccrual}
											onCheckboxChange={checked =>
												//  payment_accrual
												setFormData({ ...formData, confirmAccrual: checked })
											}
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
											data={chartOfAccountsTree}
											alwaysExpanded={true}
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
											<TextArea
												value={formData.purpose}
												onChange={e => {
													setFormData({ ...formData, purpose: e.target.value })
													if (errors.purpose) {
														setErrors({ ...errors, purpose: null })
													}
												}}
												placeholder='Назначение платежа'
												rows={3}
												error={errors.purpose}
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
											Дата оплаты
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
												className={[styles.datePicker, errors.paymentDate ? styles.error : ''].join(' ')}
											/>
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
												groupBy={false}
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
											Сумма
										</label>
										<div className={styles.fieldWrapper}>
											<div className={styles.inputGroup}>
												<Input
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
												<div>
													{!formData.confirmPayment && formData.confirmAccrual && <DebitIcon />}
													{formData.confirmPayment && !formData.confirmAccrual && <CreditIcon />}
												</div>
												{getAccountCurrency(formData.accountAndLegalEntity) && <div className={styles.currencyDisplay}>
													{getAccountCurrency(formData.accountAndLegalEntity)}
												</div>}
											</div>

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
											checkboxValue={formData.confirmAccrual}
											onCheckboxChange={checked =>
												setFormData({ ...formData, confirmAccrual: checked })
											}
											className={cn(styles.datePicker, errors.accrualDate ? styles.error : '')}
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
											data={chartOfAccountsTree}
											alwaysExpanded={true}
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
											<TextArea
												value={formData.purpose}
												onChange={e => {
													setFormData({ ...formData, purpose: e.target.value })
													if (errors.purpose) {
														setErrors({ ...errors, purpose: null })
													}
												}}
												placeholder='Назначение платежа'
												rows={3}
												error={errors.purpose}
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
												Дата оплаты
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
													className={[styles.datePicker, errors.fromDate ? styles.error : ''].join(' ')}
												/>
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
													groupBy={false}
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
												Сумма списания
											</label>
											<div className={styles.fieldWrapper}>
												<div className={styles.inputGroup}>
													<Input
														type='text'
														value={formatAmount(formData.fromAmount)}
														onChange={e => {
															setFormData({ ...formData, fromAmount: parseAmount(e.target.value) })

														}}
														placeholder='0'
														className={cn(styles.input)}
													/>
													{getAccountCurrency(formData.fromAccount) && <div className={styles.currencyDisplay}>
														{getAccountCurrency(formData.fromAccount)}
													</div>}
												</div>
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
												Дата
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
													className={[styles.datePicker, errors.toDate ? styles.error : ''].join(' ')}
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
													groupBy={false}
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
													<Input
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
													{getAccountCurrency(formData.toAccount) && <div className={styles.currencyDisplay}>
														{getAccountCurrency(formData.toAccount)}
													</div>}
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
												<TextArea
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
												Дата начисления
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
													className={[styles.datePicker, errors.accrualDate ? styles.error : ''].join(' ')}
												/>
											</div>
										</div>

										{/* Подтвердить начисление */}
										<div className={styles.formRow}>
											<div className={styles.labelSpacer}></div>

											<OperationCheckbox
												checked={formData.confirmAccrual}
												label='Подтвердить начисление'
												onChange={e => setFormData({ ...formData, confirmAccrual: e.target.checked })}
											/>
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
													data={chartOfAccountsTree}
													alwaysExpanded={true}
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
												Сумма
											</label>
											<div className={styles.fieldWrapper}>
												<div className={styles.inputGroup}>
													<Input
														type='text'
														value={formatAmount(formData.amount)}
														onChange={e => {
															setFormData({ ...formData, amount: parseAmount(e.target.value) })

														}}
														placeholder='0'
														className={cn(styles.input, errors.amount && styles.error)}
													/>
													{getLegalEntityCurrency(formData.legalEntity) && <div className={styles.currencyDisplay}>
														{getLegalEntityCurrency(formData.legalEntity)}
													</div>}
												</div>
											</div>
										</div>

										{/* Учитывать в ОПиУ кассовым методом */}
										<div className={styles.formRow}>
											<div className={styles.labelSpacer}></div>
											<OperationCheckbox
												checked={formData.cashMethod}
												label='Учитывать в ОПиУ кассовым методом'
												onChange={e => setFormData({ ...formData, cashMethod: e.target.checked })}
											/>
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
													data={chartOfAccountsTree}
													alwaysExpanded={true}
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



										{/* Назначение */}
										<div className={styles.formRowStart}>
											<label className={styles.label} style={{ paddingTop: '0.5rem' }}>
												Назначение <span className={styles.required}>*</span>
											</label>
											<div className={styles.fieldWrapper}>
												<TextArea
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

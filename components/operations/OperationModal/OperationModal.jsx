'use client'
import React, { useReducer, useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/app/lib/utils'
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
import { FilesClipIcon } from '../../../constants/icons'
import SentMessages from './SentMessages'
import IncomeForm from './Forms/Income'
import PaymentForm from './Forms/Payment'
import AccuralForm from './Forms/Accural'
import { observer } from 'mobx-react-lite'
import { useUcodeDefaultApiQuery, useUcodeRequestMutation, useUcodeRequestQuery } from '../../../hooks/useDashboard'
import Loader from '../../shared/Loader'
import CustomModal from '../../shared/CustomModal'
import { authStore } from '../../../store/auth.store'
import { formatDateRu } from '../../../utils/helpers'
import SelectMyAccounts from '../../ReadyComponents/SelectMyAccounts'
import CustomDatePicker from '../../shared/DatePicker'

const today = new Date().toISOString().split('T')[0]
const todayDate = new Date().getDate()

const emptyRow = (preselectedCounterparty = '') => ({
	calculationDate: today,
	isCalculationCommitted: true,
	contrAgentId: preselectedCounterparty,
	operationCategoryId: '',
	value: '',
	percent: '',
})


function rowsReducer(state, action) {
	switch (action.type) {
		case 'ADD': {
			const newState = [...state, emptyRow()]
			// Calculate divide equal on the new state
			const count = newState.length
			const totalAmount = parseFloat(action.amount) || 0
			const equalValue = Math.floor((totalAmount / count) * 100) / 100
			const equalPercent = Math.floor((100 / count) * 100) / 100
			const lastValue = +(totalAmount - equalValue * (count - 1)).toFixed(2)
			const lastPercent = +(100 - equalPercent * (count - 1)).toFixed(2)

			return newState.map((row, i) => ({
				...row,
				value: i === count - 1 ? String(lastValue) : String(equalValue),
				percent: i === count - 1 ? String(Number(lastPercent).toFixed(2)).replace('.00', '') : String(Number(equalPercent).toFixed(2)).replace('.00', ''),
			}))
		}
		case 'REMOVE': {
			const newState = state.filter((_, i) => i !== action.index)
			const count = newState.length
			if (count === 0) return newState
			const totalAmount = parseFloat(action.amount) || 0
			const remainingPercentSum = newState.reduce((s, r) => s + (parseFloat(r.percent) || 0), 0)

			if (remainingPercentSum > 0) {
				let remainingValueForFinal = totalAmount
				let remainingPercentForFinal = 100
				return newState.map((row, i) => {
					if (i === count - 1) {
						return {
							...row,
							value: String(remainingValueForFinal.toFixed(2)).replace('.00', ''),
							percent: String(remainingPercentForFinal.toFixed(2)).replace('.00', '')
						}
					}
					const rowPercent = parseFloat(row.percent) || 0
					const scaledPercent = (rowPercent / remainingPercentSum) * 100
					const rowValue = Math.floor(totalAmount * (scaledPercent / 100) * 100) / 100
					const calculatedPercent = Math.floor(scaledPercent * 100) / 100

					remainingValueForFinal -= rowValue
					remainingPercentForFinal -= calculatedPercent

					return {
						...row,
						value: String(rowValue.toFixed(2)).replace('.00', ''),
						percent: String(calculatedPercent.toFixed(2)).replace('.00', '')
					}
				})
			} else {
				const equalValue = Math.floor((totalAmount / count) * 100) / 100
				const equalPercent = Math.floor((100 / count) * 100) / 100
				const lastValue = +(totalAmount - equalValue * (count - 1)).toFixed(2)
				const lastPercent = +(100 - equalPercent * (count - 1)).toFixed(2)
				return newState.map((row, i) => ({
					...row,
					value: i === count - 1 ? String(lastValue) : String(equalValue),
					percent: i === count - 1 ? String(Number(lastPercent).toFixed(2)).replace('.00', '') : String(Number(equalPercent).toFixed(2)).replace('.00', ''),
				}))
			}
		}
		case 'UPDATE': {
			if (action.field === 'calculationDate') {
				const pickDate = Number(action.value?.slice(-2))
				const isFuture = pickDate > todayDate
				return state.map((row, i) =>
					i === action.index ? { ...row, [action.field]: action.value, isCalculationCommitted: isFuture ? false : true } : row
				)
			}
			if (action.field === 'value' && action.amount) {
				const numAmount = Number(String(action.amount).replace(/\s/g, ''))
				let percent = ''
				if (numAmount > 0 && action.value !== '') {
					percent = String(Number((Number(action.value) / numAmount) * 100).toFixed(2))
					if (percent.endsWith('.00')) percent = parseInt(percent).toString()
				}
				let newState = state.map((row, i) =>
					i === action.index ? { ...row, value: action.value, percent } : row
				)

				if (numAmount > 0) {
					const totalValues = newState.reduce((s, r) => s + (Number(String(r.value).replace(/\s/g, '')) || 0), 0)
					if (Math.abs(totalValues - numAmount) < 0.01) {
						const totalPercent = newState.reduce((s, r) => s + (parseFloat(r.percent) || 0), 0)
						if (Math.abs(totalPercent - 100) > 0.001) {
							const residual = 100 - (totalPercent - (parseFloat(percent) || 0));
							newState = newState.map((row, i) =>
								i === action.index ? {
									...row,
									percent: String(Number(residual).toFixed(2)).replace('.00', '')
								} : row
							)
						}
					}
				}
				return newState
			}
			if (action.field === 'percent' && action.amount) {
				const numAmount = Number(String(action.amount).replace(/\s/g, ''))
				let value = ''
				let calculatedValueStr = ''
				if (numAmount > 0 && action.value !== '') {
					value = String(((Number(action.value) / 100) * numAmount).toFixed(2))
					calculatedValueStr = value.endsWith('.00') ? parseInt(value).toString() : value
				}
				let newState = state.map((row, i) =>
					i === action.index ? { ...row, percent: action.value, value: calculatedValueStr } : row
				)

				if (numAmount > 0) {
					const totalPercents = newState.reduce((s, r) => s + (parseFloat(r.percent) || 0), 0)
					if (Math.abs(totalPercents - 100) < 0.01) {
						const totalValues = newState.reduce((s, r) => s + (Number(String(r.value).replace(/\s/g, '')) || 0), 0)
						if (Math.abs(totalValues - numAmount) > 0.001) {
							const residualValue = numAmount - (totalValues - (Number(calculatedValueStr) || 0));
							newState = newState.map((row, i) =>
								i === action.index ? {
									...row,
									value: String(Number(residualValue).toFixed(2)).replace('.00', '')
								} : row
							)
						}
					}
				}
				return newState
			}
			return state.map((row, i) =>
				i === action.index ? { ...row, [action.field]: action.value } : row
			)
		}

		case 'RECALCULATE_VALUES': {
			// Used when the parent 'amount' changes. Keep percentages as close as possible, scaling values.
			const totalAmount = parseFloat(action.amount) || 0
			if (state.length === 0 || totalAmount === 0) return state

			const currentTotalPercent = state.reduce((s, r) => s + (parseFloat(r.percent) || 0), 0)
			const scaleRatio = currentTotalPercent > 0 ? (100 / currentTotalPercent) : 0

			let remainingValue = totalAmount
			let remainingPercent = 100
			const lastIdx = state.length - 1

			return state.map((row, i) => {
				if (i === lastIdx) {
					return {
						...row,
						value: String(remainingValue.toFixed(2)).replace('.00', ''),
						percent: String(remainingPercent.toFixed(2)).replace('.00', '')
					}
				}
				const rowPercent = parseFloat(row.percent) || 0
				const targetPercent = rowPercent * scaleRatio

				const rowValue = Math.floor(totalAmount * (targetPercent / 100) * 100) / 100
				const actualPercent = Math.floor(targetPercent * 100) / 100

				remainingValue -= rowValue
				remainingPercent -= actualPercent
				return {
					...row,
					value: String(rowValue.toFixed(2)).replace('.00', ''),
					percent: String(actualPercent.toFixed(2)).replace('.00', '')
				}
			})
		}
		case 'DIVIDE_EQUAL': {
			const count = state.length
			if (count === 0) return state
			const totalAmount = parseFloat(action.amount) || 0
			const equalValue = Math.floor((totalAmount / count) * 100) / 100
			const equalPercent = Math.floor((100 / count) * 100) / 100
			const lastValue = +(totalAmount - equalValue * (count - 1)).toFixed(2)
			const lastPercent = +(100 - equalPercent * (count - 1)).toFixed(2)
			return state.map((row, i) => ({
				...row,
				value: i === count - 1 ? String(lastValue) : String(equalValue),
				percent: i === count - 1 ? String(Number(lastPercent).toFixed(2)).replace('.00', '') : String(Number(equalPercent).toFixed(2)).replace('.00', ''),
			}))
		}
		case 'RESET':
			return [emptyRow()]
		case 'SET_ROWS':
			return action.payload
		default:
			return state
	}
}


const OperationModal = observer(({
	operation,
	isClosing,
	isOpening,
	onClose,
	onSuccess,
	preselectedCounterparty = null,
	disableCounterpartySelect = false,
	defaultDealGuid = null,
	initialTab = 'income',
}) => {
	const queryClient = useQueryClient()
	const isNew = operation?.isNew || false


	const operationGuid = useMemo(() => {
		if (isNew) return null
		return operation?.guid || operation?.guid || null
	}, [isNew, operation])


	// Fetch full operation data if editing existing operation
	const { data: fullOperationData, isLoading: isLoadingOperation, refetch } = useOperation(operationGuid, {
		enabled: !isNew && !!operationGuid
	})

	const { data: dealsData } = useUcodeDefaultApiQuery({
		queryKey: 'deals',
		urlMethod: 'GET',
		urlParams: '/items/sales_transactions?from-ofs=true&offset=0&limit=100'
	});


	const formattedDeals = useMemo(() => {
		const items = dealsData?.data?.data?.response || [];
		return items.map(deal => ({
			guid: deal.guid,
			label: deal.name,
		}));
	}, [dealsData]);



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
			return operation
		}
		if (fullOperationData?.data?.data?.data) {
			return {
				...operation,
				rawData: fullOperationData.data.data.data
			}
		}
		return operation
	}, [isNew, operation, fullOperationData])

	// Determine if this is create or update
	const isUpdate = !isNew && !operation?.isCopy && (operationData?.rawData?.guid || operationData?.guid)

	// console.log('operationData', operationData)

	// Current active tab 
	const type = operationData?.tip == 'Начисление' ? 'accrual' : operationData?.tip == 'Поступление' ? 'income' : operationData?.tip == 'Перемещение' ? 'transfer' : operationData?.tip == 'Выплата' ? 'payment' : (initialTab || 'income')
	const [activeTab, setActiveTab] = useState(type)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false)

	// Разбить сумму
	const [divivedAmounts, setdivivedAmounts] = useState([])
	const [rows, dispatch] = useReducer(rowsReducer, [emptyRow(disableCounterpartySelect && preselectedCounterparty), emptyRow()])
	const [selectedSplits, setSelectedSplits] = useState([])
	const [isDateModalOpen, setIsDateModalOpen] = useState(false)
	const [tempSalesDeal, setTempSalesDeal] = useState(null)

	const has = (label) => selectedSplits.some(s => s.value === label)
	const showDate = has('Начисление')
	const showAgent = has('Контрагент')
	const showStatya = has('Статья')


	const calculatePercent = (partAmount, totalAmount) => {
		const numPart = Number(String(partAmount || 0).replace(/\s/g, ''))
		const numTotal = Number(String(totalAmount || 0).replace(/\s/g, ''))
		if (!numTotal || numTotal === 0) return '0.00'
		return ((numPart / numTotal) * 100).toFixed(2)
	}

	useEffect(() => {
		if (operationData?.operationParts && operationData?.operationParts?.length > 0) {
			const cleanNum = (val) => Number(String(val || 0).replace(/\s/g, ''))
			const totalAmount = operationData.summa || operationData.amount || operationData.operationParts.reduce((sum, p) => sum + cleanNum(p.summa || p.amount || p.value), 0)
			const newRows = operationData.operationParts.map(part => ({
				calculationDate: part.data_nachisleniya ? part.data_nachisleniya : today,
				isCalculationCommitted: part.payment_accrual !== undefined ? part.payment_accrual : true,
				contrAgentId: part.counterparties_id || '',
				operationCategoryId: part.chart_of_accounts_id || part.operationCategoryId || '',
				value: String(part?.summa || part?.amount || part?.value || '').replace(/\s/g, ''),
				percent: calculatePercent(part.summa || part?.amount || part?.value, totalAmount),
			}))

			dispatch({ type: 'SET_ROWS', payload: newRows })

			const newSelectedSplits = []
			if (operationData.operationParts.some(p => p.data_nachisleniya || p.payment_accrual !== undefined)) {
				newSelectedSplits.push({ value: 'Начисление', label: 'Начисление' })
			}
			if (operationData.operationParts.some(p => p.counterparties_id)) {
				newSelectedSplits.push({ value: 'Контрагент', label: 'Контрагент' })
			}
			if (operationData.operationParts.some(p => p.chart_of_accounts_id || p.operationCategoryId)) {
				newSelectedSplits.push({ value: 'Статья', label: 'Статья' })
			}
			setSelectedSplits(newSelectedSplits)
		}
	}, [operationData])

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
		const digitsOnly = value.toString().replace(/\D/g, '')
		if (!digitsOnly) return ''
		return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	}

	// Parse formatted amount back to number (1 000 000 -> 1000000)
	const parseAmount = value => {
		if (!value) return ''
		return value.toString().replace(/\s/g, '')
	}

	console.log('operationData', operationData)

	// Initialize form data from operation or defaults
	const getInitialFormData = () => {
		if (operationData && (!isNew || operation?.isCopy)) {
			const raw = operationData
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
				salesDeal: raw.selling_deal_id || null,
				purpose: raw.opisanie || '',
				// For transfer
				fromDate: new Date(paymentDate),
				fromAccount: raw.my_accounts_id || raw.bank_accounts_id || null,
				fromAmount: raw.summa ? formatAmount(Math.abs(raw.summa)) : '',
				toDate: new Date(accrualDate),
				toAccount: raw.my_accounts_id_2 || raw.bank_accounts_id_2 || null,
				toAmount: '0',
				// For accrual
				accrualDate,
				confirmAccrual: raw.payment_accrual !== undefined ? raw.payment_accrual : false,
				legalEntity: raw.legal_entity_id || null,
				expenseItem: raw.chart_of_accounts_id || null,
				cashMethod: true,
				creditItem: null,
				currenies_id: raw.currenies_id || null,
				paymentType: '',
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
			salesDeal: defaultDealGuid || null,
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

	// const { data: counterpartyData } = useUcodeRequestQuery({
	// 	method: "get_counterparties",
	// 	data: {
	// 		contrAgentId: formData.counterparty
	// 	},
	// 	querySetting: {
	// 		select: (response) => response?.data?.data?.data?.[0],
	// 		enable: !!formData.counterparty
	// 	}
	// })

	// console.log('counterpartyData', counterpartyData)

	// useEffect(() => {
	// 	if (counterpartyData?.chart_of_accounts_id || counterpartyData?.chart_of_accounts_id_2) {
	// 		setFormData({ ...formData, chartOfAccount: activeTab === 'income' ? counterpartyData.chart_of_accounts_id : counterpartyData.chart_of_accounts_id_2 })
	// 	}
	// }, [counterpartyData, formData])

	const setFormData = useCallback((updater) => {
		setFormStates(prev => {
			const updated = typeof updater === 'function' ? updater(prev[activeTab]) : updater;
			return {
				...prev,
				[activeTab]: updated
			};
		});
	}, [activeTab]);

	// Update form data when operationData changes (for editing)
	useEffect(() => {
		if ((!isNew || operation?.isCopy) && operationData && !isLoadingOperation) {
			const newFormData = getInitialFormData()
			setFormStates({
				income: { ...newFormData },
				payment: { ...newFormData },
				transfer: { ...newFormData },
				accrual: { ...newFormData }
			})

			// Set active tab based on operation type
			const newType = operationData?.tip == 'Начисление' ? 'accrual' : operationData?.tip == 'Поступление' ? 'income' : operationData?.tip == 'Перемещение' ? 'transfer' : operationData?.tip == 'Выплата' ? 'payment' : (initialTab || 'income')
			setActiveTab(newType)
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

	// Clear errors and reset split rows when switching tabs
	const prevActiveTab = useRef(activeTab)
	useEffect(() => {
		if (prevActiveTab.current !== activeTab) {
			prevActiveTab.current = activeTab
			setErrors({})
			dispatch({ type: 'RESET' })
		}
	}, [activeTab])

	// Fetch data from API - using groups endpoint which includes children
	const { data: counterpartiesGroupsData, isLoading: isLoadingGroups } = useCounterpartiesGroupsPlanFact({
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
	const { data: currenciesData } = useCurrencies({ limit: 100 })

	const { mutateAsync: createUcodeOperation, isPending: isLoadingUcodeOperation } = useUcodeRequestMutation()


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
				selectable: transformedChildren.length > 0 ? false : true,
				children: transformedChildren.length > 0 ? transformedChildren : undefined,
			}
		}

		// Default - show all
		return rootItems.map(item => convertToTreeNode(item))
	}, [chartOfAccountsData])


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

	const isSameCurrency = useMemo(() => {
		if (activeTab !== 'transfer' || !formData.fromAccount || !formData.toAccount) return false;
		const fromCurrency = bankAccounts.find(acc => acc.guid === formData.fromAccount)?.currenies_id;
		const toCurrency = bankAccounts.find(acc => acc.guid === formData.toAccount)?.currenies_id;
		return fromCurrency && toCurrency && fromCurrency === toCurrency;
	}, [formData.fromAccount, formData.toAccount, bankAccounts, activeTab]);

	useEffect(() => {
		if (activeTab === 'transfer' && isSameCurrency) {
			setFormData(prev => ({ ...prev, toAmount: prev.fromAmount }));
		}
	}, [formData.fromAmount, isSameCurrency, activeTab, setFormData]);

	// Get currency from selected account
	const getAccountCurrency = accountGuid => {
		if (!accountGuid) return null
		const account = bankAccounts.find(acc => acc.guid === accountGuid)
		if (!account || !account.currenies_id_data) return null
		return `${account.currenies_id_data.kod || ''} (${account.currenies_id_data.nazvanie || ''})`.trim()
	}

	// Get currency from selected legal entity (through its accounts)

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
				// if (!formData.toAmount || parseFloat(formData.toAmount) <= 0) {
				// 	validationErrors.toAmount = 'Не указана сумма'
				// }

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
				paymentDate = now
			}
			if (isNaN(accrualDate.getTime())) {
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
				data_operatsii: activeTab === 'accrual' ? null : formData?.paymentDate,
				data_nachisleniya: formData?.salesDeal ? null : formData?.accrualDate,
				opisanie: formData.purpose || '',
				summa: Number(activeTab === 'transfer' ? Number(formData.fromAmount || formData.toAmount || 0) : Number(activeTab === 'accrual' ? formData.amount || 0 : formData.amount || 0).toFixed(2)),
				oplata_podtverzhdena: formData.confirmPayment || false,
				payment_confirmed: formData.confirmPayment || false,
				payment_accrual: activeTab === 'transfer' || activeTab === 'accrual' ? false : formData.confirmAccrual,
				operationType: activeTab,
				legal_entity_id: authStore.userData?.legal_entity_id || null
			}

			if (divivedAmounts.length > 0) {
				requestData.items = divivedAmounts.map(item => ({
					summa: Number(item?.value),
					percent: Number(item?.percent),
					data_nachisleniya: showDate && !formData.salesDeal ? (item?.calculationDate || null) : null,
					payment_accrual: showDate && !formData.salesDeal ? (item?.isCalculationCommitted ?? false) : false,
					counterparties_id: showAgent ? (item?.contrAgentId || null) : null,
					chart_of_accounts_id: showStatya ? (item?.operationCategoryId || null) : null,
				}))
			}

			// Special handling for transfer operations
			if (activeTab === 'transfer') {
				// For transfer, use fromAccount as my_accounts_id and toAccount as my_accounts_id_2
				requestData.my_accounts_id = formData.fromAccount || null
				requestData.my_accounts_id_2 = formData.toAccount || null
				requestData.summa = parseFloat(formData.fromAmount?.toString().replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '')) || 0

				requestData.data_operatsii = formData.fromDate
				requestData.data_nachisleniya = formData.toDate

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
			}

			if (activeTab === 'income' || activeTab === 'payment') {
				requestData.sales_transactions = formData.salesDeal || null
				requestData.selling_deal_id = formData.salesDeal || null
				requestData.deal_id = formData.salesDeal || null
			}

			// Convert empty strings to null
			Object.keys(requestData).forEach(key => {
				if (requestData[key] === '' || requestData[key] === undefined) {
					requestData[key] = null
				}
			})

			const updateGuid = (!isNew && !operation?.isCopy) ? (operationData?.rawData?.guid || operationData?.guid) : null

			// For update, add guid and preserve original creation date
			if (isUpdate && updateGuid) {
				requestData.guid = updateGuid

				// Keep original creation date for update
				if (operationData.rawData?.data_sozdaniya) {
					requestData.data_sozdaniya = operationData.rawData.data_sozdaniya
				}
			}

			const result = await createUcodeOperation({ method: isUpdate ? 'update_operation' : 'create_operation', data: requestData })

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
					const apiData = result?.data?.data?.data || result?.data?.data || result?.data
					if (apiData && typeof apiData === 'object') {
						operationData = apiData
					} else {
						// Fallback if API doesn't return full data
						operationData = {
							...requestData,
							guid: result?.data?.guid || apiData?.guid || result?.guid,
							data_sozdaniya: now.toISOString(),
							data_obnovleniya: now.toISOString()
						}
					}
				}
				onSuccess(operationData, isUpdate)
			}

			// Обновляем связанные запросы в фоне
			queryClient.invalidateQueries({ queryKey: ['dashboard'] })
			queryClient.invalidateQueries({ queryKey: ['operationsList'] })
			queryClient.invalidateQueries({ queryKey: ['operations'] })
			queryClient.invalidateQueries({ queryKey: ['find_operations'] })
			queryClient.invalidateQueries({ queryKey: ['get_counterparty_by_id'] })
			queryClient.invalidateQueries({ queryKey: ['get_sales_transaction_by_guid'] })
			queryClient.invalidateQueries({ queryKey: ['myAccountsBoard'] })
			queryClient.invalidateQueries({ queryKey: ['legalEntitiesPlanFact'] })
			queryClient.invalidateQueries({ queryKey: ['get_my_accounts'] })


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

	const handleUpdateSplit = (splits) => {
		setSelectedSplits(splits)
		if (splits.some(split => split.value === 'Начисление')) {
			setFormData({ ...formData, confirmAccrual: false })
		}
	}


	if (!isNew && isLoadingOperation) {
		return (
			<div className={styles.loadingOverlay}>
				<div className={styles.loadingSpinner}></div>
				<span>Загрузка операции...</span>
			</div>
		)
	}

	if (!operationData && !isNew) return null

	const isDebit = (!showDate && activeTab === 'income' && !formData.confirmPayment && formData.confirmAccrual && !formData.salesDeal) || (!showDate && activeTab === 'payment' && formData.confirmPayment && !formData.confirmAccrual)

	const isCredit = (!showDate && activeTab === 'income' && formData.confirmPayment && !formData.confirmAccrual && !formData.salesDeal) || (!showDate && activeTab === 'payment' && !formData.confirmPayment && formData.confirmAccrual)

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
			>
				<div className="flex flex-col flex-1 overflow-hidden h-full max-h-dvh min-h-0">
					{/* Header */}
					<div className="w-full pr-4 pt-4 pl-4">
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
									<span>Создана {formatDateRu(operationData?.createdAt) || '—'}</span>
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
					{activeTab !== 'accrual' && <>
						<div className={styles.body}>
							<div className={styles.form}>
								{/* Поступление */}
								{activeTab === 'income' && (
									<IncomeForm
										formData={formData}
										setFormData={setFormData}
										errors={errors}
										setErrors={setErrors}
										isDebit={isDebit}
										isCredit={isCredit}
										showDate={showDate}
										showAgent={showAgent}
										showStatya={showStatya}
										bankAccounts={bankAccounts}
										counterAgentsTree={counterAgentsTree}
										chartOfAccountsTree={chartOfAccountsTree}
										formattedDeals={formattedDeals}
										counterAgents={counterAgents}
										loadingBankAccounts={loadingBankAccounts}
										isLoadingGroups={isLoadingGroups}
										loadingChartOfAccounts={loadingChartOfAccounts}
										rows={rows}
										dispatch={dispatch}
										selectedSplits={selectedSplits}
										handleUpdateSplit={handleUpdateSplit}
										setdivivedAmounts={setdivivedAmounts}
										operationData={operationData}
										preselectedCounterparty={preselectedCounterparty}
										disableCounterpartySelect={disableCounterpartySelect}
										formatAmount={formatAmount}
										parseAmount={parseAmount}
										getAccountCurrency={getAccountCurrency}
										todayDate={todayDate}
										setTempSalesDeal={setTempSalesDeal}
										setIsDateModalOpen={setIsDateModalOpen}

									/>
								)}

								{/* Выплата */}
								{activeTab === 'payment' && (
									<PaymentForm
										formData={formData}
										setFormData={setFormData}
										errors={errors}
										setErrors={setErrors}
										isDebit={isDebit}
										isCredit={isCredit}
										showDate={showDate}
										showAgent={showAgent}
										showStatya={showStatya}
										bankAccounts={bankAccounts}
										counterAgentsTree={counterAgentsTree}
										chartOfAccountsTree={chartOfAccountsTree}
										formattedDeals={formattedDeals}
										counterAgents={counterAgents}
										loadingBankAccounts={loadingBankAccounts}
										isLoadingGroups={isLoadingGroups}
										loadingChartOfAccounts={loadingChartOfAccounts}
										rows={rows}
										dispatch={dispatch}
										selectedSplits={selectedSplits}
										handleUpdateSplit={handleUpdateSplit}
										setdivivedAmounts={setdivivedAmounts}
										operationData={operationData}
										preselectedCounterparty={preselectedCounterparty}
										disableCounterpartySelect={disableCounterpartySelect}
										formatAmount={formatAmount}
										parseAmount={parseAmount}
										getAccountCurrency={getAccountCurrency}
										todayDate={todayDate}
										setTempSalesDeal={setTempSalesDeal}
										setIsDateModalOpen={setIsDateModalOpen}
									/>
								)}

								{/* Перемещение */}
								{activeTab === 'transfer' && (
									<>
										{/* Секция ОТКУДА */}
										<div className={styles.formSection}>
											<div className="flex items-center gap-2">
												<div className="w-full h-px bg-gray-200"></div>
												<h3 className="text-neutral-400 text-xs font-medium">ОТКУДА</h3>
												<div className="w-full h-px bg-gray-200"></div>
											</div>

											{/* Дата оплаты */}
											<div className="flex items-center">
												<label htmlFor="" className="w-40 text-neutral-700 text-sm">
													Дата оплаты
												</label>
												<div className="flex items-center gap-2 flex-1">
													<div className='w-44'>
														<CustomDatePicker
															value={formData.fromDate}
															onChange={value => {
																setFormData({ ...formData, fromDate: value })
																if (errors.fromDate) {
																	setErrors({ ...errors, fromDate: null })
																}
															}}
															format='YYYY-MM-DD'
															placeholder='Выберите дату'
														/>
													</div>
													<OperationCheckbox
														checked={formData.confirmPayment}
														onChange={event => setFormData({ ...formData, confirmPayment: event.target.checked })}
														label="Подтвердить оплату"
													/>
												</div>
											</div>
											{/* Счет и юрлицо */}
											<div className="flex items-center flex-1">
												<label className="w-40 text-neutral-700 text-sm">
													Счет и юрлицо <span className="text-red-500">*</span>
												</label>
												<div className="flex-1">
													<SelectMyAccounts
														multi={false}
														type="show"
														value={formData.fromAccount}
														selected={formData.toAccount}
														onChange={value => {
															setFormData({ ...formData, fromAccount: value })
															if (errors.fromAccount) {
																setErrors({ ...errors, fromAccount: null })
															}
														}}
														placeholder="Юрлица и счета"
														className={"bg-white"}
													/>
													{errors.fromAccount && (
														<span className="text-red-500 text-sm">{errors.fromAccount}</span>
													)}
												</div>
											</div>

											{/* Сумма списания */}
											<div className="flex items-center flex-1">
												<label className="w-40 text-neutral-700 text-sm">
													Сумма списания
												</label>
												<div className="flex-1">
													<div className="flex items-center gap-2">
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
											<div className="flex items-center gap-2">
												<div className="w-full h-px bg-gray-200"></div>
												<h3 className="text-neutral-400 text-xs font-medium">КУДА</h3>
												<div className="w-full h-px bg-gray-200"></div>
											</div>

											{/* Дата */}
											<div className="flex items-center flex-1">
												<label className="w-40 text-neutral-700 text-sm">
													Дата
												</label>
												<div className="w-44">
													<CustomDatePicker
														value={formData.toDate}
														onChange={value => {
															setFormData({ ...formData, toDate: value })
															if (errors.toDate) {
																setErrors({ ...errors, toDate: null })
															}
														}}
														format='YYYY-MM-DD'
														placeholder='Выберите дату'
													/>
													{errors.toDate && <span className="text-red-500 text-sm">{errors.toDate}</span>}
												</div>
											</div>

											{/* Счет и юрлицо */}
											<div className="flex items-center flex-1">
												<label className="w-40 text-neutral-700 text-sm">
													Счет и юрлицо <span className="text-red-500">*</span>
												</label>
												<div className="flex-1">
													<SelectMyAccounts
														multi={false}
														type="show"
														value={formData.toAccount}
														selected={formData.fromAccount}
														onChange={value => {
															setFormData({ ...formData, toAccount: value })
															if (errors.toAccount) {
																setErrors({ ...errors, toAccount: null })
															}
														}}
														placeholder="Юрлица и счета"
														className={"bg-white"}
													/>
													{errors.toAccount && (
														<span className="text-red-500 text-sm">{errors.toAccount}</span>
													)}
												</div>
											</div>

											{/* Сумма зачисления */}
											{!isSameCurrency && (
												<div className="flex items-center flex-1">
													<label className="w-40 text-neutral-700 text-sm">
														Сумма зачисления <span className="text-red-500">*</span>
													</label>
													<div className="flex-1">
														<div className="flex items-center gap-2">
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
															<span className="text-red-500 text-sm">{errors.toAmount}</span>
														)}
													</div>
												</div>
											)}

											{/* Назначение платежа */}
											<div className="flex items-start flex-1">
												<label className="w-40 text-neutral-700 text-sm" style={{ paddingTop: '0.5rem' }}>
													Назначение платежа <span className="text-red-500">*</span>
												</label>
												<div className="flex-1">
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
														className={styles.textarea}
														hasError={!!errors.purpose}
													/>
													{errors.purpose && (
														<span className="text-red-500 text-sm">{errors.purpose}</span>
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
							<button className='secondary-btn' onClick={onClose}>
								Отмена
							</button>
							<button className='primary-btn' onClick={handleSubmit} disabled={isSubmitting}>
								{isSubmitting ? <Loader /> : isNew ? 'Создать' : 'Сохранить'}
							</button>
						</div>
					</>}

					{activeTab === 'accrual' && (
						<AccuralForm
							onCancel={onClose}
							onSuccess={() => {
								onClose();
							}}
						/>
					)}
				</div>
				{isAttachmentsOpen && <div className={cn(styles.messageContent, isAttachmentsOpen && styles.open)}>
					<div className={styles.filesAttachWrap}>
						<div className={styles.filesAttachCollapseWrp}>
							<button className={styles.filesAttachCollapse} onClick={() => setIsAttachmentsOpen(false)}>
								Свернуть
								<span>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</span>
							</button>
						</div>

						<div className={cn(styles.entityAttachments, styles.darkTheme)} style={{ height: '100%' }}>


							{/* sent messages list + input */}
							<SentMessages
								onSend={(payload) => {
									// payload = { file: File | null, message: string }
									// TODO: call your API here, e.g.:
									// api.postOperationComment(operationId, payload)
									console.log('send to backend', payload)
								}}
							/>
						</div>
					</div>
				</div>}
				{!isAttachmentsOpen && (
					<button className={styles.filesAttachExpandTab} onClick={() => setIsAttachmentsOpen(true)}>
						<FilesClipIcon className={styles.expandTabIcon} />
						Файлы и комментарии
					</button>
				)}
			</div>
			<CustomModal
				isOpen={isDateModalOpen}
				onClose={() => {
					setIsDateModalOpen(false)
					setTempSalesDeal(null)
				}}
			>
				<div className='p-4'>
					<h3 className='text-lg font-bold text-neutral-900'>Дата начисления станет равна дате оплаты</h3>
					<p className='text-neutral-600 text-sm py-3'>У оплаты, которую вы собираетесь прикрепить к сделке, дата начисления имеет статус «Подтверждена» или отличается от даты оплаты.</p>
					<p className='text-neutral-600 text-sm pb-6'>После прикреплении такого платежа дата начисления будет равна дате оплаты и получит статус «Не подтверждена».</p>
					<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
						<button className='secondary-btn' onClick={() => {
							setIsDateModalOpen(false)
							setTempSalesDeal(null)
						}}>
							Отменить
						</button>
						<button className='primary-btn' onClick={() => {
							setFormData({ ...formData, salesDeal: tempSalesDeal, accrualDate: formData.paymentDate || formData.accrualDate, confirmAccrual: false })
							setIsDateModalOpen(false)
							setSelectedSplits((prev) => prev.filter(item => item.value !== 'Начисление'))
							setTempSalesDeal(null)
						}}>
							Продолжить
						</button>
					</div>
				</div>
			</CustomModal>
		</>
	)
})


export default OperationModal

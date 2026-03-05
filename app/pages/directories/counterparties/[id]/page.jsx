"use client"

import { useState, useEffect, useMemo, useRef, Fragment } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, PenLine, Archive, Trash2 } from 'lucide-react'
import { useCounterpartyById, useUcodeRequestMutation } from '@/hooks/useDashboard'
import { useLegalEntitiesPlanFact, useChartOfAccountsPlanFact } from '@/hooks/useDashboard'
import { MultiSelect } from '@/components/common/MultiSelect/MultiSelect'
import { OperationModal } from '@/components/operations/OperationModal/OperationModal'
import { OperationMenu } from '@/components/operations/OperationsTable/OperationMenu'
import { DeleteConfirmModal } from '@/components/operations/OperationsTable/DeleteConfirmModal'
import NewDateRangeComponent from '@/components/directories/NewDateRangeComponent'
import { useDeleteOperation } from '@/hooks/useDashboard'
import { cn } from '@/app/lib/utils'
import styles from './counterparty-detail.module.scss'
import PriceStatus from '@/components/operations/PriceStatus'

import Select from '@/components/common/Select'
import EditCounterpartyModal from '@/components/directories/EditCounterpartyModal/EditCounterpartyModal'

const calculationOptions = [
  { value: "Cashflow", label: 'Учет по денежному потоку' },
  { value: "Cash", label: 'Учет кассовым методом' },
  { value: "Calculation", label: 'Учет методом начисления' },
]

export default function KontragentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const counterpartyGuid = params?.id
  const ucodeRequestMutation = useUcodeRequestMutation()

  const [dateRange, setDateRange] = useState(null)
  const [calculationMethod, setCalculationMethod] = useState('Cashflow')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [activePopover, setActivePopover] = useState(null)
  const [isRequisitesModalOpen, setIsRequisitesModalOpen] = useState(false)
  const [isDeletingCounterparty, setIsDeletingCounterparty] = useState(false)

  // Handle click outside for dropdown and popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (!event.target.closest(`.${styles.popoverContainer}`)) {
        setActivePopover(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const [selectedLegalEntities, setSelectedLegalEntities] = useState([])
  const [selectedChartOfAccounts, setSelectedChartOfAccounts] = useState([])
  const [isCreateOperationModalOpen, setIsCreateOperationModalOpen] = useState(false)
  const [isCreateModalClosing, setIsCreateModalClosing] = useState(false)
  const [isCreateModalOpening, setIsCreateModalOpening] = useState(false)
  const [selectedOperations, setSelectedOperations] = useState([])
  const [editingOperation, setEditingOperation] = useState(null)
  const [isEditModalClosing, setIsEditModalClosing] = useState(false)
  const [isEditModalOpening, setIsEditModalOpening] = useState(false)
  const [deletingOperation, setDeletingOperation] = useState(null)
  const [isEditCounterpartyModalOpen, setIsEditCounterpartyModalOpen] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})
  const deleteOperationMutation = useDeleteOperation()
  const queryClient = useQueryClient()

  // Fetch counterparty data by GUID using get_counterparty_by_id
  const { data: counterpartyData, isLoading: isLoadingCounterparty, error: counterpartyError } = useCounterpartyById(counterpartyGuid)

  // Fetch data for filters
  const { data: legalEntitiesData } = useLegalEntitiesPlanFact()
  const { data: chartOfAccountsData } = useChartOfAccountsPlanFact()

  // Transform chart of accounts data for MultiSelect
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


  // Extract counterparty from response
  // Response structure: { data: { data: { data: { counterparty: {...}, operations: [...] } } } }
  const responseData = counterpartyData?.data?.data?.data
  const counterparty = responseData?.counterparty || null
  const counterpartyOperations = useMemo(() => {
    return responseData?.operations || []
  }, [responseData])


  // Use operations from counterparty response directly
  const operations = useMemo(() => {
    if (!counterpartyOperations || counterpartyOperations.length === 0) return []


    return counterpartyOperations.map((item, index) => {
      const operationDate = item.data_operatsii ? new Date(item.data_operatsii) : null

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
          typeLabel = item.tip[0] || 'Выплата'
        }
      }

      // Format date
      const formatDate = (date) => {
        if (!date) return ''
        try {
          const d = new Date(date)
          const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
          return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
        } catch {
          return ''
        }
      }

      // Format amount
      const amount = item.summa || 0
      const amountFormatted = amount.toLocaleString('ru-RU')
      const amountSign = type === 'in' ? '+' : type === 'out' ? '-' : ''

      // Determine section (today vs yesterday/earlier)
      const today = new Date()
      const isToday = operationDate &&
        operationDate.getDate() === today.getDate() &&
        operationDate.getMonth() === today.getMonth() &&
        operationDate.getFullYear() === today.getFullYear()

      return {
        id: item.guid || index,
        guid: item.guid,
        date: formatDate(operationDate),
        account: item.my_accounts_name || item.bank_accounts_id_data?.nazvanie || '',
        type: type,
        typeCategory: type,
        typeLabel: typeLabel,
        counterparty: item.counterparties_name || item.counterparties_id_data?.nazvanie || '',
        category: item.chart_of_accounts_name || item.chart_of_accounts_id_data?.nazvanie || '',
        project: '',
        deal: '',
        amount: `${amountSign}${amountFormatted}`,
        amountRaw: amount,
        rawData: item,
        paymentConfirmed: item.oplata_podtverzhdena,
        payment_confirmed: item.payment_confirmed !== undefined
          ? item.payment_confirmed
          : (item.oplata_podtverzhdena !== undefined ? item.oplata_podtverzhdena : false),
        payment_accrual: item.payment_accrual !== undefined
          ? item.payment_accrual
          : false,
        currency: item.currenies_kod || '',
        section: isToday ? 'today' : 'yesterday',
      }
    })
  }, [counterpartyOperations])

  const filteredOperations = useMemo(() => {
    let result = operations;

    if (selectedLegalEntities && selectedLegalEntities.length > 0) {
      const selectedAccounts = selectedLegalEntities.map(guid => {
        const entity = legalEntitiesData?.data?.data?.data?.find(e => e.guid === guid);
        return entity?.nazvanie;
      }).filter(Boolean);

      if (selectedAccounts.length > 0) {
        result = result.filter(op => selectedAccounts.includes(op.account));
      } else {
        result = result.filter(op =>
          selectedLegalEntities.includes(op.rawData?.bank_accounts_id) ||
          selectedLegalEntities.includes(op.rawData?.my_accounts_id)
        );
      }
    }

    if (selectedChartOfAccounts && selectedChartOfAccounts.length > 0) {
      const selectedCategories = selectedChartOfAccounts.map(guid => {
        const option = chartOfAccountsOptions.find(o => o.value === guid);
        return option?.label;
      }).filter(Boolean);

      if (selectedCategories.length > 0) {
        result = result.filter(op => selectedCategories.includes(op.category));
      } else {
        result = result.filter(op =>
          selectedChartOfAccounts.includes(op.rawData?.chart_of_accounts_id) ||
          selectedChartOfAccounts.includes(op.rawData?.chart_of_accounts_id_data?.guid)
        );
      }
    }

    return result;
  }, [operations, selectedLegalEntities, legalEntitiesData, selectedChartOfAccounts, chartOfAccountsOptions]);

  // Format counterparty info - DECLARE FIRST
  const counterpartyInfo = useMemo(() => {
    if (!counterparty) return null


    return {
      name: counterparty.nazvanie || 'Без названия',
      fullName: counterparty.polnoe_imya || '',
      inn: counterparty.inn && counterparty.inn !== 0 ? counterparty.inn : null,
      kpp: (Array.isArray(counterparty.kpp) ? counterparty.kpp.filter(v => v !== null && v !== '') : (counterparty.kpp && counterparty.kpp !== 0 ? [counterparty.kpp] : [])),
      accountNumber: (Array.isArray(counterparty.nomer_scheta) ? counterparty.nomer_scheta.filter(v => v !== null && v !== '') : (counterparty.nomer_scheta && counterparty.nomer_scheta !== 0 ? [counterparty.nomer_scheta] : [])),
      receiptArticle: counterparty.chart_of_accounts_id_data?.nazvanie || (counterparty.chart_of_accounts_id ? 'Загрузка...' : null),
      paymentArticle: counterparty.chart_of_accounts_id_2_data?.nazvanie || (counterparty.chart_of_accounts_id_2 ? 'Загрузка...' : null),
      comment: counterparty.komentariy || null,
      type: counterparty.tip || 'Не указан',
      // Financial metrics from API
      income: counterparty.income || 0,
      expense: counterparty.expense || 0,
      difference: counterparty.difference || 0,
      receivables: counterparty.receivables || counterparty.debitorka || 0,
      payables: counterparty.payables || counterparty.kreditorka || 0,
      operationsCount: counterparty.operations_count || 0
    }
  }, [counterparty])

  // Calculate stats from operations
  const stats = useMemo(() => {
    console.log('=== Calculating stats from operations ===')
    let receipts = 0
    let payments = 0
    let receiptsCount = 0
    let paymentsCount = 0

    filteredOperations.forEach(op => {
      const amount = op.amountRaw || 0
      if (op.type === 'in') {
        receipts += amount
        receiptsCount++
      } else if (op.type === 'out') {
        payments += amount
        paymentsCount++
      }
    })

    const difference = receipts - payments

    return {
      receipts,
      payments,
      difference,
      receiptsCount,
      paymentsCount,
      totalCount: filteredOperations.length
    }
  }, [filteredOperations])

  const renderMultiValue = (values, type) => {
    if (!values || values.length === 0) return '–';
    if (values.length === 1) return values[0];

    return (
      <div className={styles.popoverContainer}>
        <span>{values[0]}</span>
        <button
          className={styles.popoverToggle}
          onClick={(e) => {
            e.stopPropagation();
            setActivePopover(activePopover === type ? null : type);
          }}
        >
          +{values.length - 1}
        </button>
        {activePopover === type && (
          <div className={styles.popoverMenu}>
            <div className={styles.popoverHeader}>
              <span>{type === 'kpp' ? 'Дополнительные КПП' : 'Номера счетов'}</span>
              <button className={styles.closeBtn} onClick={() => setActivePopover(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.popoverList}>
              {values.slice(1).map((val, idx) => (
                <div key={idx} className={styles.popoverItem}>{val}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const toggleOperation = (id) => {
    if (selectedOperations.includes(id)) {
      setSelectedOperations(selectedOperations.filter(opId => opId !== id))
    } else {
      setSelectedOperations([...selectedOperations, id])
    }
  }

  const handleEditOperation = (operation) => {
    setEditingOperation(operation)
    setIsEditModalClosing(false)
    setIsEditModalOpening(true)
    setTimeout(() => {
      setIsEditModalOpening(false)
    }, 50)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalClosing(true)
    setTimeout(() => {
      setIsCreateOperationModalOpen(false)
      setIsCreateModalClosing(false)
      setIsCreateModalOpening(false)
    }, 300)
  }

  const handleCloseEditModal = () => {
    setIsEditModalClosing(true)
    setTimeout(() => {
      setEditingOperation(null)
      setIsEditModalClosing(false)
      setIsEditModalOpening(false)
    }, 300)
  }

  const handleDeleteOperation = (operation) => {
    setDeletingOperation(operation)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingOperation) return

    try {
      const guid = deletingOperation.rawData?.guid || deletingOperation.guid
      if (!guid) {
        throw new Error('GUID операции не найден')
      }

      await deleteOperationMutation.mutateAsync([guid])
      queryClient.invalidateQueries({ queryKey: ['counterpartyById', counterpartyGuid] })
      setDeletingOperation(null)
    } catch (error) {
      console.error('Error deleting operation:', error)
    }
  }

  const handleDeleteCounterparty = async () => {
    setIsDropdownOpen(false)
    try {
      setIsDeletingCounterparty(true)
      await ucodeRequestMutation.mutateAsync({
        method: 'delete_counterparty',
        data: { guid: counterpartyGuid }
      })
      router.push('/pages/directories/counterparties')
    } catch (error) {
      console.error('Error deleting counterparty:', error)
      setIsDeletingCounterparty(false)
    }
  }

  // Toggle row expansion
  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }))
  }

  // Mock detail data - replace with real data later
  const getDetailData = (rowId) => {
    return [
      { id: 1, date: '05 мар \'26', account: 'Основной счет', type: 'in', typeLabel: 'Поступление', counterparty: 'test', category: 'Оказание услуг', amount: '+15 000 000', amountRaw: 15000000 },
      { id: 2, date: '31 мар \'26', account: 'Основной счет', type: 'in', typeLabel: 'Поступление', counterparty: 'test', category: 'Оказание услуг', amount: '+4 500 000', amountRaw: 4500000 },
    ]
  }

  // Close modals when clicking on page header
  useEffect(() => {
    const handleHeaderClick = (e) => {
      const header = document.querySelector('header')
      if (header && header.contains(e.target)) {
        if (isCreateOperationModalOpen) {
          handleCloseCreateModal()
        }
        if (editingOperation) {
          handleCloseEditModal()
        }
      }
    }

    document.addEventListener('click', handleHeaderClick)
    return () => document.removeEventListener('click', handleHeaderClick)
  }, [isCreateOperationModalOpen, editingOperation])

  if (isLoadingCounterparty) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Breadcrumbs Skeleton */}
          <div className={styles.breadcrumbs}>
            <div className={styles.breadcrumbsContent}>
              <div className={styles.skeleton} style={{ width: '150px', height: '14px' }}></div>
              <span className={styles.breadcrumbSeparator}>›</span>
              <div className={styles.skeleton} style={{ width: '100px', height: '14px' }}></div>
            </div>
          </div>

          {/* Header Skeleton */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.skeleton} style={{ width: '200px', height: '28px' }}></div>
              <div className={styles.skeleton} style={{ width: '180px', height: '36px' }}></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className={styles.statsGrid}>
              {/* Financial Card Skeleton */}
              <div className={styles.financialCard}>
                <div className={styles.financialCardContent}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={styles.financialItem}>
                      <div className={styles.financialItemHeader}>
                        <div className={styles.skeleton} style={{ width: '6px', height: '6px', borderRadius: '50%' }}></div>
                        <div className={styles.skeleton} style={{ width: '80px', height: '12px' }}></div>
                      </div>
                      <div className={styles.skeleton} style={{ width: '120px', height: '24px' }}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Debit/Credit Column Skeleton */}
              <div className={styles.debitCreditColumn}>
                {[1, 2].map((i) => (
                  <div key={i} className={styles.debitCreditCard}>
                    <div className={styles.skeleton} style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
                    <div className={styles.skeleton} style={{ width: '100px', height: '12px' }}></div>
                  </div>
                ))}
              </div>

              {/* Info Card Skeleton */}
              <div className={styles.infoCard}>
                <div className={styles.skeleton} style={{ width: '150px', height: '18px', marginBottom: '12px' }}></div>
                <div className={styles.infoCardDivider}></div>
                <div className={styles.infoCardDetails}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.infoCardRow}>
                      <div className={styles.skeleton} style={{ width: '100px', height: '12px', marginBottom: '4px' }}></div>
                      <div className={styles.skeleton} style={{ width: '140px', height: '12px' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Operations Section Skeleton */}
          <div className={styles.operationsSection}>
            <div className={styles.operationsContent}>
              <div className={styles.operationsHeader}>
                <div className={styles.skeleton} style={{ width: '180px', height: '18px' }}></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className={styles.skeleton} style={{ width: '80px', height: '32px' }}></div>
                  <div className={styles.skeleton} style={{ width: '80px', height: '32px' }}></div>
                </div>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                Загрузка данных контрагента...
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!counterparty) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Контрагент не найден</div>
        </div>
      </div>
    )
  }

  const hasInfo = counterpartyInfo?.inn === null && counterpartyInfo?.kpp?.length === 0 && counterpartyInfo?.accountNumber?.length === 0 && counterpartyInfo?.receiptArticle === null && counterpartyInfo?.paymentArticle === null && counterpartyInfo?.comment === null



  return (
    <div className={styles.container}>
      {isDeletingCounterparty && (
        <div className={styles.deleteOverlay}>
          <div className={styles.deleteSpinner}></div>
          <span className={styles.deleteSpinnerText}>Удаление...</span>
        </div>
      )}
      <div className={styles.content}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <div className={styles.breadcrumbsContent}>
            <Link href="/pages/directories/counterparties" className={styles.breadcrumbLink}>
              Список контрагентов
            </Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{counterpartyInfo?.name || 'Контрагент'}</span>
          </div>
        </div>

        {/* Header with kontragent info */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>{counterpartyInfo?.name || 'Контрагент'}</h1>


            <div className={styles.headerFilters}>
              <NewDateRangeComponent
                value={dateRange}
                onChange={(range) => {
                  setDateRange(range)
                }}
              />
              <div style={{ width: '250px' }}>
                <Select
                  instanceId="counterparty-detail-calculation-method"
                  options={calculationOptions}
                  value={calculationOptions.find(opt => opt.value === calculationMethod) || null}
                  onChange={(selected) => setCalculationMethod(selected ? selected.value : 'Cashflow')}
                  placeholder="Выбирать"
                  isSearchable={false}
                  isClearable={false}
                />
              </div>
            </div>
            {/* dots button */}
            <div className={styles.headerActions} ref={dropdownRef}>
              <button
                className={cn(styles.dotsButton, isDropdownOpen && styles.dotsButtonActive)}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <MoreHorizontal size={20} />
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <button className={styles.dropdownItem} onClick={() => {
                    setIsDropdownOpen(false)
                    setIsEditCounterpartyModalOpen(true)
                  }}>
                    <PenLine size={18} className={styles.dropdownIcon} />
                    Редактировать
                  </button>
                  {/* <button className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                    <Archive size={18} className={styles.dropdownIcon} />
                    Убрать в архив
                  </button> */}
                  <div className={styles.dropdownDivider} />
                  <button className={cn(styles.dropdownItem, styles.dropdownItemDelete)} onClick={handleDeleteCounterparty}>
                    <Trash2 size={18} className={styles.dropdownIcon} />
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {/* Left Card - Financial Stats */}
            <div className={styles.financialCard}>
              <div className={styles.financialCardContent}>
                <div className={styles.financialItem}>
                  <div className={styles.financialItemHeader}>
                    <div className={cn(styles.financialItemDot)} style={{ backgroundColor: '#5dade2' }}></div>
                    <span className={styles.financialItemLabel}>Поступления</span>
                  </div>
                  <div className={styles.financialItemValue}>
                    {stats.receipts >= 0 ? '+' : ''}{stats.receipts.toLocaleString('ru-RU')}
                  </div>
                </div>

                <div className={styles.financialItem}>
                  <div className={styles.financialItemHeader}>
                    <div className={cn(styles.financialItemDot)} style={{ backgroundColor: '#f39c6b' }}></div>
                    <span className={styles.financialItemLabel}>Выплаты</span>
                  </div>
                  <div className={styles.financialItemValue}>
                    {stats.payments >= 0 ? '-' : ''}{Math.abs(stats.payments).toLocaleString('ru-RU')}
                  </div>
                </div>

                <div className={styles.financialItem}>
                  <div className={styles.financialItemHeader}>
                    <div className={cn(styles.financialItemDot)} style={{ backgroundColor: stats.difference >= 0 ? '#52c41a' : '#ff4d4f' }}></div>
                    <span className={styles.financialItemLabel}>Разница</span>
                  </div>
                  <div className={styles.financialItemValue}>
                    {stats.difference >= 0 ? '+' : ''}{stats.difference.toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Debit and Credit stacked */}
            <div className={styles.debitCreditColumn}>
              {/* Debit Card */}
              <div className={styles.debitCreditCard}>
                <div className={styles.debitCreditTitle}>Дебиторка</div>
                <div className={styles.debitCreditValue}>
                  {counterpartyInfo?.receivables ? counterpartyInfo.receivables.toLocaleString('ru-RU') : 'Нет задолженности'}
                </div>
              </div>

              {/* Credit Card */}
              <div className={styles.debitCreditCard}>
                <div className={styles.debitCreditTitle}>Кредиторка</div>
                <div className={styles.debitCreditValue}>
                  {counterpartyInfo?.payables ? counterpartyInfo.payables.toLocaleString('ru-RU') : 'Нет задолженности'}
                </div>
              </div>
            </div>

            {/* Right Card - Additional Info in two-column format */}
            <div className={styles.infoCard}>
              <div className={styles.headerTitle}>
                <h1 className={styles.infoCardTitle}>{counterpartyInfo?.name || 'Контрагент'}</h1>
                <PenLine size={12} className={styles.dropdownIcon} onClick={() => setIsEditCounterpartyModalOpen(true)} />
              </div>
              <div className={styles.infoCardDivider}></div>
              {hasInfo ? (
                <div className={styles.infoCardEmpty}>
                  <span className={styles.infoCardEmptyText}>Реквизиты контрагента отсутствуют</span>
                  <button className={styles.infoCardEmptyButton} onClick={() => setIsEditCounterpartyModalOpen(true)}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="8" stroke="#6b7280" strokeWidth="1.2" />
                      <path d="M9 5.5V12.5M5.5 9H12.5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    Добавить
                  </button>
                </div>
              ) : (
                <>
                    <div className={styles.infoCardDetails}>
                      <div className={styles.infoCardRow}>
                        <span className={styles.infoCardLabel}>ИНН</span>
                        <span className={styles.infoCardValue}>{counterpartyInfo?.inn || '–'}</span>
                      </div>
                      <div className={styles.infoCardRow}>
                        <span className={styles.infoCardLabel}>Статья для поступлений</span>
                        <span className={styles.infoCardValue}>{counterpartyInfo?.receiptArticle || '–'}</span>
                      </div>
                      <div className={styles.infoCardRow}>
                        <span className={styles.infoCardLabel}>КПП</span>
                        <span className={styles.infoCardValue}>{renderMultiValue(counterpartyInfo?.kpp, 'kpp')}</span>
                      </div>
                      <div className={styles.infoCardRow}>
                        <span className={styles.infoCardLabel}>Статья для выплат</span>
                        <span className={styles.infoCardValue}>{counterpartyInfo?.paymentArticle || '–'}</span>
                      </div>
                      <div className={styles.infoCardRow}>
                        <span className={styles.infoCardLabel}>№ счета</span>
                        <span className={styles.infoCardValue}>{renderMultiValue(counterpartyInfo?.accountNumber, 'accountNumber')}</span>
                      </div>
                      <div className={styles.infoCardRow}>
                        <span className={styles.infoCardLabel}>Комментарий</span>
                        <span className={styles.infoCardValue}>{counterpartyInfo?.comment || '–'}</span>
                      </div>
                    </div>
                  {/* <span className={styles.extraDetailsLink} onClick={() => setIsRequisitesModalOpen(true)}>Доп. реквизиты</span> */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Operations Section */}
        <div className={styles.operationsSection}>
          <div className={styles.operationsContent}>
            <div className={cn(styles.operationsHeader, isFiltersOpen && styles.filtersOpen)}>
              <div className={styles.operationsHeaderLeft}>
                <h2 className={styles.operationsTitle}>Операции по контрагенту</h2>
                <button
                  className={styles.createButton}
                  onClick={() => {
                    setIsCreateOperationModalOpen(true)
                    setIsCreateModalClosing(false)
                    setIsCreateModalOpening(true)
                    setTimeout(() => {
                      setIsCreateModalOpening(false)
                    }, 50)
                  }}
                >
                  Создать
                </button>
                <button
                  className={styles.filtersButton}
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  Фильтры
                  <svg
                    className={cn(styles.filtersIcon, isFiltersOpen && styles.filtersIconOpen)}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {isFiltersOpen && (
              <div className={styles.filtersPanel}>
                <div className={styles.filtersPanelContent}>
                  <div className={styles.filterGroup}>
                    <MultiSelect
                      data={legalEntitiesData?.data?.data?.data?.map(entity => ({
                        value: entity.guid,
                        label: entity.nazvanie
                      })) || []}
                      value={selectedLegalEntities}
                      onChange={setSelectedLegalEntities}
                      hideSelectAll={true}
                      placeholder="Юрлица и счета"
                      valueKey="value"
                    />
                  </div>
                  <div className={styles.filterGroup}>
                    <MultiSelect
                      data={chartOfAccountsOptions || []}
                      value={selectedChartOfAccounts}
                      onChange={setSelectedChartOfAccounts}
                      hideSelectAll={true}
                      grouped
                      placeholder="Статьи"
                      valueKey="value"
                    />
                  </div>
                </div>
              </div>
            )}

            {isLoadingCounterparty ? (
              <div className={styles.tableWrapper}>
                <table className={styles.operationsTable}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellIndex)}>№</th>
                      <th className={styles.tableHeaderCell}>Дата</th>
                      <th className={styles.tableHeaderCell}>Счет</th>
                      <th className={styles.tableHeaderCell}>Тип</th>
                      <th className={styles.tableHeaderCell}>Контрагент</th>
                      <th className={styles.tableHeaderCell}>Статья</th>
                      <th className={styles.tableHeaderCell}>Проект</th>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellRight)}>Сумма</th>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellActions)}></th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className={styles.tableRow}>
                        <td className={cn(styles.tableCell, styles.tableCellIndex)}>
                          <div className={styles.skeleton} style={{ width: '20px', height: '12px', margin: '0 auto' }}></div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.skeleton} style={{ width: '80px', height: '12px' }}></div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.skeleton} style={{ width: '100px', height: '12px' }}></div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.skeleton} style={{ width: '24px', height: '24px' }}></div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.skeleton} style={{ width: '120px', height: '12px' }}></div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.skeleton} style={{ width: '100px', height: '12px' }}></div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.skeleton} style={{ width: '60px', height: '12px' }}></div>
                        </td>
                        <td className={cn(styles.tableCell, styles.amountCell)}>
                          <div className={styles.skeleton} style={{ width: '80px', height: '12px', marginLeft: 'auto' }}></div>
                        </td>
                        <td className={cn(styles.tableCell, styles.tableCellActions)}>
                          <div className={styles.skeleton} style={{ width: '20px', height: '20px', margin: '0 auto' }}></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : operations.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="8" y1="8" x2="16" y2="16" strokeWidth="2"></line>
                  </svg>
                </div>
                <div className={styles.emptyStateText}>
                  <div className={styles.emptyStateTitle}>Создайте операции с контрагентом</div>
                  <div className={styles.emptyStateSubtitle}>
                    Добавляйте платежи и учитывайте предоплаты или отсрочки.
                  </div>
                  <a href="#" className={styles.emptyStateLink} onClick={(e) => { e.preventDefault(); setIsCreateOperationModalOpen(true) }}>
                    Как это работает — читайте в статье.
                  </a>
                </div>
              </div>
              ) : filteredOperations.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateText}>
                    <div className={styles.emptyStateTitle}>По заданным фильтрам ничего не найдено</div>
                  </div>
                </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.operationsTable}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellIndex)}>№</th>
                      <th className={styles.tableHeaderCell}>Дата</th>
                      <th className={styles.tableHeaderCell}>Счет</th>
                      <th className={styles.tableHeaderCell}>Тип</th>
                      <th className={styles.tableHeaderCell}>Контрагент</th>
                      <th className={styles.tableHeaderCell}>Статья</th>
                      <th className={styles.tableHeaderCell}>Проект</th>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellRight)}>Сумма</th>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellActions)}></th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                          {/* Today — Section Header */}
                          {filteredOperations.filter(op => op.section === 'today').length > 0 && (
                            <tr className={styles.sectionHeader}>
                              <td colSpan='9' className={styles.sectionHeaderCell}>
                                <h3 className={styles.sectionHeaderTitle}>Сегодня</h3>
                              </td>
                            </tr>
                          )}
                          {filteredOperations.filter(op => op.section === 'today').map((op, index) => {
                            const isExpanded = expandedRows[op.id]
                            const detailData = isExpanded ? getDetailData(op.id) : []
                            
                            return (
                              <Fragment key={op.id}>
                                <tr
                                  className={styles.tableRow}
                                  onClick={() => handleEditOperation(op)}
                                >
                                  <td className={cn(styles.tableCell, styles.tableCellIndex)}>{index + 1}</td>
                                  <td className={styles.tableCell}>
                                    <div className={styles.dateCell}>
                                      <button
                                        className={styles.expandButton}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleRowExpansion(op.id)
                                        }}
                                      >
                                        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <rect x="1.42383" y="0.5" width="13" height="13" rx="2.5" stroke="#999999"></rect>
                                          <path d="M10.9223 6.87934H4.92535" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"></path>
                                          {!isExpanded && (
                                            <path d="M7.92383 3.88086V9.87782" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"></path>
                                          )}
                                        </svg>
                                      </button>
                                      <span>{op.date}</span>
                                    </div>
                                  </td>
                                  <td className={styles.tableCell}>{op.account}</td>
                                  <td className={styles.tableCell}>
                                    <span className={styles.typeBadge}>
                                      {op.typeLabel === 'Поступление' ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#065986" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      ) : op.typeLabel === 'Выплата' ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M3.33325 10H16.6666M16.6666 10L11.6666 5M16.6666 10L11.6666 15" stroke="#F04438" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M16.6666 14.1667H3.33325M3.33325 14.1667L6.66659 10.8333M3.33325 14.1667L6.66658 17.5M3.33325 5.83333H16.6666M16.6666 5.83333L13.3333 2.5M16.6666 5.83333L13.3333 9.16667" stroke="#1D2939" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      )}
                                    </span>
                                  </td>
                                  <td className={styles.tableCell}>{op.counterparty}</td>
                                  <td className={styles.tableCell}>{op.category}</td>
                                  <td className={styles.tableCell}>{op.project}</td>
                                  <td className={cn(styles.tableCell, styles.amountCell,
                                    op.typeCategory === 'in' && styles.positive,
                                    op.typeCategory === 'out' && styles.negative,
                                    op.typeCategory === 'transfer' && styles.neutral
                                  )}>
                                    <PriceStatus amount={op.amount} tab={op.typeLabel} type={op.typeCategory} confirmed={op.payment_confirmed} accrual={op.payment_accrual} currency={op.currency} />
                                  </td>
                                  <td className={cn(styles.tableCell, styles.tableCellActions)} onClick={e => e.stopPropagation()}>
                                    <OperationMenu operation={op} onEdit={handleEditOperation} onDelete={handleDeleteOperation} />
                                  </td>
                                </tr>
                                
                                {/* Detail rows */}
                                {isExpanded && detailData.map((detail) => (
                                  <tr key={`${op.id}-detail-${detail.id}`} className={styles.detailRow}>
                                    <td className={cn(styles.tableCell, styles.tableCellIndex)}></td>
                                    <td className={styles.tableCell}>
                                      <div className={styles.detailDateCell}>
                                        {detail.date}
                                      </div>
                                    </td>
                                    <td className={styles.tableCell}>{detail.account}</td>
                                    <td className={styles.tableCell}>
                                      <span className={styles.typeBadge}>
                                        {detail.typeLabel === 'Поступление' ? (
                                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#065986" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        ) : (
                                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.33325 10H16.6666M16.6666 10L11.6666 5M16.6666 10L11.6666 15" stroke="#F04438" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </span>
                                    </td>
                                    <td className={styles.tableCell}>{detail.counterparty}</td>
                                    <td className={styles.tableCell}>{detail.category}</td>
                                    <td className={styles.tableCell}></td>
                                    <td className={cn(styles.tableCell, styles.amountCell, detail.type === 'in' ? styles.positive : styles.negative)}>
                                      <span className={styles.detailAmount}>{detail.amount}</span>
                                    </td>
                                    <td className={cn(styles.tableCell, styles.tableCellActions)}></td>
                                  </tr>
                                ))}
                              </Fragment>
                            )
                          })}

                          {/* Вчера и ранее — Section Header */}
                          {filteredOperations.filter(op => op.section === 'yesterday').length > 0 && (
                            <tr className={styles.sectionHeader}>
                              <td colSpan='9' className={styles.sectionHeaderCell}>
                                <h3 className={styles.sectionHeaderTitle}>Вчера и ранее</h3>
                        </td>
                            </tr>
                          )}
                          {filteredOperations.filter(op => op.section === 'yesterday').map((op, index) => {
                            const isExpanded = expandedRows[op.id]
                            const detailData = isExpanded ? getDetailData(op.id) : []
                            
                            return (
                              <Fragment key={op.id}>
                                <tr
                                  className={styles.tableRow}
                                  onClick={() => handleEditOperation(op)}
                                >
                                  <td className={cn(styles.tableCell, styles.tableCellIndex)}>{index + 1}</td>
                                  <td className={styles.tableCell}>
                                    <div className={styles.dateCell}>
                                      <button
                                        className={styles.expandButton}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleRowExpansion(op.id)
                                        }}
                                      >
                                        <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <rect x="1.42383" y="0.5" width="13" height="13" rx="2.5" stroke="#999999"></rect>
                                          <path d="M10.9223 6.87934H4.92535" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"></path>
                                          {!isExpanded && (
                                            <path d="M7.92383 3.88086V9.87782" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"></path>
                                          )}
                                        </svg>
                                      </button>
                                      <span>{op.date}</span>
                                    </div>
                                  </td>
                                  <td className={styles.tableCell}>{op.account}</td>
                                  <td className={styles.tableCell}>
                                    <span className={styles.typeBadge}>
                                      {op.typeLabel === 'Поступление' ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#065986" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      ) : op.typeLabel === 'Выплата' ? (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M3.33325 10H16.6666M16.6666 10L11.6666 5M16.6666 10L11.6666 15" stroke="#F04438" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      ) : (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M16.6666 14.1667H3.33325M3.33325 14.1667L6.66659 10.8333M3.33325 14.1667L6.66658 17.5M3.33325 5.83333H16.6666M16.6666 5.83333L13.3333 2.5M16.6666 5.83333L13.3333 9.16667" stroke="#1D2939" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      )}
                                    </span>
                                  </td>
                                  <td className={styles.tableCell}>{op.counterparty}</td>
                                  <td className={styles.tableCell}>{op.category}</td>
                                  <td className={styles.tableCell}>{op.project}</td>
                                  <td className={cn(styles.tableCell, styles.amountCell,
                                    op.typeCategory === 'in' && styles.positive,
                                    op.typeCategory === 'out' && styles.negative,
                                    op.typeCategory === 'transfer' && styles.neutral
                                  )}>
                                    <PriceStatus amount={op.amount} tab={op.typeLabel} type={op.typeCategory} confirmed={op.payment_confirmed} accrual={op.payment_accrual} currency={op.currency} />
                                  </td>
                                  <td className={cn(styles.tableCell, styles.tableCellActions)} onClick={e => e.stopPropagation()}>
                                    <OperationMenu operation={op} onEdit={handleEditOperation} onDelete={handleDeleteOperation} />
                                  </td>
                                </tr>
                                
                                {/* Detail rows */}
                                {isExpanded && detailData.map((detail) => (
                                  <tr key={`${op.id}-detail-${detail.id}`} className={styles.detailRow}>
                                    <td className={cn(styles.tableCell, styles.tableCellIndex)}></td>
                                    <td className={styles.tableCell}>
                                      <div className={styles.detailDateCell}>
                                        {detail.date}
                                      </div>
                                    </td>
                                    <td className={styles.tableCell}>{detail.account}</td>
                                    <td className={styles.tableCell}>
                                      <span className={styles.typeBadge}>
                                        {detail.typeLabel === 'Поступление' ? (
                                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#065986" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        ) : (
                                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.33325 10H16.6666M16.6666 10L11.6666 5M16.6666 10L11.6666 15" stroke="#F04438" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </span>
                                    </td>
                                    <td className={styles.tableCell}>{detail.counterparty}</td>
                                    <td className={styles.tableCell}>{detail.category}</td>
                                    <td className={styles.tableCell}></td>
                                    <td className={cn(styles.tableCell, styles.amountCell, detail.type === 'in' ? styles.positive : styles.negative)}>
                                      <span className={styles.detailAmount}>{detail.amount}</span>
                                    </td>
                                    <td className={cn(styles.tableCell, styles.tableCellActions)}></td>
                                  </tr>
                                ))}
                              </Fragment>
                            )
                          })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerStats}>
              <span className={styles.footerText}>
                <span className={styles.footerTextBold}>{stats.totalCount}</span> {stats.totalCount === 1 ? 'операция' : stats.totalCount < 5 ? 'операции' : 'операций'}
              </span>
              {stats.receiptsCount > 0 && (
                <span className={styles.footerText}>
                  {stats.receiptsCount} {stats.receiptsCount === 1 ? 'поступление' : stats.receiptsCount < 5 ? 'поступления' : 'поступлений'}: <span className={styles.footerTextBold}>{stats.receipts.toLocaleString('ru-RU')}</span>
                </span>
              )}
              {stats.paymentsCount > 0 && (
                <span className={styles.footerText}>
                  {stats.paymentsCount} {stats.paymentsCount === 1 ? 'выплата' : stats.paymentsCount < 5 ? 'выплаты' : 'выплат'}: <span className={styles.footerTextBold}>{stats.payments.toLocaleString('ru-RU')}</span>
                </span>
              )}
              <span className={styles.footerText}>
                Итого: <span className={cn(styles.footerTextBold, stats.difference >= 0 ? styles.footerTextGreen : styles.footerTextRed)}>
                  {stats.difference >= 0 ? '+' : ''}{stats.difference.toLocaleString('ru-RU')}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Operation Modal */}
      {isCreateOperationModalOpen && (
        <OperationModal
          operation={{ isNew: true }}
          modalType="income"
          isClosing={isCreateModalClosing}
          isOpening={isCreateModalOpening}
          onClose={handleCloseCreateModal}
          preselectedCounterparty={counterpartyGuid}
          disableCounterpartySelect={true}
        />
      )}

      {/* Edit Operation Modal */}
      {editingOperation && (
        <OperationModal
          operation={editingOperation}
          modalType={editingOperation.typeCategory === 'in' ? 'income' : editingOperation.typeCategory === 'out' ? 'payment' : 'transfer'}
          isClosing={isEditModalClosing}
          isOpening={isEditModalOpening}
          onClose={handleCloseEditModal}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['counterpartyById', counterpartyGuid] })}
          preselectedCounterparty={counterpartyGuid}
          disableCounterpartySelect={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingOperation && (
        <DeleteConfirmModal
          isOpen={!!deletingOperation}
          operation={deletingOperation}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingOperation(null)}
          isDeleting={deleteOperationMutation.isPending}
        />
      )}

      {/* Requisites Modal */}
      {isRequisitesModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsRequisitesModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Реквизиты «{counterpartyInfo?.name}»</h3>
              <button className={styles.closeBtn} onClick={() => setIsRequisitesModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>Название</div>
                <div className={styles.modalValue}>{counterpartyInfo?.fullName || ''}</div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>ИНН</div>
                <div className={styles.modalValue}>{counterpartyInfo?.inn || ''}</div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalDoubleCol}>
                  <div>
                    <div className={styles.modalLabel}>КПП</div>
                    <div className={styles.modalValue}>
                      {counterpartyInfo?.kpp?.length > 0 ? counterpartyInfo.kpp[0] : ''}
                    </div>
                  </div>
                  <div>
                    <div className={styles.modalLabel}>Дополнительные КПП</div>
                    <div className={styles.modalValueList}>
                      {counterpartyInfo?.kpp?.length > 1 ? counterpartyInfo.kpp.slice(1).map((val, i) => (
                        <div key={i} className={styles.modalValueItem}>{val}</div>
                      )) : ''}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.modalRow}>
                <div className={styles.modalDoubleCol}>
                  <div>
                    <div className={styles.modalLabel}>Номер счета</div>
                    <div className={styles.modalValue}>
                      {counterpartyInfo?.accountNumber?.length > 0 ? counterpartyInfo.accountNumber[0] : ''}
                    </div>
                  </div>
                  <div >
                    <div className={styles.modalLabel}>Дополнительные номера счетов</div>
                    <div className={styles.modalValueList}>
                      {counterpartyInfo?.accountNumber?.length > 1 ? counterpartyInfo.accountNumber.slice(1).map((val, i) => (
                        <div key={i} className={styles.modalValueItem}>{val}</div>
                      )) : '–'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.closeActionBtn} onClick={() => setIsRequisitesModalOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Counterparty Modal */}
      <EditCounterpartyModal
        isOpen={isEditCounterpartyModalOpen}
        onClose={() => setIsEditCounterpartyModalOpen(false)}
        onSuccess={() => {
          setIsEditCounterpartyModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ['counterpartyById', counterpartyGuid] })
        }}
        counterparty={counterparty}
      />
    </div>
  )
}

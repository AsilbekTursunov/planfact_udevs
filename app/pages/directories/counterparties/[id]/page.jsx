"use client"

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useCounterpartiesPlanFact, useOperationsList } from '@/hooks/useDashboard'
import { OperationModal } from '@/components/operations/OperationModal/OperationModal'
import { OperationMenu } from '@/components/operations/OperationsTable/OperationMenu'
import { DeleteConfirmModal } from '@/components/operations/OperationsTable/DeleteConfirmModal'
import { DateRangePicker } from '@/components/directories/DateRangePicker/DateRangePicker'
import { useDeleteOperation } from '@/hooks/useDashboard'
import { cn } from '@/app/lib/utils'
import styles from './counterparty-detail.module.scss'

export default function KontragentDetailPage() {
  const params = useParams()
  const counterpartyGuid = params?.id
  
  const [dateRange, setDateRange] = useState(null)
  const [isCreateOperationModalOpen, setIsCreateOperationModalOpen] = useState(false)
  const [isCreateModalClosing, setIsCreateModalClosing] = useState(false)
  const [isCreateModalOpening, setIsCreateModalOpening] = useState(false)
  const [selectedOperations, setSelectedOperations] = useState([])
  const [editingOperation, setEditingOperation] = useState(null)
  const [isEditModalClosing, setIsEditModalClosing] = useState(false)
  const [isEditModalOpening, setIsEditModalOpening] = useState(false)
  const [deletingOperation, setDeletingOperation] = useState(null)
  const deleteOperationMutation = useDeleteOperation()

  // Fetch counterparty data by GUID
  const { data: counterpartyData, isLoading: isLoadingCounterparty } = useCounterpartiesPlanFact({
    page: 1,
    limit: 1000
  })
  
  // Find the specific counterparty by GUID from the list
  const allCounterparties = counterpartyData?.data?.data?.data || []
  const counterparty = allCounterparties.find(cp => cp.guid === counterpartyGuid) || null

  // Fetch operations for this counterparty
  // Note: New API doesn't support counterparty filtering, so we fetch all and filter on frontend
  const { data: operationsData, isLoading: isLoadingOperations } = useOperationsList({
    date_range: {
      start_date: '2026-01-01',
      end_date: '2026-12-31'
    },
    page: 1,
    limit: 1000
  })

  // Filter operations by counterparty GUID on frontend
  const allOperationsItems = operationsData?.data?.data?.data || []
  const operationsItems = counterpartyGuid 
    ? allOperationsItems.filter(op => op.counterparties_id === counterpartyGuid)
    : allOperationsItems

  // Transform operations data for display
  const operations = useMemo(() => {
    if (!operationsItems || operationsItems.length === 0) return []
    
    return operationsItems.map((item, index) => {
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
        rawData: item
      }
    })
  }, [operationsItems])

  // Calculate stats from operations
  const stats = useMemo(() => {
    let receipts = 0
    let payments = 0
    let receiptsCount = 0
    let paymentsCount = 0

    operations.forEach(op => {
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
      totalCount: operations.length
    }
  }, [operations])

  // Format date range (if needed)
  const dateRangeDisplay = useMemo(() => {
    if (operations.length === 0) return 'Нет операций'
    const dates = operationsItems.map(op => new Date(op.data_operatsii || op.data_oplaty)).filter(Boolean).sort((a, b) => a - b)
    if (dates.length === 0) return 'Нет операций'
    const first = dates[0]
    const last = dates[dates.length - 1]
    return `${first.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })} – ${last.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}`
  }, [operations, operationsItems])

  // Format counterparty info
  const counterpartyInfo = useMemo(() => {
    if (!counterparty) return null
    
    return {
      name: counterparty.nazvanie || 'Без названия',
      fullName: counterparty.polnoe_imya || 'Полное название не указано',
      inn: counterparty.inn || null,
      kpp: counterparty.kpp || null,
      accountNumber: counterparty.nomer_scheta || null,
      receiptArticle: counterparty.chart_of_accounts_id_data?.nazvanie || '–',
      paymentArticle: counterparty.chart_of_accounts_id_2_data?.nazvanie || '–',
      comment: counterparty.komentariy || null,
      type: counterparty.tip || 'Не указан'
    }
  }, [counterparty])

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
      setDeletingOperation(null)
    } catch (error) {
      console.error('Error deleting operation:', error)
    }
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
          <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>
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

  return (
    <div className={styles.container}>
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
            <DateRangePicker
              selectedRange={dateRange}
              onChange={setDateRange}
              placeholder="Выберите период"
            />
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
                <div className={styles.debitCreditValue}>Нет задолженности</div>
              </div>

              {/* Credit Card */}
              <div className={styles.debitCreditCard}>
                <div className={styles.debitCreditTitle}>Кредиторка</div>
                <div className={styles.debitCreditValue}>Нет задолженности</div>
              </div>
            </div>

            {/* Right Card - Additional Info in two-column format */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle}>{counterpartyInfo?.name || 'Контрагент'}</div>
              <div className={styles.infoCardDivider}></div>
              <div className={styles.infoCardDetails}>
                {counterpartyInfo?.inn && (
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoCardLabel}>ИНН</span>
                    <span className={styles.infoCardValue}>{counterpartyInfo.inn}</span>
                  </div>
                )}
                <div className={styles.infoCardRow}>
                  <span className={styles.infoCardLabel}>Статья для поступлений</span>
                  <span className={styles.infoCardValue}>{counterpartyInfo?.receiptArticle || '–'}</span>
                </div>
                {counterpartyInfo?.kpp && (
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoCardLabel}>КПП</span>
                    <span className={styles.infoCardValue}>{counterpartyInfo.kpp}</span>
                  </div>
                )}
                <div className={styles.infoCardRow}>
                  <span className={styles.infoCardLabel}>Статья для выплат</span>
                  <span className={styles.infoCardValue}>{counterpartyInfo?.paymentArticle || '–'}</span>
                </div>
                {counterpartyInfo?.accountNumber && (
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoCardLabel}>№ счета</span>
                    <span className={styles.infoCardValue}>{counterpartyInfo.accountNumber}</span>
                  </div>
                )}
                {counterpartyInfo?.comment && (
                  <div className={styles.infoCardRow}>
                    <span className={styles.infoCardLabel}>Комментарий</span>
                    <span className={styles.infoCardValue}>{counterpartyInfo.comment}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operations Section */}
        <div className={styles.operationsSection}>
          <div className={styles.operationsContent}>
            <div className={styles.operationsHeader}>
              <h2 className={styles.operationsTitle}>Операции по контрагенту</h2>
              <div className={styles.operationsHeaderActions}>
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
                <button className={styles.filtersButton}>
                  Фильтры
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {isLoadingOperations ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка операций...</div>
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
                      <th className={styles.tableHeaderCell}>Сделка</th>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellRight)}>Сумма</th>
                      <th className={cn(styles.tableHeaderCell, styles.tableHeaderCellActions)}></th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {operations.map((op, index) => (
                      <tr
                        key={op.id}
                        className={styles.tableRow}
                      >
                        <td className={cn(styles.tableCell, styles.tableCellIndex)}>
                          {index + 1}
                        </td>
                        <td className={styles.tableCell}>{op.date}</td>
                        <td className={styles.tableCell}>{op.account}</td>
                        <td className={styles.tableCell}>
                          <span className={cn(
                            styles.typeBadge,
                            op.typeCategory === 'in' && styles.typeBadgeIn,
                            op.typeCategory === 'out' && styles.typeBadgeOut,
                            op.typeCategory === 'transfer' && styles.typeBadgeTransfer
                          )}>
                            {op.typeLabel}
                          </span>
                        </td>
                        <td className={styles.tableCell}>{op.counterparty}</td>
                        <td className={styles.tableCell}>{op.category}</td>
                        <td className={styles.tableCell}>{op.project}</td>
                        <td className={styles.tableCell}>{op.deal}</td>
                        <td className={cn(
                          styles.tableCell,
                          styles.amountCell,
                          op.typeCategory === 'in' && styles.positive,
                          op.typeCategory === 'out' && styles.negative,
                          op.typeCategory === 'transfer' && styles.neutral
                        )}>
                          {op.amount}
                        </td>
                        <td className={cn(styles.tableCell, styles.tableCellActions)} onClick={(e) => e.stopPropagation()}>
                          <OperationMenu
                            operation={op}
                            onEdit={handleEditOperation}
                            onDelete={handleDeleteOperation}
                          />
                        </td>
                      </tr>
                    ))}
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
    </div>
  )
}

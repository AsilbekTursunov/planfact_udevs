"use client"

import { useState, useRef, useCallback } from 'react'
import styles from './OperationsFiltersSidebar.module.scss'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import NewDateRangeComponent from '../../directories/NewDateRangeComponent'
import { FaSortDown } from 'react-icons/fa'
import Input from '../../shared/Input'
import { GroupedSelect } from '../../common/GroupedSelect/GroupedSelect'
import { appStore } from '../../../store/app.store'
import { observer } from 'mobx-react-lite'
import SelectCounterParties from '../../ReadyComponents/SelectCounterParties'
import MultiSelectStatiya from '../../ReadyComponents/MultiSelectStatiya'
import SelectMyAccounts from '../../ReadyComponents/SelectMyAccounts'
import { cn } from '@/app/lib/utils'

export const OperationsFiltersSidebar = observer(({
  isOpen,
  onClose,
  selectedFilters = [],
  onFilterChange,
  dateFilters,
  onDateFilterChange,
  selectedDatePaymentRange,
  onDatePaymentRangeChange,
  selectedLegalEntities,
  onLegalEntityToggle,
  selectedCounterAgents,
  onCounterAgentToggle,
  onAmountRangeChange,
  selectedChartOfAccounts,
  onChartOfAccountsChange,
  paymentType,
  onPaymentTypeChange,
}) => {
  // Ensure selectedFilters is always an array
  const safeSelectedFilters = Array.isArray(selectedFilters) ? selectedFilters : []

  const [expandedFilters, setExpandedFilters] = useState({ peremescheniye: false, nachisleniye: false })
  const [activeTab, setActiveTab] = useState('general')
  const [localAmount, setLocalAmount] = useState({ min: '', max: '' })
  const amountDebounceRef = useRef(null)

  const handleAmountChange = useCallback((field, rawValue) => {
    const digitsOnly = rawValue.replace(/[^0-9]/g, '')
    setLocalAmount(prev => ({ ...prev, [field]: digitsOnly }))
    if (amountDebounceRef.current) clearTimeout(amountDebounceRef.current)
    amountDebounceRef.current = setTimeout(() => {
      onAmountRangeChange(prev => ({ ...prev, [field]: digitsOnly }))
    }, 200)
  }, [onAmountRangeChange])

  if (!isOpen) return null



  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Фильтры</h2>
            <button
              onClick={onClose}
              className={styles.sidebarCloseButton}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Табы фильтров */}
          <div className={styles.filterTabs}>
            <button
              className={cn(styles.filterTab, activeTab === 'general' ? styles.active : styles.inactive)}
              onClick={() => setActiveTab('general')}
            >
              Общие
            </button>
            <button
              className={cn(styles.filterTab, activeTab === 'quick' ? styles.active : styles.inactive)}
              onClick={() => setActiveTab('quick')}
            >
              Быстрые
            </button>
          </div>

          <div className={styles.filterContentWrapper}>
            {/* Контент табов с анимацией */}
            <div className={styles.filterContent} key="general">
              {/* Тип операции */}
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.875rem' }}>
                  Тип операции
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </h3>

                {/* Поступление */}
                <div className={styles.filterOptions}>
                  <OperationCheckbox
                    checked={safeSelectedFilters.includes('Поступление') || false}
                    onChange={() => onFilterChange('type', 'Поступление')}
                    label="Поступление"
                  />

                  {/* Выплата */}
                  <OperationCheckbox
                    checked={safeSelectedFilters.includes('Выплата') || false}
                    onChange={() => onFilterChange('type', 'Выплата')}
                    label="Выплата"
                  />

                  {/* Перемещение */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                    <OperationCheckbox
                      checked={safeSelectedFilters.includes('Перемещение') || false}
                      onChange={() => {
                        onFilterChange('type', 'Перемещение')
                        onFilterChange('type', 'Списание', !safeSelectedFilters.includes('Перемещение'))
                        onFilterChange('type', 'Зачисление', !safeSelectedFilters.includes('Перемещение'))
                      }}
                      label="Перемещение"
                    />
                    <FaSortDown
                      style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        transform: expandedFilters.peremescheniye ? 'rotate(0deg)' : 'rotate(-180deg)',
                        marginBottom: expandedFilters.peremescheniye ? '10px' : '0',
                        color: '#6b7280',
                        fontSize: '12px'
                      }}
                      onClick={() => setExpandedFilters(prev => ({ ...prev, peremescheniye: !prev.peremescheniye }))}
                    />
                  </div>
                  {expandedFilters.peremescheniye && (
                    <div style={{ paddingLeft: '1.25rem', display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '0.75rem' }}>
                      <OperationCheckbox
                        checked={safeSelectedFilters.includes('Списание') || false}
                        onChange={() => onFilterChange('type', 'Списание')}
                        label="Списание"
                      />
                      <OperationCheckbox
                        checked={safeSelectedFilters.includes('Зачисление') || false}
                        onChange={() => onFilterChange('type', 'Зачисление')}
                        label="Зачисление"
                      />
                    </div>
                  )}

                  {/* Начисление */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                    <OperationCheckbox
                      checked={safeSelectedFilters.includes('Начисление') || false}
                      onChange={() => {
                        onFilterChange('type', 'Начисление')
                        onFilterChange('type', 'Дебет', !safeSelectedFilters.includes('Начисление'))
                        onFilterChange('type', 'Кредит', !safeSelectedFilters.includes('Начисление'))
                      }}
                      label="Начисление"
                    />
                    <FaSortDown
                      style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        transform: expandedFilters.nachisleniye ? 'rotate(0deg)' : 'rotate(-180deg)',
                        marginBottom: expandedFilters.nachisleniye ? '10px' : '0',
                        color: '#6b7280',
                        fontSize: '12px'
                      }}
                      onClick={() => setExpandedFilters(prev => ({ ...prev, nachisleniye: !prev.nachisleniye }))}
                    />
                  </div>
                  {expandedFilters.nachisleniye && (
                    <div style={{ paddingLeft: '1.25rem', display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: '0.75rem' }}>
                      <OperationCheckbox
                        checked={safeSelectedFilters.includes('Дебет') || false}
                        onChange={() => onFilterChange('type', 'Дебет')}
                        label="Дебет"
                      />
                      <OperationCheckbox
                        checked={safeSelectedFilters.includes('Кредит') || false}
                        onChange={() => onFilterChange('type', 'Кредит')}
                        label="Кредит"
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Дата оплаты - упрощенная версия, полная версия будет в отдельном компоненте */}
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.75rem' }}>
                  Дата оплаты
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </h3>
                <div className={styles.filterOptions}>
                  {[
                    { key: 'podtverzhdena', label: 'Подтверждена' },
                    { key: 'nePodtverzhdena', label: 'Не подтверждена' }
                  ].map(item => (
                    <label key={item.key} className={styles.filterOption}>
                      <OperationCheckbox
                        key={item.key}
                        checked={dateFilters[item.key]}
                        onChange={() => onDateFilterChange(item.key)}
                        label={item.label}
                      />
                    </label>
                  ))}
                </div>
                {/* CustomDatePicker for date payment range */}
                <NewDateRangeComponent
                  value={selectedDatePaymentRange}
                  onChange={onDatePaymentRangeChange}
                />
              </div>

              {/* Параметры */}
              <div className={styles.filterSection}>
                <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.75rem' }}>
                  Параметры
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Юрлица */}
                  <SelectMyAccounts
                    value={selectedLegalEntities}
                    onChange={onLegalEntityToggle}
                    placeholder="Юрлица и счета"
                  />


                  {/* Контрагенты */}
                  <SelectCounterParties
                    value={selectedCounterAgents}
                    onChange={onCounterAgentToggle}
                    placeholder="Контрагенты"
                  />

                  {/* Статьи */}
                  {/* <MultiSelect
                      data={articles}
                      value={selectedArticles}
                      onChange={onArticleToggle}
                      hideSelectAll={true}
                      placeholder="Все статьи"
                      valueKey="value"
                    /> */}

                  {/* Payment filter  */}
                  {appStore.isPayment && <GroupedSelect
                    data={[{ label: 'Наличный', value: 'cash' }, { label: 'Карта', value: 'card' }, { value: 'transfer', label: 'Перечисление' }]}
                    value={paymentType}
                    onChange={onPaymentTypeChange}
                    placeholder='Выберите тип платежа...'
                    groupBy={false}
                    labelKey='label'
                    valueKey='value'
                    className={'flex-1'}
                  />}


                  {/* Статьи учета */}
                  <MultiSelectStatiya
                    value={selectedChartOfAccounts}
                    onChange={onChartOfAccountsChange}
                    placeholder="Статьи учета"
                    type=""
                    dropdownClassName={'w-64'}
                  />



                  {/* Price */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      type="text"
                      inputMode="numeric"
                      action="filter"
                      placeholder="Сумма от"
                      value={localAmount.min}
                      onChange={(e) => handleAmountChange('min', e.target.value)}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>–</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      action="filter"
                      placeholder="до"
                      value={localAmount.max}
                      onChange={(e) => handleAmountChange('max', e.target.value)}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
})



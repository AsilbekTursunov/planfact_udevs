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
import { operationFilterStore } from '../../../store/operationFilter.store'
import { cn } from '@/app/lib/utils'
import { ChevronLeft } from 'lucide-react'
import MultiSelectZdelka from '../../ReadyComponents/MultiZdelka'

export const OperationsFiltersSidebar = observer(({
  isOpen,
  onClose,
}) => {
  const {
    selectedFilters,
    dateFilters,
    dateStartFilters,
    selectedDatePaymentRange,
    selectedDateStartRange,
    selectedLegalEntities,
    selectedCounterAgents,
    selectedChartOfAccounts,
    paymentType,
    deals
  } = operationFilterStore

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
      operationFilterStore.setAmountRange(prev => ({ ...prev, [field]: digitsOnly }))
    }, 200)
  }, [])

  if (!isOpen) return null



  return (
    <>
      <div className={styles.sidebar}>
        <div className="p-2 pt-5 overflow-auto pb-14">
          <div>
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-ucode-800 text-xl font-semibold">Фильтры</h2>
                <button
                  onClick={onClose}
                  className="cursor-pointer"
                >
                  <ChevronLeft size={20} className='text-primary-dark' />
                </button>
              </div>

              {/* Табы фильтров */}
              <div className="filterTabWrapper">
                <button
                  className={cn('filterTab', activeTab === 'general' ? 'active' : 'inactive')}
                  onClick={() => setActiveTab('general')}
                >
                  Общие
                </button>
                <button
                  className={cn('filterTab', activeTab === 'quick' ? 'active' : 'inactive')}
                  onClick={() => setActiveTab('quick')}
                >
                  Быстрые
                </button>
                {/* <div className={cn("filterTabActiveBg", activeTab === 'general' ? 'active' : 'inactive')}></div> */}
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
                        checked={safeSelectedFilters.includes('Поступление')}
                        onChange={() => operationFilterStore.toggleFilter('Поступление')}
                        label="Поступление"
                      />

                      {/* Выплата */}
                      <OperationCheckbox
                        checked={safeSelectedFilters.includes('Выплата')}
                        onChange={() => operationFilterStore.toggleFilter('Выплата')}
                        label="Выплата"
                      />


                      {/* Перемещение */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        <OperationCheckbox
                          checked={safeSelectedFilters.includes('Перемещение')}
                          onChange={() => operationFilterStore.toggleComplexFilter('Перемещение')}
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
                            checked={safeSelectedFilters.includes('Списание')}
                            onChange={() => operationFilterStore.toggleFilter('Списание')}
                            label="Списание"
                          />
                          <OperationCheckbox
                            checked={safeSelectedFilters.includes('Зачисление')}
                            onChange={() => operationFilterStore.toggleFilter('Зачисление')}
                            label="Зачисление"
                          />
                        </div>
                      )}

                      {/* Начисление */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        <OperationCheckbox
                          checked={safeSelectedFilters.includes('Начисление')}
                          onChange={() => operationFilterStore.toggleComplexFilter('Начисление')}
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
                            checked={safeSelectedFilters.includes('Дебет')}
                            onChange={() => operationFilterStore.toggleFilter('Дебет')}
                            label="Дебет"
                          />
                          <OperationCheckbox
                            checked={safeSelectedFilters.includes('Кредит')}
                            onChange={() => operationFilterStore.toggleFilter('Кредит')}
                            label="Кредит"
                          />
                        </div>
                      )}
                      {/* Отгрузка */}
                      <OperationCheckbox
                        checked={safeSelectedFilters.includes('Отгрузка')}
                        onChange={() => operationFilterStore.toggleFilter('Отгрузка')}
                        label="Отгрузка"
                      />
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
                            onChange={() => operationFilterStore.setDateFilters(item.key, !dateFilters[item.key])}
                            label={item.label}
                          />
                        </label>
                      ))}
                    </div>
                    {/* CustomDatePicker for date payment range */}
                    <NewDateRangeComponent
                      value={selectedDatePaymentRange}
                      onChange={(val) => operationFilterStore.setSelectedDatePaymentRange(val)}
                    />
                  </div>

                  {/* Дата начисления - упрощенная версия, полная версия будет в отдельном компоненте */}

                  <div className={styles.filterSection}>
                    <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.75rem' }}>
                      Дата начисления
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
                            checked={dateStartFilters[item.key]}
                            onChange={() => operationFilterStore.setDateStartFilters(item.key, !dateStartFilters[item.key])}
                            label={item.label}
                          />
                        </label>
                      ))}
                    </div>
                    {/* CustomDatePicker for date start range */}
                    <NewDateRangeComponent
                      value={selectedDateStartRange}
                      onChange={(val) => operationFilterStore.setSelectedDateStartRange(val)}
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
                        onChange={(val) => operationFilterStore.setSelectedLegalEntities(val)}
                        placeholder="Юрлица и счета"
                      />


                      {/* Контрагенты */}
                      <SelectCounterParties
                        value={selectedCounterAgents}
                        onChange={(val) => operationFilterStore.setSelectedCounterAgents(val)}
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
                        onChange={(val) => operationFilterStore.setPaymentType(val)}
                        placeholder='Выберите тип платежа...'
                        groupBy={false}
                        labelKey='label'
                        valueKey='value'
                        className={'flex-1'}
                      />}


                      {/* Статьи учета */}
                      <MultiSelectStatiya
                        value={selectedChartOfAccounts}
                        onChange={(val) => operationFilterStore.setSelectedChartOfAccounts(val)}
                        placeholder="Статьи учета"
                        type=""
                        dropdownClassName={'w-64'}
                      />

                      <MultiSelectZdelka
                        value={deals}
                        onChange={(val) => operationFilterStore.setSelectedDeals(val)}
                        placeholder="Сделки"
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
            </>

          </div>
        </div>
      </div>
    </>
  )
})



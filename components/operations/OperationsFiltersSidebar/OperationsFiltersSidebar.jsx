"use client"

import { useState, useRef, useCallback } from 'react'
import styles from './OperationsFiltersSidebar.module.scss'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import NewDateRangeComponent from '../../directories/NewDateRangeComponent'
import { FaSortDown } from 'react-icons/fa'
import Input from '../../shared/Input'
import { appStore } from '../../../store/app.store'
import { observer } from 'mobx-react-lite'
import SelectCounterParties from '../../ReadyComponents/SelectCounterParties'
import MultiSelectStatiya from '../../ReadyComponents/MultiSelectStatiya'
import SelectMyAccounts from '../../ReadyComponents/SelectMyAccounts'
import { operationFilterStore } from '../../../store/operationFilter.store'
import MultiSelectZdelka from '../../ReadyComponents/MultiZdelka'
import { FilterSection, FilterSidebar } from '../../directories/FilterSidebar/FilterSidebar'
import SingleSelect from '../../shared/Selects/SingleSelect'

export const OperationsFiltersSidebar = observer(({
  isOpen, onClose, clearCount, onClear
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
  // const [activeTab, setActiveTab] = useState('general')
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


  const handleChangeFilter = () => {
    // control all filters values here adter that call find_operations with queryClient.invalidateQueries
    
  }


  return (
    <>
      <FilterSidebar isOpen={isOpen} onClose={onClose} clearCount={clearCount} onClear={onClear}>
        {/* Тип операции */}
        <FilterSection title="Тип операции" className="mb-5">
          {/* Поступление */}
          <div className="flex flex-col gap-3 justify-start items-start">
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
        </FilterSection>

        {/* Дата оплаты - упрощенная версия, полная версия будет в отдельном компоненте */}
        <FilterSection title="Дата оплаты" className="mb-5">
          <div className="space-y-3">
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
        </FilterSection>
 
        <FilterSection title="Дата начисления" className="mb-5">
          <div className="space-y-3">
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
        </FilterSection>

        {/* Параметры */}
        <FilterSection title="Параметры" className="mb-5">
          <div className="flex flex-col gap-2">
            {/* Юрлица */}
            <SelectMyAccounts
              value={selectedLegalEntities}
              onChange={(val) => operationFilterStore.setSelectedLegalEntities(val)}
              placeholder="Юрлица и счета"
              className={'bg-gray-ucode-25'}
            />


            {/* Контрагенты */}
            <SelectCounterParties
              value={selectedCounterAgents}
              onChange={(val) => operationFilterStore.setSelectedCounterAgents(val)}
              placeholder="Контрагенты"
              className={'bg-gray-ucode-25'}

            />

            {/* Payment filter  */}
            {appStore.isPayment && <SingleSelect
              data={[{ label: 'Наличный', value: 'cash' }, { label: 'Карта', value: 'card' }, { value: 'transfer', label: 'Перечисление' }]}
              value={paymentType}
              onChange={(val) => operationFilterStore.setPaymentType(val)}
              placeholder='Выберите тип платежа...'
              className={'bg-gray-ucode-25'}
            />}


            {/* Статьи учета */}
            <MultiSelectStatiya
              value={selectedChartOfAccounts}
              onChange={(val) => operationFilterStore.setSelectedChartOfAccounts(val)}
              placeholder="Статьи учета"
              type=""
              dropdownClassName={'w-64'}
              className={'bg-gray-ucode-25'}
            />

            <MultiSelectZdelka
              value={deals}
              onChange={(val) => operationFilterStore.setSelectedDeals(val)}
              placeholder="Сделки"
            />

            {/* Price */}
            <div className="flex items-center gap-2">
              <Input
                type="text"
                inputMode="numeric"
                action="filter"
                placeholder="Сумма от"
                value={localAmount.min}
                onChange={(e) => handleAmountChange('min', e.target.value)}
                className="h-[34px]! bg-gray-ucode-25"
              />
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>–</span>
              <Input
                type="text"
                inputMode="numeric"
                action="filter"
                placeholder="до"
                value={localAmount.max}
                onChange={(e) => handleAmountChange('max', e.target.value)}
                className="h-[34px]! bg-gray-ucode-25"
              />
            </div>
          </div>
        </FilterSection>
      </FilterSidebar>
    </>
  )
})



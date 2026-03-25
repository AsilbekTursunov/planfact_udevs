'use client'
import React from 'react'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { TreeSelect } from '@/components/common/TreeSelect/TreeSelect'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import Input from '@/components/shared/Input'
import TextArea from '@/components/shared/TextArea'
import SplitAmount from '../../SplitAmount'
import { DebitIcon, CreditIcon } from '../../../../../constants/icons'
import { appStore } from '../../../../../store/app.store'
import { cn } from '@/app/lib/utils'
import styles from '../../OperationModal.module.scss'
import SinglSelectStatiya from '../../../../ReadyComponents/SingleSelectStatiya'

const PaymentForm = ({
  // form state
  formData,
  setFormData,
  errors,
  setErrors,
  // display flags
  isDebit,
  isCredit,
  showDate,
  showAgent,
  showStatya,
  // data
  bankAccounts,
  counterAgentsTree,
  chartOfAccountsTree,
  formattedDeals,
  counterAgents,
  // loading
  loadingBankAccounts,
  isLoadingGroups,
  loadingChartOfAccounts,
  // split
  rows,
  dispatch,
  selectedSplits,
  handleUpdateSplit,
  setdivivedAmounts,
  operationData,
  preselectedCounterparty,
  disableCounterpartySelect,
  // helpers
  formatAmount,
  parseAmount,
  getAccountCurrency,
  todayDate,
  // salesDeal modal
  setTempSalesDeal,
  setIsDateModalOpen,
}) => {
  return (
    <>
      {/* Дата оплаты */}
      <div className={styles.formRow}>
        <label className={styles.label}>Дата оплаты</label>
        <div className={styles.fieldWrapper}>
          <DatePicker
            value={formData.paymentDate}
            onChange={value => {
              const pickDate = Number(value?.slice(-2))
              const isFuture = pickDate > todayDate
              setFormData({ ...formData, paymentDate: value, confirmPayment: isFuture ? false : true })
              if (errors.paymentDate) setErrors({ ...errors, paymentDate: null })
            }}
            placeholder='Выберите дату'
            showCheckbox={true}
            dateFormat='YYYY-MM-DD'
            checkboxLabel='Подтвердить оплату'
            checkboxValue={formData.confirmPayment}
            onCheckboxChange={checked => {
              const pickDate = Number(formData.paymentDate?.slice(-2))
              const isFuture = pickDate > todayDate
              if (isFuture) return
              setFormData({ ...formData, confirmPayment: checked })
            }}
            className={cn(styles.datePicker, errors.paymentDate && styles.error)}
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
              if (errors.accountAndLegalEntity) setErrors({ ...errors, accountAndLegalEntity: null })
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

      {/* Сумма + SplitAmount */}
      <div className={styles.amountWrapper}>
        <div className={styles.formRow}>
          <label className={styles.label}>Сумма</label>
          <div className={styles.fieldWrapper}>
            <div className={styles.inputGroup}>
              <Input
                type='text'
                value={formatAmount(formData.amount)}
                onChange={e => {
                  setFormData({ ...formData, amount: parseAmount(e.target.value) })
                  if (errors.amount) setErrors({ ...errors, amount: null })
                }}
                placeholder='0'
                className={cn(styles.input, errors.amount && styles.error)}
              />
              {isDebit && <DebitIcon />}
              {isCredit && <CreditIcon />}
              {getAccountCurrency(formData.accountAndLegalEntity) && (
                <div className={styles.currencyDisplay}>
                  {getAccountCurrency(formData.accountAndLegalEntity)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>&nbsp;</label>
          <div className={styles.fieldWrapper}>
            <SplitAmount
              amount={formData?.amount}
              counterAgents={counterAgents}
              chartOfAccountsOptions={chartOfAccountsTree}
              onChange={setdivivedAmounts}
              rows={rows}
              modalType='payment'
              dispatch={dispatch}
              // salesDeal={formData.salesDeal}
              confirmAccural={formData.confirmAccrual}
              confirmPayment={formData.confirmPayment}
              selectedSplits={selectedSplits}
              preselectedCounterparty={preselectedCounterparty}
              setSelectedSplits={handleUpdateSplit}
              initiallyOpen={operationData?.operationParts && operationData.operationParts.length > 0}
            />
          </div>
        </div>
      </div>

      {/* Дата начисления */}
      {!showDate && (
        <div className={styles.formRow}>
          <label className={styles.label}>Дата начисления</label>
          <DatePicker
            value={formData.accrualDate}
            onChange={value => {
              const pickDate = Number(value?.slice(-2))
              const isFuture = pickDate > todayDate
              setFormData({ ...formData, accrualDate: value, confirmAccrual: isFuture ? false : true })
              if (errors.accrualDate) setErrors({ ...errors, accrualDate: null })
            }}
            placeholder='Выберите дату'
            showCheckbox
            dateFormat='YYYY-MM-DD'
            checkboxLabel='Подтвердить начисление'
            checkboxValue={formData.confirmAccrual}
            onCheckboxChange={checked => {
              const pickDate = Number(formData.accrualDate?.slice(-2))
              const isFuture = pickDate > todayDate
              if (isFuture) return
              setFormData({ ...formData, confirmAccrual: checked })
            }}
            className={cn(styles.datePicker, errors.accrualDate && styles.error)}
          />
        </div>
      )}

      {/* Контрагент */}
      {!showAgent && (
        <div className={styles.formRow}>
          <label className={styles.label}>Контрагент</label>
          <TreeSelect
            data={counterAgentsTree}
            value={formData.counterparty}
            onChange={value => setFormData({ ...formData, counterparty: value })}
            placeholder='Выберите контрагента...'
            className='flex-1'
            loading={isLoadingGroups}
            disabled={disableCounterpartySelect}
          />
        </div>
      )}

      {/* Статья */}
      {!showStatya && (
        <div className={styles.formRow}>
          <label className={styles.label}>Статья</label>
          {/* <TreeSelect
            data={chartOfAccountsTree}
            alwaysExpanded={true}
            value={formData.chartOfAccount}
            onChange={value => setFormData({ ...formData, chartOfAccount: value })}
            placeholder='Выберите статью...'
            loading={loadingChartOfAccounts}
            className='flex-1'
          /> */}
          <SinglSelectStatiya
            selectedValue={formData.chartOfAccount}
            setSelectedValue={value => setFormData({ ...formData, chartOfAccount: value })}
            placeholder='Нераспределенный расход'
            className='flex-1 bg-white'
            type={"Доходы"}
          />
        </div>
      )}

      {/* Тип платежа (isPayment feature flag) */}
      {appStore.isPayment && (
        <div className={styles.formRow}>
          <label className={styles.label}>Тип платежа</label>
          <GroupedSelect
            data={[
              { label: 'Наличный', value: 'cash' },
              { label: 'Карта', value: 'card' },
              { value: 'transfer', label: 'Перечисление' },
            ]}
            value={formData.paymentType}
            onChange={value => setFormData(prev => ({ ...prev, paymentType: value }))}
            placeholder='Выберите тип платежа...'
            groupBy={false}
            labelKey='label'
            valueKey='value'
            className='flex-1'
          />
        </div>
      )}

      {/* Сделка продажи */}
      <div className={styles.formRow}>
        <label className={styles.label}>Сделка продажи</label>
        <div className={styles.fieldWrapper}>
          <GroupedSelect
            data={formattedDeals}
            value={formData.salesDeal}
            onChange={value => {
              if (value && showDate) {
                setTempSalesDeal(value)
                setIsDateModalOpen(true)
              } else {
                setFormData({ ...formData, salesDeal: value })
              }
              if (errors.salesDeal) setErrors({ ...errors, salesDeal: null })
            }}
            placeholder='Выберите сделку...'
            groupBy={false}
            labelKey='label'
            valueKey='guid'
            loading={loadingBankAccounts}
            hasError={!!errors.salesDeal}
          />
          {errors.salesDeal && <span className={styles.errorText}>{errors.salesDeal}</span>}
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
              if (errors.purpose) setErrors({ ...errors, purpose: null })
            }}
            placeholder='Назначение платежа'
            rows={3}
            error={errors.purpose}
          />
          {errors.purpose && <span className={styles.errorText}>{errors.purpose}</span>}
        </div>
      </div>
    </>
  )
}

export default PaymentForm
'use client'

import React, { useState } from 'react'
import { appStore } from '../../../store/app.store'
import { observer } from 'mobx-react-lite'
import { ChevronDown } from 'lucide-react'
import styles from './settings.module.scss'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'

/* ─── currency options ────────────────────────────────── */
const currencies = [
  { value: 'RUB', label: 'RUB (Российский рубль)' },
  { value: 'USD', label: 'USD (Доллар США)' },
  { value: 'EUR', label: 'EUR (Евро)' },
  { value: 'UZS', label: 'UZS (Узбекский сум)' },
]

const SettingsPage = observer(() => {
  /* ── general form state ──────────────────────────── */
  const [currency, setCurrency] = useState('RUB')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [purposeOptional, setPurposeOptional] = useState(false)

  function handleSwitchPayment() {
    appStore.setIsPayment(!appStore.isPayment);
  }

  const selected = currencies.find(c => c.value === currency)

  return (
    <div className={styles.mainContent}>
      <h1 className={styles.pageTitle}>Общие настройки</h1>

      {/* ── Настройки аккаунта ─────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Настройки аккаунта</h2>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Основная валюта</label>
          <div className={styles.selectWrap}>
            <button
              className={styles.select}
              onClick={() => setCurrencyOpen(prev => !prev)}
              type='button'
            >
              <span>{selected?.label}</span>
              <ChevronDown size={16} className={currencyOpen ? styles.chevronOpen : ''} />
            </button>
            {currencyOpen && (
              <ul className={styles.selectDropdown}>
                {currencies.map(c => (
                  <li
                    key={c.value}
                    className={`${styles.selectOption} ${c.value === currency ? styles.selectOptionActive : ''}`}
                    onClick={() => { setCurrency(c.value); setCurrencyOpen(false) }}
                  >
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Настройки учета ────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Настройки учета</h2>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Создание и редактирование операций</h2>
          <OperationCheckbox checked={appStore.isPayment} onChange={handleSwitchPayment} label='Тип платежа' />
          <OperationCheckbox checked={purposeOptional} onChange={() => setPurposeOptional(v => !v)} label='Сделать поле «Назначение платежа» необязательным' />
        </section>
      </section>
    </div>
  )
})

export default SettingsPage

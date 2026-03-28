'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { appStore } from '../../../store/app.store'
import { observer } from 'mobx-react-lite'
import styles from './settings.module.scss'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import SingleSelect from '../../../components/shared/Selects/SingleSelect'

/* ─── currency options ────────────────────────────────── */
const SettingsPage = observer(() => {
  /* ── general form state ──────────────────────────── */
  const [purposeOptional, setPurposeOptional] = useState(false)


  const { data: currencies } = useUcodeRequestQuery({
    method: 'get_currencies',
    querySetting: {
      select: (response) => response?.data?.data?.data
    }
  })

  useEffect(() => {
    if (currencies) {
      const currency = currencies.find(c => c.kod === 'UZS')
      appStore.setCurrency({ name: currency?.kod, guid: currency?.guid })
    }
  }, [currencies])

  const currenciesList = useMemo(() => {
    return currencies?.map(c => ({
      value: c.guid,
      label: `${c.kod} (${c.nazvanie})`
    }))
  }, [currencies])

  function handleSwitchPayment() {
    appStore.setIsPayment(!appStore.isPayment);
  }

  const handleSelectCurrency = (value) => {
    const name = currencies.find(c => c.guid === value)?.kod
    appStore.setCurrency({ name: name, guid: value })
  }

  return (
    <div className={styles.mainContent}>
      <h1 className={styles.pageTitle}>Общие настройки</h1>

      {/* ── Настройки аккаунта ─────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Настройки аккаунта</h2>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Основная валюта</label>
          <div className={styles.selectWrap}>
            <SingleSelect
              data={currenciesList}
              value={appStore?.currency?.guid}
              onChange={handleSelectCurrency}
              placeholder='Выберите валюту'
              withSearch={false}
              isClearable={false}
              className="bg-white text-neutral-700"
            />
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

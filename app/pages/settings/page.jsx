'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { appStore } from '../../../store/app.store'
import { observer } from 'mobx-react-lite'
import styles from './settings.module.scss'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'
import { useUcodeRequestMutation, useUcodeRequestQuery } from '../../../hooks/useDashboard'
import SingleSelect from '../../../components/shared/Selects/SingleSelect'
import { queryClient } from '../../../lib/queryClient'

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
  const { data } = useUcodeRequestQuery({
    method: 'get_general_settings',
    querySetting: {
      select: (response) => response?.data?.data?.data
    }
  })

  console.log('data', data)

  const { mutateAsync: updateSettings } = useUcodeRequestMutation({
    querySetting: {
      onSuccess: () => {
        // successToast('Настройки успешно обновлены')
      }
    }
  })

  useEffect(() => {
    if (data) {
      // const currency = currencies.find(c => c.kod === 'UZS')
      appStore.setCurrency({ name: data?.default_currency_code, guid: data?.default_currency_id })
    } else {
      const currency = currencies?.find(c => c.kod === 'UZS')
      appStore.setCurrency({ name: currency?.kod, guid: currency?.guid })
    }
  }, [data, currencies])

  const currenciesList = useMemo(() => {
    return currencies?.map(c => ({
      value: c.guid,
      label: `${c.kod} (${c.nazvanie})`
    }))
  }, [currencies])

  function handleSwitchPayment() {
    appStore.setIsPayment(!appStore.isPayment);
  }

  const handleSelectCurrency = async (value) => {
    const name = currencies.find(c => c.guid === value)?.kod
    await updateSettings({
      method: 'update_general_settings',
      data: {
        "default_currency_id": value,
        "default_currency_code": name,
      }
    }).then((data) => {
      // successToast('Настройки успешно обновлены')
      const response = data?.data?.data?.data
      console.log('response', response)
      appStore.setCurrency({ name: response?.default_currency_code, guid: response?.default_currency_id })
      queryClient.invalidateQueries({ queryKey: ['get_general_settings'] })
    }).catch(() => {
      // errorToast('Ошибка при обновлении настроек')
    })
  }

  return (
    <div className=" p-3">
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

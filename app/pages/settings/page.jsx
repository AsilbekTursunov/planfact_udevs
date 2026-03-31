'use client'

import { useMemo, useState } from 'react'
import { appStore } from '../../../store/app.store'
import { observer } from 'mobx-react-lite'
import styles from './settings.module.scss'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'
import SingleSelect from '../../../components/shared/Selects/SingleSelect'
import { queryClient } from '../../../lib/queryClient'
import { useUcodeRequestMutation } from '../../../hooks/useDashboard'

/* ─── currency options ────────────────────────────────── */
const SettingsPage = observer(() => {
  /* ── general form state ──────────────────────────── */
  const [purposeOptional, setPurposeOptional] = useState(false)

  const { mutateAsync: updateSettings } = useUcodeRequestMutation()

  const currenciesList = useMemo(() => {
    return appStore.currencies?.map(c => ({
      value: c.guid,
      label: `${c.kod} (${c.nazvanie})`
    }))
  }, [appStore])

  function handleSwitchPayment() {
    appStore.setIsPayment(!appStore.isPayment);
  }

  const handleSelectCurrency = async (value) => {
    const name = appStore.currencies.find(c => c.guid === value)?.kod
    await updateSettings({
      method: 'update_general_settings',
      data: {
        "default_currency_id": value,
        "default_currency_code": name,
      }
    }).then((data) => {
      // successToast('Настройки успешно обновлены')
      const response = appStore.currencies.find(c => c.guid === value)
      appStore.setCurrency({ name: response?.icon, guid: response?.guid })
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

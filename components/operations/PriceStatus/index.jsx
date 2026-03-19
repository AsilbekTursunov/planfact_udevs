import React from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'
import { BsCurrencyDollar } from 'react-icons/bs'
import { TbCurrencyRubel } from 'react-icons/tb'
import { PiCurrencyKztDuotone } from 'react-icons/pi'
import { CreditIcon, DebitIcon } from '../../../constants/icons'

const PriceStatus = ({ amount, type, tab, confirmed, accrual, currency }) => {
  return (
    <div
      className={cn(
        styles.container,
        tab === 'Поступление' && styles.positive,
        tab === 'Выплата' && styles.negative,
        tab === 'Перемещение' && styles.neutral
      )}
    >
      {/* Debit icon (Д) - показываем когда НЕ confirmed И accrual = true */}
      {!confirmed && accrual && (tab === 'Поступление') && (
        <DebitIcon />
      )}
      {confirmed && !accrual && (tab === 'Выплата') && (
        <DebitIcon />
      )}
      {/* Credit icon (К) - показываем когда confirmed = true И НЕ accrual */}
      {confirmed && !accrual && (tab === 'Поступление') && (
        <CreditIcon />
      )}
      {!confirmed && accrual && (tab === 'Выплата') && (
        <CreditIcon />
      )}
      <span className={styles.amountText}>{tab == "Перемещение" ? <>
        <div className={`${styles.doubleAccount} flex flex-col gap-1`}>
          <span className='flex items-center gap-1'>-{amount} <span className={styles.currency}>{
            currency == 'USD' ? <BsCurrencyDollar /> : currency == 'RUB' ? <TbCurrencyRubel /> : currency == 'KZT' ? <PiCurrencyKztDuotone /> : 'UZS'}</span></span>
          <span className='flex items-center gap-1'>+{amount} <span className={styles.currency}>{
            currency == 'USD' ? <BsCurrencyDollar /> : currency == 'RUB' ? <TbCurrencyRubel /> : currency == 'KZT' ? <PiCurrencyKztDuotone /> : 'UZS'}</span></span>
        </div>
      </> : `${type == 'Поступление' ? '+' : '-'}${amount}`}</span>
      {tab != "Перемещение" && <span className={styles.currency}>{
        currency == 'USD' ? <BsCurrencyDollar /> : currency == 'RUB' ? <TbCurrencyRubel /> : currency == 'KZT' ? <PiCurrencyKztDuotone /> : 'UZS'}</span>}
    </div>
  )
}

export default PriceStatus
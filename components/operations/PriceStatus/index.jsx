import React from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'
import { BsCurrencyDollar } from 'react-icons/bs'
import { TbCurrencyRubel } from 'react-icons/tb'
import { PiCurrencyKztDuotone } from 'react-icons/pi'

const PriceStatus = ({ amount, type, confirmed, accrual, currency }) => {
  return (
    <div
      className={cn(
        styles.container,
        type === 'in' && styles.positive,
        type === 'out' && styles.negative,
        type === 'transfer' && styles.neutral
      )}
    >
      {/* Debit icon (Дебет) - if confirmed and not both confirmed & accrual */}
      {confirmed && !(confirmed && accrual) && (
        <div className={styles.debitIcon}>
          <span className={styles.text}> Д </span>
        </div>
      )}
      {/* Credit icon (Кредит) - if accrual and not both confirmed & accrual */}
      {accrual && !(confirmed && accrual) && (
        <div className={styles.creditIcon}>
          <span className={styles.text}> К </span>
        </div>
      )}
      <span className={styles.amountText}>{amount}</span>
      <span className={styles.currency}>{
        currency == 'USD' ? <BsCurrencyDollar /> : currency == 'RUB' ? <TbCurrencyRubel /> : currency == 'KZT' ? <PiCurrencyKztDuotone /> : 'UZS'}</span>
    </div>
  )
}

export default PriceStatus
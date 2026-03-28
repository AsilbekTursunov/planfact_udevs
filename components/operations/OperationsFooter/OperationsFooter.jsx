"use client"

import { cn } from '@/app/lib/utils'
import styles from './OperationsFooter.module.scss'
import { BsCurrencyDollar } from 'react-icons/bs'
import { formatAmount } from '../../../utils/helpers'

export function OperationsFooter({ isFilterOpen = false, totalSummary }) {


  return (
    <div className={cn(styles.footer, isFilterOpen && styles.withFilter)}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <span><strong className={styles.footerText}>{totalSummary?.count}</strong> операций</span>

          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.receipt?.count}</strong>
            поступлений: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.receipt?.total_summa)}</strong>
            <BsCurrencyDollar color={'#151616ff'} size={14} />
          </span>
          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.payment?.count}</strong>
            выплат: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.payment?.total_summa)}</strong> <BsCurrencyDollar color={'#1d1c1cff'} size={14} />
          </span>
          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.transfer?.count}</strong>  перемещения: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.transfer?.total_summa)}</strong> <BsCurrencyDollar color={'#151616ff'} size={14} />
          </span>
        </div>
        <div className={styles.footerRight}>
          Итого: <span className={cn(styles.footerTotal, totalSummary?.net_cash_flow >= 0 ? styles.footerTextPositive : styles.footerTextNegative)}>{formatAmount(totalSummary?.net_cash_flow)}</span>
          <BsCurrencyDollar color={totalSummary?.net_cash_flow >= 0 ? '#16a34a' : '#dc2626'} size={14} />
        </div>
      </div>
    </div>
  )
}

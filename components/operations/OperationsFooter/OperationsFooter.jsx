"use client"

import { cn } from '@/app/lib/utils'
import styles from './OperationsFooter.module.scss'
import { formatAmount } from '../../../utils/helpers'
import { GlobalCurrency } from '../../../constants/globalCurrency'

export function OperationsFooter({ isFilterOpen = false, totalSummary }) {


  return (
    <div className={cn(styles.footer, isFilterOpen && styles.withFilter)}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <span><strong className={styles.footerText}>{totalSummary?.count}</strong> операций</span>

          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.receipt?.count}</strong>
            поступлений: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.receipt?.total_summa)}</strong>
            <span>{GlobalCurrency}</span>
          </span>
          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.payment?.count}</strong>
            выплат: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.payment?.total_summa)}</strong> <span>{GlobalCurrency}</span>
          </span>
          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.transfer?.count}</strong>  перемещения: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.transfer?.total_summa)}</strong> <span>{GlobalCurrency}</span>
          </span>
        </div>
        <div className={styles.footerRight}>
          Итого: <span className={cn(styles.footerTotal, totalSummary?.net_cash_flow >= 0 ? styles.footerTextPositive : styles.footerTextNegative)}>{formatAmount(totalSummary?.net_cash_flow)}</span>
          <span>{GlobalCurrency}</span>
        </div>
      </div>
    </div>
  )
}

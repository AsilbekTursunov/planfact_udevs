"use client"
import { cn } from '@/app/lib/utils'
import styles from './OperationsFooter.module.scss'
import { formatNumber, formatTotalSumma } from '../../../utils/helpers'
import { GlobalCurrency } from '../../../constants/globalCurrency'
import { observer } from 'mobx-react-lite'
import useMounted from '../../../hooks/useMounted'

export const OperationsFooter = observer(({ isFilterOpen = false, totalSummary }) => {
  const mounted = useMounted()

  if (!mounted) return null

  return (
    <div className={cn('fixed bg-neutral-100 p-2  border-neutral-200 border-t items-center justify-center bottom-0 left-0 right-0 py-3 z-30 transition-all duration-300', isFilterOpen ? 'left-[320px]' : 'left-[110px]')}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <span><strong className={styles.footerText}>{totalSummary?.count}</strong> операций</span>

          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.receipt?.count}</strong>
            поступлений: <strong className={styles.footerText}>{formatNumber(formatTotalSumma(totalSummary?.by_type?.receipt?.total_summa))}</strong>
            <span>{GlobalCurrency?.name}</span>
          </span>
          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.payment?.count}</strong>
            выплат: <strong className={styles.footerText}>{formatNumber(formatTotalSumma(totalSummary?.by_type?.payment?.total_summa))}</strong> <span>{GlobalCurrency?.name}</span>
          </span>
          <span className={styles.textWrapper}>
            <strong className={styles.footerText}>{totalSummary?.by_type?.transfer?.count}</strong>  перемещения: <strong className={styles.footerText}>{formatNumber(formatTotalSumma(totalSummary?.by_type?.transfer?.total_summa))}</strong> <span>{GlobalCurrency?.name}</span>
          </span>
        </div>
        <div className={styles.footerRight}>
          Итого: <span className={cn(styles.footerTotal, totalSummary?.net_cash_flow >= 0 ? styles.footerTextPositive : styles.footerTextNegative)}>{formatNumber(formatTotalSumma(totalSummary?.net_cash_flow))}</span>
          <span>{GlobalCurrency?.name}</span>
        </div>
      </div>
    </div>
  )
})

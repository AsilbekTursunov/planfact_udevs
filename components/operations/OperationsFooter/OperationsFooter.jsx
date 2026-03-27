"use client"

import { cn } from '@/app/lib/utils'
import styles from './OperationsFooter.module.scss'
import { useMemo } from 'react'
import { BsCurrencyDollar } from 'react-icons/bs'
import { formatAmount } from '../../../utils/helpers'

export function OperationsFooter({ isFilterOpen = false, operations = [], totalOperations, totalSummary }) {
  
  const stats = useMemo(() => {
    if (!operations || operations.length === 0) {
      return {
        total: totalOperations || 0,
        income: { count: 0, sum: 0 },
        payment: { count: 0, sum: 0 },
        transfer: { count: 0, sum: 0 },
        accrual: { count: 0, sum: 0 },
        totalSum: 0
      }
    }

    let incomeCount = 0
    let incomeSum = 0
    let paymentCount = 0
    let paymentSum = 0
    let transferCount = 0
    let transferSum = 0
    let accrualCount = 0
    let accrualSum = 0

    operations.forEach(op => {
      const amount = parseFloat(op.amount?.replace(/[+\s]/g, '') || '0')

      if (op.typeCategory === 'in') {
        incomeCount++
        incomeSum += amount
      } else if (op.typeCategory === 'out') {
        paymentCount++
        paymentSum += Math.abs(amount)
      } else if (op.typeCategory === 'transfer') {
        if (op.typeLabel === 'Начисление') {
          accrualCount++
          accrualSum += Math.abs(amount)
        } else {
          transferCount++
          transferSum += Math.abs(amount)
        }
      }
    })

    const totalSum = incomeSum - paymentSum

    return {
      total: totalOperations || operations.length,
      income: { count: incomeCount, sum: incomeSum },
      payment: { count: paymentCount, sum: paymentSum },
      transfer: { count: transferCount, sum: transferSum },
      accrual: { count: accrualCount, sum: accrualSum },
      totalSum
    }
  }, [operations, totalOperations])

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
          {stats.transfer.sum > 0 && <span className={styles.textWrapper}><strong className={styles.footerText}>{totalSummary?.by_type?.transfer?.count}</strong> перемещений: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.transfer?.total_summa)}</strong> <BsCurrencyDollar color={'#151616ff'} size={14} /></span>}
          {stats.accrual.sum > 0 && <span className={styles.textWrapper}><strong className={styles.footerText}>{totalSummary?.by_type?.accrual?.count}</strong> начислений: <strong className={styles.footerText}>{formatAmount(totalSummary?.by_type?.accrual?.total_summa)}</strong> <BsCurrencyDollar color={'#151616ff'} size={14} /></span>}
        </div>
        <div className={styles.footerRight}>
          Итого: <span className={cn(styles.footerTotal, totalSummary?.net_cash_flow >= 0 ? styles.footerTextPositive : styles.footerTextNegative)}>{formatAmount(totalSummary?.net_cash_flow)}</span>
          <BsCurrencyDollar color={totalSummary?.net_cash_flow >= 0 ? '#16a34a' : '#dc2626'} size={14} />
        </div>
      </div>
    </div>
  )
}

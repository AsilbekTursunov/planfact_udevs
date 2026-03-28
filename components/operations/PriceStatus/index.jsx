import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'
import { BsCurrencyDollar } from 'react-icons/bs'
import { TbCurrencyRubel } from 'react-icons/tb'
import { PiCurrencyKztDuotone } from 'react-icons/pi'
import { CreditIcon, DebitIcon } from '../../../constants/icons'
import { formatAmount } from '../../../utils/helpers'
import { operationFilterStore } from '../../../store/operationFilter.store'
import { observer } from 'mobx-react-lite'

const PriceStatus = observer(({ amount, type, tab, confirmed, accrual, currency, dealId, percent }) => {
  const isSpinasiya = !operationFilterStore.selectedFilters?.includes('Списание')
  const isZachisleniya = !operationFilterStore.selectedFilters?.includes('Зачисление')
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
      {!confirmed && accrual && (tab === 'Поступление') && !dealId && (
        <DebitIcon />
      )}
      {confirmed && !accrual && (tab === 'Выплата') && (
        <DebitIcon />
      )}
      {/* Credit icon (К) - показываем когда confirmed = true И НЕ accrual */}
      {confirmed && !accrual && (tab === 'Поступление') && !dealId && (
        <CreditIcon />
      )}
      {!confirmed && accrual && (tab === 'Выплата') && (
        <CreditIcon />
      )}
      <div className={styles.amountText}>
        {tab == "Перемещение" ? <>
          <div className={`${styles.doubleAccount} flex flex-col `}>
            <span className={`flex items-center gap-1 text-neutral-500 ${isSpinasiya ? 'opacity-50' : ''}`}>-{formatAmount(amount)} <span className=" text-neutral-500">{
              currency == 'USD' ? <BsCurrencyDollar /> : currency == 'RUB' ? <TbCurrencyRubel /> : currency == 'KZT' ? <PiCurrencyKztDuotone /> : 'UZS'}</span></span>
            <span className={`flex items-center gap-1 text-neutral-500 ${isZachisleniya ? 'opacity-50' : ''}`}>+{formatAmount(amount)} <span className=" text-neutral-500">{
              currency == 'USD' ? <BsCurrencyDollar /> : currency == 'RUB' ? <TbCurrencyRubel /> : currency == 'KZT' ? <PiCurrencyKztDuotone /> : 'UZS'}</span></span>
          </div>
          {/* Отгрузка */}
        </> : <div>
          <span className='flex items-center justify-end gap-0.5'>{type == 'Поступление' ? '+' : type == 'Выплата' ? '-' : ''}{formatAmount(amount)} {tab != "Перемещение" && <span className={styles.currency}>{
            currency == 'USD' ? <BsCurrencyDollar /> : currency == 'RUB' ? <TbCurrencyRubel /> : currency == 'KZT' ? <PiCurrencyKztDuotone /> : 'UZS'}</span>} {percent ? `(${percent?.toFixed(0)}%)` : ''}</span>
        </div>}
      </div>

    </div>
  )
})

export default PriceStatus
'use client'

import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import BalanceFilterSidebar from '@/components/reports/balance/FilterSidebar'
import { balanceStore } from '@/components/reports/balance/balance.store'
import styles from './balance.module.scss'
import { ExpendOpen, ExpendClose } from '@/constants/icons'
import { toJS } from 'mobx'
import SingleSelect from '../../../../components/shared/Selects/SingleSelect'
import { GlobalCurrency } from '../../../../constants/globalCurrency'
import ScreenLoader from '../../../../components/shared/ScreenLoader'
import { formatNumber, formatTotalSumma } from '../../../../utils/helpers'
import { useUcodeRequestQuery } from '../../../../hooks/useDashboard'
import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import { apiClient } from '../../../../lib/api/ucode/base'

export default observer(function BalancePage() {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  const { error } = balanceStore

  const currencies = toJS(balanceStore.balanceData.currencies)?.map(item => ({
    value: item.code,
    label: item.code
  }))

  const filterData = {
    as_of: balanceStore.selectedDate ? moment(balanceStore.selectedDate).format('YYYY-MM-DD') : '',
    account_ids: balanceStore.selectedAccount ? [balanceStore.selectedAccount] : [],
    legal_entity_id: balanceStore.selectedEntity,
    user_currency_code: balanceStore.selectedCurrency,
    contr_agent_ids: balanceStore.selectedCounterparties,
  }

  const { data, isLoading } = useQuery({
    queryKey: ["balance_report", filterData],
    queryFn: () => apiClient.invokeFunction({ method: "balance_report", data: filterData }),
    select: (res) => res?.data?.data
  })

  // Auto-expand first two levels on initial data load
  useEffect(() => {
    if (!isInitialLoad || !data) return
    const hasData =
      (data.assets && data.assets.length > 0) ||
      (data.liabilities && data.liabilities.length > 0) ||
      (data.equity && data.equity.length > 0)

    if (!hasData) return

    const firstLevelIds = new Set()
    const addFirstLevel = (items) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          firstLevelIds.add(item.id)
          item.children.forEach(child => {
            if (child.children && child.children.length > 0) {
              firstLevelIds.add(child.id)
            }
          })
        }
      })
    }

    addFirstLevel(data.assets || [])
    addFirstLevel(data.liabilities || [])
    addFirstLevel(data.equity || [])

    setExpandedRows(firstLevelIds)
    setIsInitialLoad(false)
  }, [data, isInitialLoad])

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const renderRow = (item, level = 0, parentExpanded = true) => {
    if (!parentExpanded) return null

    const children = item.children || item.details
    const hasChildren = children && children.length > 0
    const isExpanded = expandedRows.has(item.id)
    const indent = level * 24
    const isTotalRow = level === 0

    return (
      <React.Fragment key={item.id}>
        <tr className={`${styles.tr} ${isTotalRow ? styles.totalRow : ''}`}>
          <td className={styles.td} style={{ paddingLeft: `${indent + 16}px`, backgroundColor: '#fff' }}>
            <div
              className={`${styles.cellContent} ${hasChildren ? styles.clickable : ''}`}
              onClick={() => hasChildren && toggleRow(item.id)}
            >
              {hasChildren && (
                <button className={styles.expandButton}>
                  {isExpanded ? <ExpendClose /> : <ExpendOpen />}
                </button>
              )}
              <span className={isTotalRow ? styles.boldText : ''}>{item.name}</span>
            </div>
          </td>
          <td className={styles.td}>
            <span className={isTotalRow ? styles.boldNumber : ''}>
              {(item.value === 0 || item.value == null)
                ? '–'
                : formatNumber(formatTotalSumma(item.value))}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && children.map(child => renderRow(child, level + 1, true))}
      </React.Fragment>
    )
  }

  return (
    <div className="fixed left-[80px] w-[calc(100%-80px)] flex top-[60px] h-[calc(100%-60px)]">
      {/* Balance-specific Filter Sidebar */}
      <BalanceFilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {isLoading && <ScreenLoader />}
      {/* Main Content */}
      <div className={"w-full relative bg-white overflow-auto pb-10"}>
        <div className="flex px-4 h-16 items-center sticky top-0 z-20 bg-white justify-between">
          <div className="flex items-center gap-4">
            <h1 className='text-xl whitespace-nowrap font-semibold'>Балансовый отчет</h1>
            <SingleSelect
              data={currencies}
              value={balanceStore.selectedCurrency || GlobalCurrency.code}
              onChange={(value) => {
                balanceStore.setSelectedCurrency(value)
              }}
              isClearable={false}
              withSearch={false}
              className={'bg-white w-28'}
              dropdownClassName={'w-28'}
            />
          </div>

        </div>

        <div className="px-4 text-center mb-4 text-sm font-medium ">
          Активы = Обязательства + Капитал
        </div>

        {/* Table with loading overlay */}
        <div className='px-4'>
          {/* Spinner overlay on filter change (data already present) */}


          {error && !isLoading ? (
            <div className={styles.tableError}>
              <p>Ошибка загрузки данных: {error.message}</p>
              <button onClick={() => balanceStore.fetchBalance()} className={styles.retryButton}>
                Повторить
              </button>
            </div>
          ) : (
              <table className="w-full">
                <thead className=" bg-neutral-100 sticky top-16 z-10">
                  <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium">СЧЕТ</th>
                  <th className="text-right px-4 py-2 text-xs font-medium">Итого</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                  {data?.assets?.map(row => renderRow(row))}
                  {data?.liabilities?.map(row => renderRow(row))}
                  {data?.equity?.map(row => renderRow(row))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
})

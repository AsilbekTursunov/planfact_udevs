'use client'

import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import BalanceFilterSidebar from '@/components/reports/balance/FilterSidebar'
import { balanceStore } from '@/components/reports/balance/balance.store'
import styles from './balance.module.scss'
import { ExpendOpen, ExpendClose } from '@/constants/icons'

export default observer(function BalancePage() {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  const { balanceData, isLoading, error } = balanceStore

  // Currency options
  const currencyOptions = [
    { guid: 'RUB', label: 'RUB' },
    { guid: 'USD', label: 'USD' },
    { guid: 'EUR', label: 'EUR' }
  ]

  // Auto-expand first two levels on initial data load
  useEffect(() => {
    if (!isInitialLoad) return
    const hasData =
      balanceData.assets.length > 0 ||
      balanceData.liabilities.length > 0 ||
      balanceData.equity.length > 0

    if (!hasData) return

    const firstLevelIds = new Set()
    const addFirstLevel = (items) => {
      items.forEach(item => {
        if (item.details && item.details.length > 0) {
          firstLevelIds.add(item.id)
          item.details.forEach(child => {
            if (child.details && child.details.length > 0) {
              firstLevelIds.add(child.id)
            }
          })
        }
      })
    }

    addFirstLevel(balanceData.assets)
    addFirstLevel(balanceData.liabilities)
    addFirstLevel(balanceData.equity)

    setExpandedRows(firstLevelIds)
    setIsInitialLoad(false)
  }, [balanceData, isInitialLoad])

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const renderRow = (item, parentExpanded = true) => {
    if (!parentExpanded) return null

    const hasChildren = item.details && item.details.length > 0
    const isExpanded = expandedRows.has(item.id)
    const indent = item.level * 24
    const isTotalRow = item.level === 0

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
              {(item.totalValue === 0 || item.totalValue == null)
                ? '–'
                : Number(item.totalValue).toLocaleString('ru-RU')}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && item.details.map(child => renderRow(child, true))}
      </React.Fragment>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Balance-specific Filter Sidebar */}
        <BalanceFilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {/* Filter Toggle Bar (shown when sidebar is closed) */}
        {!isFilterOpen && (
          <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
            <button className={styles.filterToggleBarButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className={`${styles.mainContent} ${isFilterOpen ? styles.mainContentWithFilter : ''}`}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>Балансовый отчет</h1>
              </div>
              <div className={styles.headerRight}>
                <GroupedSelect
                  data={currencyOptions}
                  value={balanceStore.selectedCurrency}
                  onChange={(value) => {
                    balanceStore.setSelectedCurrency(value)
                    balanceStore.fetchBalance()
                  }}
                  placeholder="Валюта"
                  className={styles.currencySelect}
                />
                <button className={styles.moreButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1" fill="currentColor" />
                    <circle cx="8" cy="8" r="1" fill="currentColor" />
                    <circle cx="8" cy="13" r="1" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.balanceEquation}>
            Активы = Обязательства + Капитал
          </div>

          {/* Table with loading overlay */}
          <div className={styles.tableContainer} style={{ position: 'relative' }}>
            {/* Spinner overlay on filter change (data already present) */}
            {isLoading && (
              <div className={styles.tableOverlay}>
                <div className={styles.spinner} />
              </div>
            )}

            {error && !isLoading ? (
              <div className={styles.tableError}>
                <p>Ошибка загрузки данных: {error.message}</p>
                <button onClick={() => balanceStore.fetchBalance()} className={styles.retryButton}>
                  Повторить
                </button>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.th}>СЧЕТ</th>
                    <th className={styles.th}>Итого</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {balanceData.assets.map(row => renderRow(row))}
                  {balanceData.liabilities.map(row => renderRow(row))}
                  {balanceData.equity.map(row => renderRow(row))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

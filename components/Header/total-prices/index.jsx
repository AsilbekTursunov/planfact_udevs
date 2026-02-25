"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, MoreVertical, Maximize2 } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import styles from '../Header.module.scss'
import { formatDateTime } from '../../../utils/formatDate'
import { useMyAccountsBoard } from '../../../hooks/useDashboard'
import Select from '@/components/common/Select'

const TotalPrice = () => {
    const [isBalanceOpen, setIsBalanceOpen] = useState(false)

    const [expandedGroups, setExpandedGroups] = useState(['unallocated'])
    const [activeGroupMenu, setActiveGroupMenu] = useState(null)
    const [modalMode, setModalMode] = useState('full')
    const today = formatDateTime(new Date())

    const balanceRef = useRef(null)
    const groupMenuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (balanceRef.current && !balanceRef.current.contains(event.target)) {
                setIsBalanceOpen(false)
                setActiveGroupMenu(null)
            }
            if (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) {
                setActiveGroupMenu(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (isBalanceOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        // Cleanup on unmount too
        return () => { document.body.style.overflow = 'auto' }
    }, [isBalanceOpen])

    const accountFilterData = useMemo(() => {
        return {
            viewMode: "legal_entities",
            includeEmptyGroups: true,
            includeUngrouped: true
        }
    }, [])

    const { data: accountsData } = useMyAccountsBoard(accountFilterData)

    const legalEntitiesData = useMemo(() => {
        return (accountsData?.data?.data?.data?.legal_entities || [])?.map((item) => {
            return {
                id: item.legal_entity_id,
                name: item.legal_entity_name,
                balance: item.childs?.reduce((acc, curr) => acc + curr.balance, 0),
                total_items: item.childs?.length,
                accounts: (item.childs || [])?.map((child) => {
                    return {
                        id: child?.id,
                        name: child?.my_accounts_name,
                        balance: child?.balance,
                        currency: child?.currenies_kod,
                        color: child?.balance > 0 ? 'green' : 'red'
                    }
                })
            }
        })
    }, [accountsData])

    const totalBalance = useMemo(() => {
        return legalEntitiesData?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
    }, [legalEntitiesData]);

    const allAccounts = useMemo(() => {
        return legalEntitiesData?.flatMap(group => group.accounts || []) || [];
    }, [legalEntitiesData]);

    const viewOptions = [
        { value: 'compact', label: 'Компактный' },
        { value: 'full', label: 'Полный' }
    ];



    const toggleExpandGroup = (id) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
        setActiveGroupMenu(null)
    }




    return (
        <div className={styles.balanceSection} ref={balanceRef}>
            <div
                onClick={() => {
                    setIsBalanceOpen(!isBalanceOpen)
                }}
                className={styles.balanceTrigger}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={styles.balanceDot}></div>
                        <span className={styles.balanceText}>На счетах {totalBalance.toLocaleString('ru-RU')} <span className={styles.balanceCurrency}>₽</span></span>
                        <ChevronDown size={14} className={cn(styles.balanceChevron, isBalanceOpen && styles.open)} />
                    </div>
                    <div className={styles.balanceSubtext} style={{ marginLeft: '17px', color: '#fbbf24' }}>
                        {today}
                    </div>
                </div>
            </div>

            {/* Balance Modal */}
            {isBalanceOpen && (
                <div className={cn(styles.balanceModal, modalMode === 'full' ? styles.full : styles.compact)}>
                    <div className={styles.balanceModalFull}>
                        {/* Modal Header */}
                        <div className={styles.balanceModalFullHeader}>
                            <div className={styles.balanceModalFullTitleContainer}>
                                <div className={styles.balanceModalFullTitle}>
                                    <div className={styles.balanceModalFullTitleDot} />
                                    <div className={styles.balanceModalFullTitleContent}>
                                        <h2 className={styles.balanceModalFullTitleValue}>{totalBalance.toLocaleString('ru-RU')} ₽</h2>
                                        <p className={styles.balanceModalFullTitleDate}>{today}</p>
                                    </div>
                                </div>

                            </div>

                            <div className={styles.balanceModalFullControls}>
                                <div style={{ minWidth: '150px' }}>
                                    <Select
                                        options={viewOptions}
                                        value={viewOptions.find(opt => opt.value === modalMode)}
                                        onChange={(selected) => setModalMode(selected.value)}
                                        isSearchable={false}
                                    />
                                </div>
                                {modalMode === 'full' && (
                                    <button
                                        onClick={() => setExpandedGroups(expandedGroups.length ? [] : legalEntitiesData?.map(g => g.id))}
                                        className={styles.expandButton}
                                        style={{ color: '#0ea5e9', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                                    >
                                        {expandedGroups.length === 0 ? 'Развернуть группы' : 'Свернуть группы'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.balanceModalContent}>
                            {modalMode === 'compact' ? (
                                <div className={styles.balanceGroupContent}>
                                    {allAccounts?.map((acc, idx) => (
                                        <div key={idx} className={styles.balanceAccount}>
                                            <div className={styles.balanceAccountLeft}>
                                                <div className={cn(styles.balanceAccountDot, acc?.color === 'red' && styles.red, acc?.color === 'green' && styles.green, acc?.color === 'blue' && styles.blue)} style={{ marginTop: '6px' }}></div>
                                                <div className={styles.balanceAccountInfo} style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className={styles.balanceAccountName} style={{ fontSize: '14px', color: '#334155' }}>{acc?.name}</span>
                                                    {acc?.status && (
                                                        <span className={styles.balanceAccountStatus} style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>{acc?.status}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {acc?.balance && (
                                                <span className={styles.balanceAccountValue} style={{ fontSize: '14px', color: '#334155' }}>
                                                    {acc?.balance} <span className={styles.balanceAccountCurrency} style={{ color: '#94a3b8' }}>{acc?.currency?.toLocaleString('ru-RU')}</span>
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                    <div className={styles.balanceGrid}>
                                        {legalEntitiesData?.map((group) => (
                                            <div key={group.id} className={styles.balanceGroup}>
                                                <div className={styles.balanceGroupHeader}>
                                                    <div className={styles.balanceGroupHeaderInner}>
                                                        <span className={styles.balanceGroupName}>{group?.name} ({group?.total_items})</span>
                                                        <div className={styles.balanceGroupValue}>
                                                            <span className={styles.balanceGroupValueText}>{group?.balance?.toLocaleString('ru-RU')} <span className={styles.balanceGroupValueCurrency}>₽</span></span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveGroupMenu(activeGroupMenu === group.id ? null : group.id);
                                                                }}
                                                                className={styles.balanceGroupMenuButton}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                                                            >
                                                                <MoreVertical size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Group Actions Dropdown */}
                                                    {activeGroupMenu === group.id && (
                                                        <div ref={groupMenuRef} className={styles.balanceGroupMenu}>
                                                            <button
                                                                onClick={() => toggleExpandGroup(group.id)}
                                                                className={styles.balanceGroupMenuItem}
                                                            >
                                                                <Maximize2 size={16} className={styles.balanceGroupMenuIcon} />
                                                                <span>{expandedGroups.includes(group.id) ? 'Свернуть' : 'Развернуть'}</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expanded Content or Placeholder */}
                                                {expandedGroups?.includes(group.id) && group?.accounts?.length > 0 && (
                                                    <div className={styles.balanceGroupContent}>
                                                        {group?.accounts?.map((acc, idx) => (
                                                            <div key={idx} className={styles.balanceAccount}>
                                                                <div className={styles.balanceAccountLeft} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                                    <div className={cn(styles.balanceAccountDot, acc?.color === 'red' && styles.red, acc?.color === 'green' && styles.green, acc?.color === 'blue' && styles.blue)} style={{ marginTop: '6px' }}></div>
                                                                    <div className={styles.balanceAccountInfo} style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span className={styles.balanceAccountName} style={{ fontSize: '14px', color: '#334155' }}>{acc?.name}</span>
                                                                        {acc?.status && (
                                                                            <span className={styles.balanceAccountStatus} style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>{acc?.status}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {acc?.balance && (
                                                                    <span className={styles.balanceAccountValue} style={{ fontSize: '14px', color: '#334155' }}>
                                                                        {acc?.balance} <span className={styles.balanceAccountCurrency} style={{ color: '#94a3b8' }}>{acc?.currency}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {group?.total_items === 0 && (
                                                    <div className={styles.balanceGroupEmpty} style={{ padding: '24px', textAlign: 'center' }}>
                                                        <span className={styles.balanceGroupEmptyText} style={{ color: '#94a3b8', fontSize: '14px' }}>Переместите счета в эту группу</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TotalPrice

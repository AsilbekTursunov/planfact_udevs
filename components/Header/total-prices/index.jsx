"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, MoreVertical, Maximize2 } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import styles from '../Header.module.scss'
import { formatDateTime } from '../../../utils/formatDate'

const TotalPrice = () => {
    const [isBalanceOpen, setIsBalanceOpen] = useState(false)

    const [expandedGroups, setExpandedGroups] = useState(['unallocated'])
    const [activeGroupMenu, setActiveGroupMenu] = useState(null)
    const [modalMode, setModalMode] = useState('full')
    const [isViewOpen, setIsViewOpen] = useState(false)
    const today = formatDateTime(new Date())

    const balanceRef = useRef(null)
    const groupMenuRef = useRef(null)
    const viewRef = useRef(null)
    const viewButtonRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (balanceRef.current && !balanceRef.current.contains(event.target)) {
                setIsBalanceOpen(false)
                setActiveGroupMenu(null)
            }
            if (groupMenuRef.current && !groupMenuRef.current.contains(event.target)) {
                setActiveGroupMenu(null)
            }
            if (viewRef.current && !viewRef.current.contains(event.target)) {
                setIsViewOpen(false)
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

    const toggleExpandGroup = (id) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
        setActiveGroupMenu(null)
    }

    const groupsData = [
        {
            id: 'unallocated',
            name: 'Нераспределенные (4)',
            balance: '8 998 887',
            accounts: [
                { name: 'hello', balance: '9 001 455', color: 'green', currency: '₽' },
                { name: 'UACDEMY', balance: '0', color: 'green', currency: '$' },
                { name: 'UDEVS', balance: '0', color: 'green', currency: '₽' },
                { name: 'bb', balance: '-2 568', status: 'Разрыв с 12.02.26', color: 'red', currency: '₽' }
            ]
        },
        { id: 'deposits', name: 'Депозиты (0)', balance: '0', accounts: [] },
        { id: 'new', name: 'Новая группа (0)', balance: '0', accounts: [] },
        { id: 'wertryt', name: 'wertryt (0)', balance: '0', accounts: [] }
    ]

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
                        <span className={styles.balanceText}>На счетах 8 998 887 <span className={styles.balanceCurrency}>₽</span></span>
                        <ChevronDown size={14} className={cn(styles.balanceChevron, isBalanceOpen && styles.open)} />
                    </div>
                    <div className={styles.balanceSubtext} style={{ marginLeft: '17px', color: '#fbbf24' }}>
                        Разрыв с 12.02.26
                    </div>
                </div>
            </div>

            {/* Balance Modal */}
            {isBalanceOpen && (
                <div className={cn(styles.balanceModal, modalMode === 'full' ? styles.full : styles.compact)}>
                    <div className={styles.balanceModalFull}>
                        {/* Modal Header */}
                        <div className={styles.balanceModalFullHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className={styles.balanceModalFullTitle}>
                                        <div className={styles.balanceModalFullTitleDot}></div>
                                        <h2 className={styles.balanceModalFullTitleValue}>8 998 887 ₽</h2>
                                    </div>
                                    <p className={styles.balanceModalFullTitleDate}>25 Февраля 2026 | 07:58</p>
                                </div>
                            </div>

                            <div className={styles.balanceModalFullControls}>

                                <div className={styles.viewDropdown} ref={viewRef}>
                                    <button
                                        ref={viewButtonRef}
                                        onClick={() => setIsViewOpen(!isViewOpen)}
                                        className={styles.viewButton}
                                    >
                                        <span>Вид</span>
                                        <ChevronDown size={14} className={cn(styles.viewButtonIcon, isViewOpen && styles.open)} />
                                    </button>

                                    {isViewOpen && (
                                        <div className={styles.viewDropdownMenu}>
                                            <div className={styles.viewDropdownSection}>
                                                <span className={styles.viewDropdownSectionTitle}>Режим окна</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setModalMode('compact')
                                                    setIsViewOpen(false)
                                                }}
                                                className={cn(styles.viewDropdownItem, modalMode === 'compact' ? styles.active : styles.inactive)}
                                            >
                                                <span>Компактный</span>
                                                {modalMode === 'compact' && <span className={styles.viewDropdownCheck}>✓</span>}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setModalMode('full')
                                                    setIsViewOpen(false)
                                                }}
                                                className={cn(styles.viewDropdownItem, modalMode === 'full' ? styles.active : styles.inactive)}
                                            >
                                                <span>Полный</span>
                                                {modalMode === 'full' && <span className={styles.viewDropdownCheck}>✓</span>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setExpandedGroups(expandedGroups.length ? [] : groupsData.map(g => g.id))}
                                    className={styles.expandButton}
                                    style={{ color: '#0ea5e9', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    {expandedGroups.length === 0 ? 'Развернуть группы' : 'Свернуть группы'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.balanceGrid}>
                                {groupsData.map((group) => (
                                    <div key={group.id} className={styles.balanceGroup}>
                                        <div className={styles.balanceGroupHeader}>
                                            <div className={styles.balanceGroupHeaderInner}>
                                                <span className={styles.balanceGroupName}>{group.name}</span>
                                                <div className={styles.balanceGroupValue}>
                                                    <span className={styles.balanceGroupValueText}>{group.balance} <span className={styles.balanceGroupValueCurrency}>₽</span></span>
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
                                        {expandedGroups.includes(group.id) ? (
                                            group.accounts.length > 0 ? (
                                                <div className={styles.balanceGroupContent} style={{ padding: '8px 0' }}>
                                                    {group.accounts.map((acc, idx) => (
                                                        <div key={idx} className={styles.balanceAccount} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', alignItems: 'flex-start' }}>
                                                            <div className={styles.balanceAccountLeft} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                                <div className={cn(styles.balanceAccountDot, acc.color === 'red' && styles.red, acc.color === 'green' && styles.green, acc.color === 'blue' && styles.blue)} style={{ marginTop: '6px' }}></div>
                                                                <div className={styles.balanceAccountInfo} style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span className={styles.balanceAccountName} style={{ fontSize: '14px', color: '#334155' }}>{acc.name}</span>
                                                                    {acc.status && (
                                                                        <span className={styles.balanceAccountStatus} style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>{acc.status}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {acc.balance && (
                                                                <span className={styles.balanceAccountValue} style={{ fontSize: '14px', color: '#334155' }}>
                                                                    {acc.balance} <span className={styles.balanceAccountCurrency} style={{ color: '#94a3b8' }}>{acc.currency}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className={styles.balanceGroupEmpty} style={{ padding: '24px', textAlign: 'center' }}>
                                                    <span className={styles.balanceGroupEmptyText} style={{ color: '#94a3b8', fontSize: '14px' }}>Переместите счета в эту группу</span>
                                                </div>
                                            )
                                        ) : (
                                            <div className={styles.balanceGroupEmpty} style={{ padding: '24px', textAlign: 'center' }}>
                                                <span className={styles.balanceGroupEmptyText} style={{ color: '#94a3b8', fontSize: '14px' }}>Переместите счета в эту группу</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TotalPrice

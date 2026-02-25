"use client"

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MoreVertical, Maximize2, User, LogOut } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useFinanceSummary } from '@/hooks/useDashboard'
import styles from './Header.module.scss'
import TotalPrice from './total-prices'

export function Header() {
    const [isBalanceOpen, setIsBalanceOpen] = useState(false)
    const [balanceView, setBalanceView] = useState('groups')
    const [expandedEntities, setExpandedEntities] = useState([])
    const [expandedGroups, setExpandedGroups] = useState(['unallocated'])
    const [activeEntityMenu, setActiveEntityMenu] = useState(null)
    const [activeGroupMenu, setActiveGroupMenu] = useState(null)
    const [modalMode, setModalMode] = useState('full')
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    // Fetch finance summary
    const { data: financeSummaryData } = useFinanceSummary({ data: {} })
    const financeResult = financeSummaryData?.data?.result || 0
    
    // Format number with spaces
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    const balanceRef = useRef(null)
    const entityMenuRef = useRef(null)
    const groupMenuRef = useRef(null)
    const viewRef = useRef(null)
    const viewButtonRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (balanceRef.current && !balanceRef.current.contains(event.target)) {
                setIsBalanceOpen(false)
                setActiveEntityMenu(null)
                setActiveGroupMenu(null)
            }
            if (entityMenuRef.current && !entityMenuRef.current.contains(event.target)) {
                setActiveEntityMenu(null)
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
    }, [isBalanceOpen])


    const toggleExpandEntity = (id) => {
        setExpandedEntities(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
        setActiveEntityMenu(null)
    }

    const toggleExpandGroup = (id) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
        setActiveGroupMenu(null)
    }

    return (
        <>
            {/* Backdrop Dimming Effect */}
            {/* {isBalanceOpen && (
                <div className={styles.backdrop} />
            )} */}

            <header className={styles.header}>
                {/* Center section: Balance */}
                <div className={styles.centerSection}>
                    {false && <div className={styles.balanceSection} ref={balanceRef}>
                        <div
                            onClick={() => {
                                setIsBalanceOpen(!isBalanceOpen)
                            }}
                            className={styles.balanceTrigger}
                        >
                            <div className={styles.balanceDot}></div>
                            <span className={styles.balanceText}>Начислено {formatNumber(financeResult)} <span className={styles.balanceCurrency}>₽</span></span>
                            <ChevronDown size={14} className={cn(styles.balanceChevron, isBalanceOpen && styles.open)} />
                        </div>
                        <p className={styles.balanceSubtext}>Финансовая сводка</p>

                        {/* Balance Modal */}
                        {isBalanceOpen && (
                            <div className={cn(styles.balanceModal, modalMode === 'full' ? styles.full : styles.compact)}>
                                {/* Modal Mode: Compact or Full */}
                                {modalMode === 'compact' ? (
                                    <div className={styles.balanceModalCompact}>
                                        <div className={styles.balanceModalCompactHeader}>
                                            <div className={styles.balanceModalCompactTop}>
                                                <div className={styles.balanceModalCompactTitle}>
                                                    <div className={styles.balanceModalCompactDot}></div>
                                                    <h2 className={styles.balanceModalCompactValue}>2 975 071 ₽</h2>
                                                </div>
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
                                            </div>
                                            <p className={styles.balanceModalCompactDate}>13 Января 2026 | 12:46</p>
                                        </div>

                                        <div className={styles.balanceModalCompactContent}>
                                            {balanceView === 'accounts' && [
                                                { name: 'Альфа банк', balance: '930 894', status: 'Разрыв с 09.03.26', color: 'red' },
                                                { name: 'Карта физ. лица', balance: '110 000', color: 'green' },
                                                { name: 'Наличка', balance: '1 397 082', color: 'green' },
                                                { name: 'Сбер', balance: '450 067', status: 'Разрыв с 23.02.26', color: 'red' },
                                                { name: 'Сейф', balance: '-178 226', status: 'Разрыв с 21.08.25 по 19.01.26', color: 'red' },
                                                { name: 'Т-Банк', balance: '265 254', status: 'Разрыв с 15.02.26 по 16.02.26', color: 'red' }
                                            ].map((acc, idx) => (
                                                <div key={idx} className={styles.balanceItem}>
                                                    <div className={styles.balanceItemLeft}>
                                                        <div className={cn(styles.balanceItemDot, acc.color === 'red' && styles.red, acc.color === 'green' && styles.green, acc.color === 'blue' && styles.blue)}></div>
                                                        <div className={styles.balanceItemInfo}>
                                                            <span className={styles.balanceItemName}>{acc.name}</span>
                                                            {acc.status && (
                                                                <span className={styles.balanceItemStatus}>{acc.status}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={styles.balanceItemValue}>
                                                        {acc.balance} <span className={styles.balanceItemCurrency}>₽</span>
                                                    </span>
                                                </div>
                                            ))}

                                            {balanceView === 'groups' && [
                                                { name: 'Основные счета', balance: '2 100 000', color: 'blue' },
                                                { name: 'Резервные счета', balance: '875 071', color: 'green' },
                                                { name: 'Проблемные счета', balance: '-178 226', status: 'Требует внимания', color: 'red' }
                                            ].map((group, idx) => (
                                                <div key={idx} className={styles.balanceItem}>
                                                    <div className={styles.balanceItemLeft}>
                                                        <div className={cn(styles.balanceItemDot, group.color === 'red' && styles.red, group.color === 'green' && styles.green, group.color === 'blue' && styles.blue)}></div>
                                                        <div className={styles.balanceItemInfo}>
                                                            <span className={styles.balanceItemName}>{group.name}</span>
                                                            {group.status && (
                                                                <span className={styles.balanceItemStatus}>{group.status}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={styles.balanceItemValue}>
                                                        {group.balance} <span className={styles.balanceItemCurrency}>₽</span>
                                                    </span>
                                                </div>
                                            ))}

                                            {balanceView === 'entities' && [
                                                { name: 'ООО "Прометей"', balance: '2 112 403', color: 'blue' },
                                                { name: 'ИП Алексеенко М.Ф.', balance: '862 668', color: 'green' }
                                            ].map((entity, idx) => (
                                                <div key={idx} className={styles.balanceItem}>
                                                    <div className={styles.balanceItemLeft}>
                                                        <div className={cn(styles.balanceItemDot, entity.color === 'red' && styles.red, entity.color === 'green' && styles.green, entity.color === 'blue' && styles.blue)}></div>
                                                        <div className={styles.balanceItemInfo}>
                                                            <span className={styles.balanceItemName}>{entity.name}</span>
                                                        </div>
                                                    </div>
                                                    <span className={styles.balanceItemValue}>
                                                        {entity.balance} <span className={styles.balanceItemCurrency}>₽</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.balanceModalFull}>
                                        {/* Modal Header */}
                                        <div className={styles.balanceModalFullHeader}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div className={styles.balanceModalFullTitle}>
                                                        <div className={styles.balanceModalFullTitleDot}></div>
                                                        <h2 className={styles.balanceModalFullTitleValue}>2 975 071 ₽</h2>
                                                    </div>
                                                    <p className={styles.balanceModalFullTitleDate}>13 Января 2026 | 12:25</p>
                                                </div>
                                            </div>

                                            <div className={styles.balanceModalFullControls}>
                                                <div className={styles.balanceViewToggle}>
                                                    <button
                                                        onClick={() => setBalanceView('groups')}
                                                        className={cn(styles.balanceViewButton, balanceView === 'groups' ? styles.active : styles.inactive)}
                                                    >
                                                        По группам
                                                    </button>
                                                    <button
                                                        onClick={() => setBalanceView('entities')}
                                                        className={cn(styles.balanceViewButton, balanceView === 'entities' ? styles.active : styles.inactive)}
                                                    >
                                                        По юрлицам
                                                    </button>
                                                </div>
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
                                                            
                                                            <div className={styles.viewDropdownSection}>
                                                                <span className={styles.viewDropdownSectionTitle}>Группировка</span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setBalanceView('accounts')
                                                                    setIsViewOpen(false)
                                                                }}
                                                                className={cn(styles.viewDropdownItem, balanceView === 'accounts' ? styles.active : styles.inactive)}
                                                            >
                                                                <span>По счетам</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setBalanceView('groups')
                                                                    setIsViewOpen(false)
                                                                }}
                                                                className={cn(styles.viewDropdownItem, balanceView === 'groups' ? styles.active : styles.inactive)}
                                                            >
                                                                <span>По группам</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setBalanceView('entities')
                                                                    setIsViewOpen(false)
                                                                }}
                                                                className={cn(styles.viewDropdownItem, balanceView === 'entities' ? styles.active : styles.inactive)}
                                                            >
                                                                <span>По юр. лицам</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setExpandedGroups(expandedGroups.length ? [] : ['unallocated'])}
                                                    className={styles.expandButton}
                                                >
                                                    {expandedGroups.length === 0 ? 'Развернуть группы' : 'Свернуть группы'}
                                                </button>
                                            </div>
                                        </div>

                                        {balanceView === 'groups' && (
                                            <div className={styles.balanceGrid}>
                                                {[
                                                    {
                                                        id: 'unallocated',
                                                        name: 'Нераспределенные (6)',
                                                        balance: '2 975 071',
                                                        accounts: [
                                                            { name: 'Наличка', color: 'green' },
                                                            { name: 'Альфа банк', balance: '930 894', status: 'Разрыв с 09.03.26', color: 'red' },
                                                            { name: 'Сбер', balance: '450 067', status: 'Разрыв с 23.02.26', color: 'red' },
                                                            { name: 'Т-Банк', balance: '265 254', status: 'Разрыв с 15.02.26 по 16.02.26', color: 'red' },
                                                            { name: 'Карта физ. лица', balance: '110 000', color: 'green' },
                                                            { name: 'Сейф', balance: '-178 226', status: 'Разрыв с 21.08.25 по 19.01.26', color: 'red' }
                                                        ]
                                                    },
                                                    { id: 'deposits', name: 'Депозиты (0)', balance: '0', accounts: [] },
                                                    { id: 'new', name: 'Новая группа (0)', balance: '0', accounts: [] }
                                                ].map((group) => (
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
                                                                    >
                                                                        <MoreVertical size={16} className={styles.balanceGroupMenuIcon} />
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
                                                                <div className={styles.balanceGroupContent}>
                                                                    {group.accounts.map((acc, idx) => (
                                                                        <div key={idx} className={styles.balanceAccount}>
                                                                            <div className={styles.balanceAccountLeft}>
                                                                                <div className={cn(styles.balanceAccountDot, acc.color === 'red' && styles.red, acc.color === 'green' && styles.green, acc.color === 'blue' && styles.blue)}></div>
                                                                                <div className={styles.balanceAccountInfo}>
                                                                                    <span className={styles.balanceAccountName}>{acc.name}</span>
                                                                                    {acc.status && (
                                                                                        <span className={styles.balanceAccountStatus}>{acc.status}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {acc.balance && (
                                                                                <span className={styles.balanceAccountValue}>
                                                                                    {acc.balance} <span className={styles.balanceAccountCurrency}>₽</span>
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className={styles.balanceGroupEmpty}>
                                                                    <span className={styles.balanceGroupEmptyText}>Переместите счета в эту группу</span>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className={styles.balanceGroupEmpty}>
                                                                <span className={styles.balanceGroupEmptyText}>Переместите счета в эту группу</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Modal Content - Legal Entities View */}
                                        {balanceView === 'entities' && (
                                            <div className={styles.balanceGrid}>
                                                {[
                                                    { id: 'prometey', name: 'ООО "Прометей" (3)', balance: '2 112 403', accounts: [] },
                                                    {
                                                        id: 'alekseenko',
                                                        name: 'ИП Алексеенко Михаил Федоро...',
                                                        balance: '862 668',
                                                        accounts: [
                                                            { name: 'Альфа банк', balance: '930 894', status: 'Разрыв с 09.03.26', color: 'red' },
                                                            { name: 'Карта физ. лица', balance: '110 000', color: 'green' },
                                                            { name: 'Сейф', balance: '-178 226', status: 'Разрыв с 21.08.25 по 19.01.26', color: 'red' }
                                                        ]
                                                    }
                                                ].map((entity) => (
                                                    <div key={entity.id} className={styles.balanceGroup}>
                                                        <div className={styles.balanceGroupHeader}>
                                                            <div className={styles.balanceGroupHeaderInner}>
                                                                <span className={styles.balanceGroupName} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }} title={entity.name}>{entity.name}</span>
                                                                <div className={styles.balanceGroupValue} style={{ flexShrink: 0 }}>
                                                                    <span className={styles.balanceGroupValueText}>{entity.balance} <span className={styles.balanceGroupValueCurrency}>₽</span></span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveEntityMenu(activeEntityMenu === entity.id ? null : entity.id);
                                                                        }}
                                                                        className={styles.balanceGroupMenuButton}
                                                                    >
                                                                        <MoreVertical size={16} className={styles.balanceGroupMenuIcon} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Entity Actions Dropdown */}
                                                            {activeEntityMenu === entity.id && (
                                                                <div ref={entityMenuRef} className={styles.balanceGroupMenu}>
                                                                    <button
                                                                        onClick={() => toggleExpandEntity(entity.id)}
                                                                        className={styles.balanceGroupMenuItem}
                                                                    >
                                                                        <Maximize2 size={16} className={styles.balanceGroupMenuIcon} />
                                                                        <span>Развернуть</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Expanded Accounts List */}
                                                        {expandedEntities.includes(entity.id) && entity.accounts.length > 0 && (
                                                            <div className={styles.balanceGroupContent}>
                                                                {entity.accounts.map((acc, idx) => (
                                                                    <div key={idx} className={styles.balanceAccount}>
                                                                        <div className={styles.balanceAccountLeft}>
                                                                            <div className={cn(styles.balanceAccountDot, acc.color === 'red' && styles.red, acc.color === 'green' && styles.green, acc.color === 'blue' && styles.blue)}></div>
                                                                            <div className={styles.balanceAccountInfo}>
                                                                                <span className={styles.balanceAccountName}>{acc.name}</span>
                                                                                {acc.status && (
                                                                                    <span className={styles.balanceAccountStatus}>{acc.status}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <span className={styles.balanceAccountValue}>
                                                                            {acc.balance} <span className={styles.balanceAccountCurrency}>₽</span>
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                )}
                            </div>
                        )}
                    </div>}
                </div>

                <TotalPrice />

                {/* Right side: User icon and Logout button */}
                <div className={styles.rightSection}>
                    <div className={styles.logoutSection}>
                        <button 
                            onClick={async () => {
                                setIsLoggingOut(true)
                                await new Promise(resolve => setTimeout(resolve, 500))
                                document.cookie = 'isAuthenticated=; path=/; max-age=0'
                                localStorage.removeItem('isAuthenticated')
                                localStorage.removeItem('userEmail')
                                localStorage.removeItem('authToken')
                                localStorage.removeItem('refreshToken')
                                localStorage.removeItem('userData')
                                window.location.href = '/pages/auth'
                            }}
                            disabled={isLoggingOut}
                            className={styles.logoutButton}
                            title={isLoggingOut ? 'Выход...' : 'Выйти'}
                        >
                            <LogOut size={18} className={styles.logoutIcon} />
                        </button>
                    </div>
                </div>
            </header>
        </>
    )
}

"use client"

import { useState, useRef, useEffect } from 'react'
import { Bell, ChevronDown, Video, Apple, Smartphone, Play, MoreVertical, Maximize2 } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import styles from './Header.module.scss'

export function Header() {
    const [isHelpOpen, setIsHelpOpen] = useState(false)
    const [isBalanceOpen, setIsBalanceOpen] = useState(false)
    const [balanceView, setBalanceView] = useState('groups')
    const [expandedEntities, setExpandedEntities] = useState([])
    const [expandedGroups, setExpandedGroups] = useState(['unallocated'])
    const [activeEntityMenu, setActiveEntityMenu] = useState(null)
    const [activeGroupMenu, setActiveGroupMenu] = useState(null)
    const [modalMode, setModalMode] = useState('full')
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isProfileClosing, setIsProfileClosing] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isEntitiesDropdownOpen, setIsEntitiesDropdownOpen] = useState(false)
    const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false)

    const helpRef = useRef(null)
    const balanceRef = useRef(null)
    const entityMenuRef = useRef(null)
    const groupMenuRef = useRef(null)
    const viewRef = useRef(null)
    const profileRef = useRef(null)
    const notificationsRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (helpRef.current && !helpRef.current.contains(event.target)) {
                setIsHelpOpen(false)
            }
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
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileClosing(true)
                setTimeout(() => {
                    setIsProfileOpen(false)
                    setIsProfileClosing(false)
                }, 200)
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
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
            {isBalanceOpen && (
                <div className={styles.backdrop} />
            )}

            <header className={styles.header}>
                {/* Left section: Help & Training Dropdown */}
                <div className={styles.leftSection} ref={helpRef}>
                    <button
                        onClick={() => {
                            setIsHelpOpen(!isHelpOpen)
                            setIsBalanceOpen(false)
                        }}
                        className={cn(styles.helpButton, isHelpOpen && styles.active)}
                    >
                        <span>Помощь и обучение</span>
                        <ChevronDown size={14} className={cn(styles.helpChevron, isHelpOpen && styles.open)} />
                    </button>

                    {/* Mega Menu Dropdown */}
                    {isHelpOpen && (
                        <div className={styles.megaMenu}>
                            <div className={styles.megaMenuSection}>
                                <h3 className={styles.megaMenuTitle}>Примеры бизнеса</h3>
                                <ul className={styles.megaMenuList}>
                                    {['Строительный бизнес', 'Продажи на Wildberries', 'Маркетинговое агентство', 'Оптово-розничная торговля', 'Тендерный бизнес', 'Медицинский центр'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className={styles.megaMenuLink}>{item}</a>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <button 
                                            onClick={() => setIsEntitiesDropdownOpen(!isEntitiesDropdownOpen)}
                                            className={styles.megaMenuButton}
                                        >
                                            <span className={styles.megaMenuButtonText}>Юрлица и счета</span>
                                            <ChevronDown size={14} className={cn(styles.megaMenuButtonIcon, isEntitiesDropdownOpen && styles.open)} />
                                        </button>
                                        
                                        {isEntitiesDropdownOpen && (
                                            <div className={styles.entitiesDropdown}>
                                                <div className={styles.entitiesDropdownHeader}>
                                                    <div className={styles.entitiesSearch}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Поиск по списку"
                                                            className={styles.entitiesSearchInput}
                                                        />
                                                        <div className={styles.entitiesSearchIcon}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="11" cy="11" r="8"></circle>
                                                                <path d="m21 21-4.35-4.35"></path>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className={styles.entitiesList}>
                                                    {[
                                                        'ИП Алексеенко Михаил Фе...',
                                                        'Сейф',
                                                        'Альфа банк',
                                                        'Карта физ. лица',
                                                        'ООО "Прометей"',
                                                        'Т-Банк'
                                                    ].map((item, idx) => (
                                                        <button 
                                                            key={idx}
                                                            className={styles.entityItem}
                                                        >
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <button 
                                            onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                                            className={styles.megaMenuButton}
                                        >
                                            <span className={styles.megaMenuButtonText}>Статьи учета</span>
                                            <ChevronDown size={14} className={cn(styles.megaMenuButtonIcon, isCategoriesDropdownOpen && styles.open)} />
                                        </button>
                                        
                                        {isCategoriesDropdownOpen && (
                                            <div className={styles.entitiesDropdown}>
                                                <div className={styles.entitiesDropdownHeader}>
                                                    <div className={styles.entitiesSearch}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Поиск по списку"
                                                            className={styles.entitiesSearchInput}
                                                        />
                                                        <div className={styles.entitiesSearchIcon}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="11" cy="11" r="8"></circle>
                                                                <path d="m21 21-4.35-4.35"></path>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className={styles.entitiesList}>
                                                    {[
                                                        'Доходы от продаж',
                                                        'Расходы на закупку',
                                                        'Зарплата',
                                                        'Аренда',
                                                        'Налоги',
                                                        'Прочие расходы'
                                                    ].map((item, idx) => (
                                                        <button 
                                                            key={idx}
                                                            className={styles.entityItem}
                                                        >
                                                            {item}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.megaMenuSection}>
                                <h3 className={styles.megaMenuTitle}>Демонстрация ПланФакта</h3>
                                <div className={styles.megaMenuDemo}>
                                    <div className={styles.megaMenuDemoIcon}>
                                        <Video size={20} fill="currentColor" />
                                    </div>
                                    <p className={styles.megaMenuDemoText}>
                                        Эксперт ПланФакта за 15 минут бесплатно покажет, как сервис будет полезен вашему бизнесу
                                    </p>
                                    <a href="#" className={styles.megaMenuDemoLink}>Записаться на демо</a>
                                </div>
                            </div>

                            <div className={styles.megaMenuSection}>
                                <h3 className={styles.megaMenuTitle}>Мобильное приложение</h3>
                                <div className={styles.megaMenuDemo}>
                                    <div className={styles.megaMenuApps}>
                                        <Apple size={24} className={styles.megaMenuAppIcon} />
                                        <Play size={24} className={cn(styles.megaMenuAppIcon, styles.megaMenuAppIconPlay)} />
                                        <Smartphone size={24} className={cn(styles.megaMenuAppIcon, styles.megaMenuAppIconSmartphone)} />
                                    </div>
                                    <p className={styles.megaMenuDemoText}>
                                        Управляйте бизнесом со смартфона с помощью приложения ПланФакт
                                    </p>
                                    <a href="#" className={styles.megaMenuDemoLink}>Скачать</a>
                                </div>
                            </div>

                            <div className={styles.megaMenuSection}>
                                <h3 className={styles.megaMenuTitle}>Полезные материалы</h3>
                                <ul className={styles.megaMenuList}>
                                    {['Справка и инструкции', 'Обучающие видео'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className={styles.megaMenuLink}>{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side containers */}
                <div className={styles.rightSection}>
                    {/* Balance Section */}
                    {/* <div className={styles.balanceSection} ref={balanceRef}>
                        <div
                            onClick={() => {
                                setIsBalanceOpen(!isBalanceOpen)
                                setIsHelpOpen(false)
//                             }}
//                             className={styles.balanceTrigger}
//                         >
//                             <div className={styles.balanceDot}></div>
//                             <span className={styles.balanceText}>На счетах 2 975 071 <span className={styles.balanceCurrency}>₽</span></span>
//                             <ChevronDown size={14} className={cn(styles.balanceChevron, isBalanceOpen && styles.open)} />
//                         </div>
//                         <p className={styles.balanceSubtext}>Разрыв с 21.08.25 по 19.01.26</p> */}
// 
//                         {/* Balance Modal */}
//                         {isBalanceOpen && (
//                             <div className={cn(styles.balanceModal, modalMode === 'full' ? styles.full : styles.compact)}>
//                                 {/* Modal Mode: Compact or Full */}
//                                 {modalMode === 'compact' ? (
//                                     <div className={styles.balanceModalCompact}>
//                                         <div className={styles.balanceModalCompactHeader}>
//                                             <div className={styles.balanceModalCompactTop}>
//                                                 <div className={styles.balanceModalCompactTitle}>
//                                                     <div className={styles.balanceModalCompactDot}></div>
//                                                     <h2 className={styles.balanceModalCompactValue}>2 975 071 ₽</h2>
//                                                 </div>
//                                                 <div className={styles.viewDropdown} ref={viewRef}>
//                                                     <button
//                                                         onClick={() => setIsViewOpen(!isViewOpen)}
//                                                         className={styles.viewButton}
//                                                     >
//                                                         <span>Вид</span>
//                                                         <ChevronDown size={14} className={cn(styles.viewButtonIcon, isViewOpen && styles.open)} />
//                                                     </button>
// 
//                                                     {isViewOpen && (
//                                                         <div className={styles.viewDropdownMenu}>
//                                                             <div className={styles.viewDropdownSection}>
//                                                                 <span className={styles.viewDropdownSectionTitle}>Режим окна</span>
//                                                             </div>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setModalMode('compact')
//                                                                     setIsViewOpen(false)
//                                                                 }}
//                                                                 className={cn(styles.viewDropdownItem, modalMode === 'compact' ? styles.active : styles.inactive)}
//                                                             >
//                                                                 <span>Компактный</span>
//                                                                 {modalMode === 'compact' && <span className={styles.viewDropdownCheck}>✓</span>}
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setModalMode('full')
//                                                                     setIsViewOpen(false)
//                                                                 }}
//                                                                 className={cn(styles.viewDropdownItem, modalMode === 'full' ? styles.active : styles.inactive)}
//                                                             >
//                                                                 <span>Полный</span>
//                                                                 {modalMode === 'full' && <span className={styles.viewDropdownCheck}>✓</span>}
//                                                             </button>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                             <p className={styles.balanceModalCompactDate}>13 Января 2026 | 12:46</p>
//                                         </div>
// 
//                                         <div className={styles.balanceModalCompactContent}>
//                                             {balanceView === 'accounts' && [
//                                                 { name: 'Альфа банк', balance: '930 894', status: 'Разрыв с 09.03.26', color: 'red' },
//                                                 { name: 'Карта физ. лица', balance: '110 000', color: 'green' },
//                                                 { name: 'Наличка', balance: '1 397 082', color: 'green' },
//                                                 { name: 'Сбер', balance: '450 067', status: 'Разрыв с 23.02.26', color: 'red' },
//                                                 { name: 'Сейф', balance: '-178 226', status: 'Разрыв с 21.08.25 по 19.01.26', color: 'red' },
//                                                 { name: 'Т-Банк', balance: '265 254', status: 'Разрыв с 15.02.26 по 16.02.26', color: 'red' }
//                                             ].map((acc, idx) => (
//                                                 <div key={idx} className={styles.balanceItem}>
//                                                     <div className={styles.balanceItemLeft}>
//                                                         <div className={cn(styles.balanceItemDot, acc.color === 'red' && styles.red, acc.color === 'green' && styles.green, acc.color === 'blue' && styles.blue)}></div>
//                                                         <div className={styles.balanceItemInfo}>
//                                                             <span className={styles.balanceItemName}>{acc.name}</span>
//                                                             {acc.status && (
//                                                                 <span className={styles.balanceItemStatus}>{acc.status}</span>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                     <span className={styles.balanceItemValue}>
//                                                         {acc.balance} <span className={styles.balanceItemCurrency}>₽</span>
//                                                     </span>
//                                                 </div>
//                                             ))}
// 
//                                             {balanceView === 'groups' && [
//                                                 { name: 'Основные счета', balance: '2 100 000', color: 'blue' },
//                                                 { name: 'Резервные счета', balance: '875 071', color: 'green' },
//                                                 { name: 'Проблемные счета', balance: '-178 226', status: 'Требует внимания', color: 'red' }
//                                             ].map((group, idx) => (
//                                                 <div key={idx} className={styles.balanceItem}>
//                                                     <div className={styles.balanceItemLeft}>
//                                                         <div className={cn(styles.balanceItemDot, group.color === 'red' && styles.red, group.color === 'green' && styles.green, group.color === 'blue' && styles.blue)}></div>
//                                                         <div className={styles.balanceItemInfo}>
//                                                             <span className={styles.balanceItemName}>{group.name}</span>
//                                                             {group.status && (
//                                                                 <span className={styles.balanceItemStatus}>{group.status}</span>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                     <span className={styles.balanceItemValue}>
//                                                         {group.balance} <span className={styles.balanceItemCurrency}>₽</span>
//                                                     </span>
//                                                 </div>
//                                             ))}
// 
//                                             {balanceView === 'entities' && [
//                                                 { name: 'ООО "Прометей"', balance: '2 112 403', color: 'blue' },
//                                                 { name: 'ИП Алексеенко М.Ф.', balance: '862 668', color: 'green' }
//                                             ].map((entity, idx) => (
//                                                 <div key={idx} className={styles.balanceItem}>
//                                                     <div className={styles.balanceItemLeft}>
//                                                         <div className={cn(styles.balanceItemDot, entity.color === 'red' && styles.red, entity.color === 'green' && styles.green, entity.color === 'blue' && styles.blue)}></div>
//                                                         <div className={styles.balanceItemInfo}>
//                                                             <span className={styles.balanceItemName}>{entity.name}</span>
//                                                         </div>
//                                                     </div>
//                                                     <span className={styles.balanceItemValue}>
//                                                         {entity.balance} <span className={styles.balanceItemCurrency}>₽</span>
//                                                     </span>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className={styles.balanceModalFull}>
//                                         {/* Modal Header */}
//                                         <div className={styles.balanceModalFullHeader}>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//                                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                                                     <div className={styles.balanceModalFullTitle}>
//                                                         <div className={styles.balanceModalFullTitleDot}></div>
//                                                         <h2 className={styles.balanceModalFullTitleValue}>2 975 071 ₽</h2>
//                                                     </div>
//                                                     <p className={styles.balanceModalFullTitleDate}>13 Января 2026 | 12:25</p>
//                                                 </div>
//                                             </div>
// 
//                                             <div className={styles.balanceModalFullControls}>
//                                                 <div className={styles.balanceViewToggle}>
//                                                     <button
//                                                         onClick={() => setBalanceView('groups')}
//                                                         className={cn(styles.balanceViewButton, balanceView === 'groups' ? styles.active : styles.inactive)}
//                                                     >
//                                                         По группам
//                                                     </button>
//                                                     <button
//                                                         onClick={() => setBalanceView('entities')}
//                                                         className={cn(styles.balanceViewButton, balanceView === 'entities' ? styles.active : styles.inactive)}
//                                                     >
//                                                         По юрлицам
//                                                     </button>
//                                                 </div>
//                                                 <div className={styles.viewDropdown} ref={viewRef}>
//                                                     <button
//                                                         onClick={() => setIsViewOpen(!isViewOpen)}
//                                                         className={styles.viewButton}
//                                                     >
//                                                         <span>Вид</span>
//                                                         <ChevronDown size={14} className={cn(styles.viewButtonIcon, isViewOpen && styles.open)} />
//                                                     </button>
// 
//                                                     {isViewOpen && (
//                                                         <div className={styles.viewDropdownMenu}>
//                                                             <div className={styles.viewDropdownSection}>
//                                                                 <span className={styles.viewDropdownSectionTitle}>Режим окна</span>
//                                                             </div>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setModalMode('compact')
//                                                                     setIsViewOpen(false)
//                                                                 }}
//                                                                 className={cn(styles.viewDropdownItem, modalMode === 'compact' ? styles.active : styles.inactive)}
//                                                             >
//                                                                 <span>Компактный</span>
//                                                                 {modalMode === 'compact' && <span className={styles.viewDropdownCheck}>✓</span>}
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setModalMode('full')
//                                                                     setIsViewOpen(false)
//                                                                 }}
//                                                                 className={cn(styles.viewDropdownItem, modalMode === 'full' ? styles.active : styles.inactive)}
//                                                             >
//                                                                 <span>Полный</span>
//                                                                 {modalMode === 'full' && <span className={styles.viewDropdownCheck}>✓</span>}
//                                                             </button>
//                                                             
//                                                             <div className={styles.viewDropdownSection}>
//                                                                 <span className={styles.viewDropdownSectionTitle}>Группировка</span>
//                                                             </div>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setBalanceView('accounts')
//                                                                     setIsViewOpen(false)
//                                                                 }}
//                                                                 className={cn(styles.viewDropdownItem, balanceView === 'accounts' ? styles.active : styles.inactive)}
//                                                             >
//                                                                 <span>По счетам</span>
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setBalanceView('groups')
//                                                                     setIsViewOpen(false)
//                                                                 }}
//                                                                 className={cn(styles.viewDropdownItem, balanceView === 'groups' ? styles.active : styles.inactive)}
//                                                             >
//                                                                 <span>По группам</span>
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setBalanceView('entities')
//                                                                     setIsViewOpen(false)
//                                                                 }}
//                                                                 className={cn(styles.viewDropdownItem, balanceView === 'entities' ? styles.active : styles.inactive)}
//                                                             >
//                                                                 <span>По юр. лицам</span>
//                                                             </button>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 <button
//                                                     onClick={() => setExpandedGroups(expandedGroups.length ? [] : ['unallocated'])}
//                                                     className={styles.expandButton}
//                                                 >
//                                                     {expandedGroups.length === 0 ? 'Развернуть группы' : 'Свернуть группы'}
//                                                 </button>
//                                             </div>
//                                         </div>
// 
//                                         {balanceView === 'groups' && (
//                                             <div className={styles.balanceGrid}>
//                                                 {[
//                                                     {
//                                                         id: 'unallocated',
//                                                         name: 'Нераспределенные (6)',
//                                                         balance: '2 975 071',
//                                                         accounts: [
//                                                             { name: 'Наличка', color: 'green' },
//                                                             { name: 'Альфа банк', balance: '930 894', status: 'Разрыв с 09.03.26', color: 'red' },
//                                                             { name: 'Сбер', balance: '450 067', status: 'Разрыв с 23.02.26', color: 'red' },
//                                                             { name: 'Т-Банк', balance: '265 254', status: 'Разрыв с 15.02.26 по 16.02.26', color: 'red' },
//                                                             { name: 'Карта физ. лица', balance: '110 000', color: 'green' },
//                                                             { name: 'Сейф', balance: '-178 226', status: 'Разрыв с 21.08.25 по 19.01.26', color: 'red' }
//                                                         ]
//                                                     },
//                                                     { id: 'deposits', name: 'Депозиты (0)', balance: '0', accounts: [] },
//                                                     { id: 'new', name: 'Новая группа (0)', balance: '0', accounts: [] }
//                                                 ].map((group) => (
//                                                     <div key={group.id} className={styles.balanceGroup}>
//                                                         <div className={styles.balanceGroupHeader}>
//                                                             <div className={styles.balanceGroupHeaderInner}>
//                                                                 <span className={styles.balanceGroupName}>{group.name}</span>
//                                                                 <div className={styles.balanceGroupValue}>
//                                                                     <span className={styles.balanceGroupValueText}>{group.balance} <span className={styles.balanceGroupValueCurrency}>₽</span></span>
//                                                                     <button
//                                                                         onClick={(e) => {
//                                                                             e.stopPropagation();
//                                                                             setActiveGroupMenu(activeGroupMenu === group.id ? null : group.id);
//                                                                         }}
//                                                                         className={styles.balanceGroupMenuButton}
//                                                                     >
//                                                                         <MoreVertical size={16} className={styles.balanceGroupMenuIcon} />
//                                                                     </button>
//                                                                 </div>
//                                                             </div>
// 
//                                                             {/* Group Actions Dropdown */}
//                                                             {activeGroupMenu === group.id && (
//                                                                 <div ref={groupMenuRef} className={styles.balanceGroupMenu}>
//                                                                     <button
//                                                                         onClick={() => toggleExpandGroup(group.id)}
//                                                                         className={styles.balanceGroupMenuItem}
//                                                                     >
//                                                                         <Maximize2 size={16} className={styles.balanceGroupMenuIcon} />
//                                                                         <span>{expandedGroups.includes(group.id) ? 'Свернуть' : 'Развернуть'}</span>
//                                                                     </button>
//                                                                 </div>
//                                                             )}
//                                                         </div>
// 
//                                                         {/* Expanded Content or Placeholder */}
//                                                         {expandedGroups.includes(group.id) ? (
//                                                             group.accounts.length > 0 ? (
//                                                                 <div className={styles.balanceGroupContent}>
//                                                                     {group.accounts.map((acc, idx) => (
//                                                                         <div key={idx} className={styles.balanceAccount}>
//                                                                             <div className={styles.balanceAccountLeft}>
//                                                                                 <div className={cn(styles.balanceAccountDot, acc.color === 'red' && styles.red, acc.color === 'green' && styles.green, acc.color === 'blue' && styles.blue)}></div>
//                                                                                 <div className={styles.balanceAccountInfo}>
//                                                                                     <span className={styles.balanceAccountName}>{acc.name}</span>
//                                                                                     {acc.status && (
//                                                                                         <span className={styles.balanceAccountStatus}>{acc.status}</span>
//                                                                                     )}
//                                                                                 </div>
//                                                                             </div>
//                                                                             {acc.balance && (
//                                                                                 <span className={styles.balanceAccountValue}>
//                                                                                     {acc.balance} <span className={styles.balanceAccountCurrency}>₽</span>
//                                                                                 </span>
//                                                                             )}
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             ) : (
//                                                                 <div className={styles.balanceGroupEmpty}>
//                                                                     <span className={styles.balanceGroupEmptyText}>Переместите счета в эту группу</span>
//                                                                 </div>
//                                                             )
//                                                         ) : (
//                                                             <div className={styles.balanceGroupEmpty}>
//                                                                 <span className={styles.balanceGroupEmptyText}>Переместите счета в эту группу</span>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}
// 
//                                         {/* Modal Content - Legal Entities View */}
//                                         {balanceView === 'entities' && (
//                                             <div className={styles.balanceGrid}>
//                                                 {[
//                                                     { id: 'prometey', name: 'ООО "Прометей" (3)', balance: '2 112 403', accounts: [] },
//                                                     {
//                                                         id: 'alekseenko',
//                                                         name: 'ИП Алексеенко Михаил Федоро...',
//                                                         balance: '862 668',
//                                                         accounts: [
//                                                             { name: 'Альфа банк', balance: '930 894', status: 'Разрыв с 09.03.26', color: 'red' },
//                                                             { name: 'Карта физ. лица', balance: '110 000', color: 'green' },
//                                                             { name: 'Сейф', balance: '-178 226', status: 'Разрыв с 21.08.25 по 19.01.26', color: 'red' }
//                                                         ]
//                                                     }
//                                                 ].map((entity) => (
//                                                     <div key={entity.id} className={styles.balanceGroup}>
//                                                         <div className={styles.balanceGroupHeader}>
//                                                             <div className={styles.balanceGroupHeaderInner}>
//                                                                 <span className={styles.balanceGroupName} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }} title={entity.name}>{entity.name}</span>
//                                                                 <div className={styles.balanceGroupValue} style={{ flexShrink: 0 }}>
//                                                                     <span className={styles.balanceGroupValueText}>{entity.balance} <span className={styles.balanceGroupValueCurrency}>₽</span></span>
//                                                                     <button
//                                                                         onClick={(e) => {
//                                                                             e.stopPropagation();
//                                                                             setActiveEntityMenu(activeEntityMenu === entity.id ? null : entity.id);
//                                                                         }}
//                                                                         className={styles.balanceGroupMenuButton}
//                                                                     >
//                                                                         <MoreVertical size={16} className={styles.balanceGroupMenuIcon} />
//                                                                     </button>
//                                                                 </div>
//                                                             </div>
// 
//                                                             {/* Entity Actions Dropdown */}
//                                                             {activeEntityMenu === entity.id && (
//                                                                 <div ref={entityMenuRef} className={styles.balanceGroupMenu}>
//                                                                     <button
//                                                                         onClick={() => toggleExpandEntity(entity.id)}
//                                                                         className={styles.balanceGroupMenuItem}
//                                                                     >
//                                                                         <Maximize2 size={16} className={styles.balanceGroupMenuIcon} />
//                                                                         <span>Развернуть</span>
//                                                                     </button>
//                                                                 </div>
//                                                             )}
//                                                         </div>
// 
//                                                         {/* Expanded Accounts List */}
//                                                         {expandedEntities.includes(entity.id) && entity.accounts.length > 0 && (
//                                                             <div className={styles.balanceGroupContent}>
//                                                                 {entity.accounts.map((acc, idx) => (
//                                                                     <div key={idx} className={styles.balanceAccount}>
//                                                                         <div className={styles.balanceAccountLeft}>
//                                                                             <div className={cn(styles.balanceAccountDot, acc.color === 'red' && styles.red, acc.color === 'green' && styles.green, acc.color === 'blue' && styles.blue)}></div>
//                                                                             <div className={styles.balanceAccountInfo}>
//                                                                                 <span className={styles.balanceAccountName}>{acc.name}</span>
//                                                                                 {acc.status && (
//                                                                                     <span className={styles.balanceAccountStatus}>{acc.status}</span>
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                         <span className={styles.balanceAccountValue}>
//                                                                             {acc.balance} <span className={styles.balanceAccountCurrency}>₽</span>
//                                                                         </span>
//                                                                     </div>
//                                                                 ))}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
// 
//                                 )}
//                             </div>
//                         )}
//                     </div>
                    {/* Sparkline Section */}
                    <div
                        onClick={() => {
                            setIsBalanceOpen(!isBalanceOpen)
                            setIsHelpOpen(false)
                        }}
                        className={styles.sparklineSection}
                    >
                        <div className={styles.sparkline}>
                            <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                <path
                                    d="M0,8 L10,8 L11,15 L15,10 L18,22 L22,12 L25,18 L30,12 L35,15 L40,8 L45,18 L50,12 L55,20 L60,15 L65,18 L70,8 L75,18 L80,22 L85,15"
                                    fill="none"
                                    stroke="#4ade80"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M85,15 L88,25 L92,25 L95,15 L100,20"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    opacity="0.6"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* User Info Section */}
                    <div className={styles.profileSection} ref={profileRef}>
                        <div 
                            onClick={() => {
                                if (isProfileOpen) {
                                    setIsProfileClosing(true)
                                    setTimeout(() => {
                                        setIsProfileOpen(false)
                                        setIsProfileClosing(false)
                                    }, 200)
                                } else {
                                    setIsProfileOpen(true)
                                }
                            }}
                            className={styles.profileTrigger}
                        >
                            <span className={styles.profileEmail}>demo-guest@planfact.io</span>
                            <ChevronDown size={14} className={cn(styles.profileChevron, isProfileOpen && styles.open)} />
                        </div>
                        <p className={styles.profileSubtext}>Подписка активна</p>

                        {/* Profile Dropdown */}
                        {(isProfileOpen || isProfileClosing) && (
                            <div 
                                className={cn(styles.profileDropdown, isProfileClosing ? styles.closing : styles.opening)}
                            >
                                <div className={styles.profileDropdownHeader}>
                                    <div className={styles.profileDropdownEmail}>demo-guest@planfact.io</div>
                                    <div className={styles.profileDropdownStatus}>Подписка активна</div>
                                </div>
                                
                                <div className={styles.profileDropdownMenu}>
                                    {[
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>,
                                            text: 'Тарифы и оплата' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>,
                                            text: 'Внедрить под ключ' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>,
                                            text: 'Обучиться ПланФакту' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>,
                                            text: 'Настройки аккаунта' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>,
                                            text: 'Помощь и справка' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>,
                                            text: 'Стать партнером' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                            </svg>,
                                            text: 'Программа лояльности' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>,
                                            text: 'Скидки от друзей' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>,
                                            text: 'История обновлений' 
                                        },
                                        { 
                                            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>,
                                            text: 'Соглашение' 
                                        }
                                    ].map((item, idx) => (
                                        <button 
                                            key={idx}
                                            className={styles.profileDropdownItem}
                                            style={{ 
                                                animation: isProfileClosing 
                                                    ? `fadeSlideOut 0.15s ease-in ${(9 - idx) * 0.02}s backwards`
                                                    : `fadeSlideUp 0.2s ease-out ${idx * 0.03}s backwards`
                                            }}
                                        >
                                            <span className={styles.profileDropdownItemIcon}>{item.icon}</span>
                                            <span>{item.text}</span>
                                        </button>
                                    ))}
                                </div>
                                
                                <div className={styles.profileDropdownLogout}>
                                    <button 
                                        onClick={async () => {
                                            setIsLoggingOut(true)
                                            await new Promise(resolve => setTimeout(resolve, 800))
                                            document.cookie = 'isAuthenticated=; path=/; max-age=0'
                                            localStorage.removeItem('isAuthenticated')
                                            localStorage.removeItem('userEmail')
                                            window.location.href = '/pages/auth'
                                        }}
                                        disabled={isLoggingOut}
                                        className={styles.profileDropdownLogoutButton}
                                        style={{ 
                                            animation: isProfileClosing 
                                                ? 'fadeSlideOut 0.15s ease-in 0s backwards'
                                                : 'fadeSlideUp 0.2s ease-out 0.3s backwards'
                                        }}
                                    >
                                        {isLoggingOut ? (
                                            <>
                                                <svg className={styles.profileDropdownLogoutSpinner} fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className={styles.profileDropdownLogoutText}>Выход...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className={styles.profileDropdownLogoutIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span className={styles.profileDropdownLogoutText}>Выйти из аккаунта</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notification & Billing */}
                    <div className={styles.notificationsSection}>
                        <div style={{ position: 'relative' }} ref={notificationsRef}>
                            <button 
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={styles.notificationsButton}
                            >
                                <Bell size={18} fill="currentColor" />
                            </button>

                            {/* Notifications Modal */}
                            {isNotificationsOpen && (
                                <div className={styles.notificationsModal}>
                                    <div className={styles.notificationsModalContent}>
                                        <div className={styles.notificationsModalHeader}>
                                            <h2 className={styles.notificationsModalTitle}>Уведомления</h2>
                                            <button 
                                                onClick={() => setIsNotificationsOpen(false)}
                                                className={styles.notificationsModalClose}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <div className={styles.notificationsModalBody}>
                                            <div className={styles.notificationsModalIcon}>
                                                <div className={styles.notificationsModalIconGradient}></div>
                                                <div className={styles.notificationsModalIconInner}>
                                                    <div className={cn(styles.notificationsModalIconBox, styles.notificationsModalIconBoxBlue)}>
                                                        <svg className={styles.notificationsModalIconSvg} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                        </svg>
                                                    </div>
                                                    <div className={cn(styles.notificationsModalIconBox, styles.notificationsModalIconBoxGreen)} style={{ marginLeft: '0.5rem' }}>
                                                        <svg className={styles.notificationsModalIconSvg} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                            <path d="M9 11l3 3l8-8"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <h3 className={styles.notificationsModalEmptyTitle}>Здесь пока пусто</h3>
                                            <p className={styles.notificationsModalEmptyText}>
                                                Новые уведомления появятся в этом окне
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className={styles.billingButton}>
                            Тарифы и оплата
                        </button>
                    </div>
                </div>
            </header>
        </>
    )
}

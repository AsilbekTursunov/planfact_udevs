"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LineChart,
    RefreshCw,
    Database,
    CalendarCheck,
    Briefcase,
    ClipboardList,
    Library,
    Settings,
    Circle,
    ChevronRight,
    BarChart3
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import styles from './Sidebar.module.scss'

// Deal icon component
const DealIcon = ({ size = 22, strokeWidth = 1.5, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <line x1="1.92883" y1="7.46954" x2="1.92883" y2="13.6769" stroke="currentColor" strokeWidth={strokeWidth}/>
        <path fillRule="evenodd" clipRule="evenodd" d="M2.42888 7.29603C2.42888 7.25067 2.45094 7.07883 2.77752 6.79745C3.10102 6.51873 3.62753 6.22238 4.36501 5.95362C5.83181 5.41909 7.9245 5.06885 10.2844 5.06885C12.6444 5.06885 14.7371 5.41909 16.2039 5.95362C16.9414 6.22238 17.4679 6.51873 17.7914 6.79745C18.1179 7.07883 18.14 7.25067 18.14 7.29603C18.14 7.31199 18.1373 7.3436 18.1195 7.39014H18.11V7.41317C18.0716 7.49945 17.985 7.62777 17.7914 7.7946C17.4679 8.07332 16.9414 8.36967 16.2039 8.63843C14.7371 9.17297 12.6444 9.52321 10.2844 9.52321C7.9245 9.52321 5.83181 9.17297 4.36501 8.63843C3.62753 8.36967 3.10102 8.07332 2.77752 7.7946C2.45094 7.51322 2.42888 7.34139 2.42888 7.29603ZM18.11 8.80798C16.6224 9.82836 13.6761 10.5232 10.2844 10.5232C5.39365 10.5232 1.42888 9.07835 1.42888 7.29603C1.42888 5.5137 5.39365 4.06885 10.2844 4.06885C15.1752 4.06885 19.14 5.5137 19.14 7.29603C19.14 7.38617 19.1299 7.47544 19.11 7.56371V12.9926H18.11V8.80798ZM10.3014 14.7879C8.05501 14.8456 6.03072 14.4193 4.58313 13.8113C3.85767 13.5067 3.29693 13.1648 2.92672 12.8323C2.543 12.4878 2.43359 12.2191 2.43359 12.0606C2.43359 11.7845 2.20974 11.5606 1.93359 11.5606C1.65745 11.5606 1.43359 11.7845 1.43359 12.0606C1.43359 12.6403 1.79364 13.1589 2.25863 13.5764C2.73713 14.0061 3.40436 14.4009 4.19593 14.7333C5.78097 15.399 7.9445 15.8479 10.3206 15.7878C11.1937 15.7875 12.0375 15.737 12.8337 15.643C13.1079 15.6106 13.304 15.362 13.2716 15.0878C13.2392 14.8135 12.9906 14.6175 12.7164 14.6499C11.9582 14.7394 11.1515 14.7878 10.3142 14.7878V14.7876L10.3014 14.7879ZM10.2841 19.9487C11.2137 19.9487 12.1055 19.8888 12.9346 19.7788L13.0661 20.7702C12.1919 20.8861 11.2562 20.9487 10.2841 20.9487C7.93039 20.9487 5.77689 20.5813 4.19352 19.9699C3.40348 19.6649 2.7299 19.2894 2.24519 18.847C1.76025 18.4043 1.42542 17.8557 1.42542 17.2215H2.42542C2.42542 17.4785 2.55837 17.7789 2.91937 18.1084C3.28061 18.4382 3.83112 18.7581 4.5537 19.0371C5.99558 19.5938 8.02142 19.9487 10.2841 19.9487Z" fill="currentColor"/>
        <line x1="1.92871" y1="12.6853" x2="1.92871" y2="17.2218" stroke="currentColor" strokeWidth={strokeWidth}/>
        <circle cx="17.6728" cy="17.9576" r="5.32709" stroke="currentColor" strokeWidth={strokeWidth}/>
        <path d="M15.5697 18.1569L17.1036 19.6908C17.2283 19.8155 17.4332 19.8062 17.5461 19.6707L20.2794 16.3908" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"/>
    </svg>
);

const navItems = [
    // { icon: LineChart, label: 'Показатели', href: '/pages/dashboard', hasPage: false }, // Закомментировано
    { icon: RefreshCw, label: 'Операции', href: '/pages/operations', hasPage: true },
    { icon: DealIcon, label: 'Сделки', href: '/pages/deals', hasPage: true },
    { 
        icon: ClipboardList, 
        label: 'Отчёты', 
        href: '/pages/reports',
        hasPage: true,
        submenu: [
            { label: 'Движение денег (ДДС)', href: '/pages/reports/cashflow', hasPage: true },
            { label: 'Прибыли и убытки (P&L)', href: '/pages/reports/profit-and-loss', hasPage: true },
            { label: 'Баланс', href: '/pages/reports/balance', hasPage: true }
        ]
    },
    { 
        icon: Settings, 
        label: 'Справочники', 
        href: '/pages/directories',
        hasPage: true,
        submenu: [
            { label: 'Контрагенты', href: '/pages/directories/counterparties', hasPage: true },
            { label: 'Учетные статьи', href: '/pages/directories/transaction-categories', hasPage: true },
            { label: 'Мои счета', href: '/pages/directories/accounts', hasPage: true },
            { label: 'Мои юрлица', href: '/pages/directories/legal-entities', hasPage: true }
        ]
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [expandedMenu, setExpandedMenu] = useState(null)
    const [hoveredItem, setHoveredItem] = useState(null)
    const [clickedItem, setClickedItem] = useState(null)
    const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 })
    const [submenuPositions, setSubmenuPositions] = useState({})
    const sidebarRef = useRef(null)
    const submenuRefs = useRef({})
    const navItemRefs = useRef({})
    
    // Update submenu positions when they open
    useEffect(() => {
        const updateSubmenuPosition = (index) => {
            if (navItemRefs.current[index]) {
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    const itemRect = navItemRefs.current[index].getBoundingClientRect()
                    setSubmenuPositions(prev => ({
                        ...prev,
                        [index]: itemRect.top
                    }))
                })
            }
        }

        if (hoveredItem !== null) {
            updateSubmenuPosition(hoveredItem)
        }
        if (clickedItem !== null) {
            updateSubmenuPosition(clickedItem)
        }
    }, [hoveredItem, clickedItem])
    
    // Update active indicator position
    useEffect(() => {
        const updateIndicator = () => {
            // Small delay to ensure DOM is ready
            requestAnimationFrame(() => {
                const filteredItems = navItems.filter(item => item.hasPage)
                const activeIndex = filteredItems.findIndex((item, index) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    const hasSubmenu = item.submenu && item.submenu.length > 0
                    const isSubmenuActive = hasSubmenu && item.submenu.some(sub => pathname === sub.href)
                    return isActive || isSubmenuActive
                })
                
                if (activeIndex !== -1 && navItemRefs.current[activeIndex]) {
                    const activeElement = navItemRefs.current[activeIndex]
                    const rect = activeElement.getBoundingClientRect()
                    const sidebarRect = sidebarRef.current?.getBoundingClientRect()
                    
                    if (sidebarRect) {
                        const top = rect.top - sidebarRect.top
                        const height = rect.height
                        
                        setActiveIndicatorStyle({
                            top: `${top}px`,
                            height: `${height}px`,
                            opacity: 1
                        })
                    }
                } else {
                    setActiveIndicatorStyle(prev => ({ ...prev, opacity: 0 }))
                }
            })
        }
        
        // Initial update with small delay
        const timeoutId = setTimeout(updateIndicator, 50)
        
        // Update on scroll/resize
        window.addEventListener('scroll', updateIndicator, true)
        window.addEventListener('resize', updateIndicator)
        
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('scroll', updateIndicator, true)
            window.removeEventListener('resize', updateIndicator)
        }
    }, [pathname])
    
    // Close submenu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside sidebar
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setClickedItem(null)
                setHoveredItem(null)
                return
            }
            
            // Check if click is outside any open submenu
            const clickedInsideSubmenu = Object.values(submenuRefs.current).some(ref => 
                ref && ref.contains && ref.contains(event.target)
            )
            
            if (!clickedInsideSubmenu && clickedItem !== null) {
                // Check if click is on a nav item button
                const clickedOnNavButton = event.target.closest('button.navButton')
                if (!clickedOnNavButton) {
                    setClickedItem(null)
                }
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [clickedItem])
    
    return (
        <aside className={styles.sidebar} ref={sidebarRef}>
            {/* Header / Logo at top */}
            <div className={styles.header}>
                <svg className={styles.logo} width="40" height="37" viewBox="0 0 40 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.0869 25.4229C16.2118 25.4229 16.3135 25.5245 16.3135 25.6494V29.3506C16.3135 29.4755 16.2118 29.5771 16.0869 29.5771H0.226563C0.101678 29.5771 1.38713e-05 29.4755 0 29.3506L0 25.6494C0 25.5245 0.101669 25.4229 0.226563 25.4229H16.0869ZM4.01758 7.42285C4.14247 7.42285 4.24414 7.52452 4.24414 7.64941V16.0986C4.24419 17.2402 4.64228 18.1741 5.51758 18.8486C6.36618 19.5749 7.45306 19.8866 8.11621 19.8867C8.5141 19.8867 8.99242 19.7826 9.44336 19.627C9.94711 19.4194 10.451 19.1604 10.8223 18.8232C11.1936 18.486 11.5389 18.0967 11.7246 17.6816C11.9633 17.2146 12.043 16.7212 12.043 16.1504V7.64941C12.043 7.52454 12.1437 7.42289 12.2686 7.42285L16.0869 7.42285C16.2118 7.42285 16.3134 7.52459 16.3135 7.64941V16.1504C16.3134 21.1322 11.8298 24.0381 8.11621 24.0381C4.721 24.0378 0.000120103 21.3655 0 16.0986L0 7.64941C0.00011711 7.52475 0.100938 7.42306 0.225586 7.42285H4.01758Z" fill="#0E73F6"/>
                    <path d="M25.6573 17.66H36.1273V20.96H25.6573V17.66ZM25.9873 29H22.0873V8H37.4173V11.27H25.9873V29Z" fill="white"/>
                </svg>
            </div>
            
            {/* Active indicator */}
            <div 
                className={styles.activeIndicator}
                style={activeIndicatorStyle}
            />
            
            <nav className={styles.nav}>
                {navItems
                    .filter(item => item.hasPage) // Only show items with existing pages
                    .map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                    const hasSubmenu = item.submenu && item.submenu.length > 0
                    const isSubmenuActive = hasSubmenu && item.submenu.some(sub => pathname === sub.href)
                    const isSubmenuOpen = hasSubmenu && (hoveredItem === index || clickedItem === index)
                    
                    const handleItemClick = (e) => {
                        if (hasSubmenu) {
                            e.preventDefault()
                            setClickedItem(clickedItem === index ? null : index)
                        }
                    }
                    
                    return (
                        <div 
                            key={index}
                            ref={el => navItemRefs.current[index] = el}
                            className={styles.navItem}
                            onMouseEnter={() => hasSubmenu && setHoveredItem(index)}
                            onMouseLeave={() => hasSubmenu && setHoveredItem(null)}
                        >
                            {hasSubmenu ? (
                                <button
                                    onClick={handleItemClick}
                                    className={cn(
                                        styles.navLink,
                                        styles.navButton,
                                        (isActive || isSubmenuActive) && styles.navLinkActive,
                                        !item.hasPage ? styles.navLinkComingSoon : styles.navLinkNormal
                                    )}
                                    data-active={isActive || isSubmenuActive}
                                >
                                    <div className={styles.iconWrapper}>
                                        <item.icon size={22} strokeWidth={1.5} />
                                    </div>
                                    <span className={styles.label}>
                                        {item.label}
                                    </span>
                                </button>
                            ) : (
                                <Link
                                    href={item.href || '/'}
                                    className={cn(
                                        styles.navLink,
                                        (isActive || isSubmenuActive) && styles.navLinkActive,
                                        !item.hasPage ? styles.navLinkComingSoon : styles.navLinkNormal
                                    )}
                                    data-active={isActive || isSubmenuActive}
                                >
                                    <div className={styles.iconWrapper}>
                                        <item.icon size={22} strokeWidth={1.5} />
                                    </div>
                                    <span className={styles.label}>
                                        {item.label}
                                    </span>
                                </Link>
                            )}

                            {/* Submenu */}
                            {hasSubmenu && isSubmenuOpen && (
                                <div 
                                    ref={el => submenuRefs.current[index] = el}
                                    className={styles.submenu}
                                    style={{ top: `${submenuPositions[index] || 0}px` }}
                                    onMouseEnter={() => setHoveredItem(index)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    {item.submenu
                                        .filter(subItem => subItem.hasPage) // Only show submenu items with existing pages
                                        .map((subItem, subIndex) => {
                                        const isSubActive = pathname === subItem.href
                                        return (
                                            <Link
                                                key={subIndex}
                                                href={subItem.href}
                                                className={cn(
                                                    styles.submenuLink,
                                                    isSubActive ? styles.submenuLinkActive : styles.submenuLinkInactive
                                                )}
                                                onClick={() => setClickedItem(null)}
                                            >
                                                {subItem.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>
        </aside>
    )
}

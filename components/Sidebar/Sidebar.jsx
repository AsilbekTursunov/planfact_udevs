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

const navItems = [
    // { icon: LineChart, label: 'Показатели', href: '/pages/dashboard', hasPage: false }, // Закомментировано
    { icon: RefreshCw, label: 'Операции', href: '/pages/operations', hasPage: true },
    { 
        icon: ClipboardList, 
        label: 'Отчёты', 
        href: '/pages/reports',
        hasPage: true,
        submenu: [
            { label: 'Движение денег (ДДС)', href: '/pages/reports/cashflow', hasPage: true },
            { label: 'Прибыли и убытки (P&L)', href: '/pages/reports/profit-and-loss', hasPage: true },
            { label: 'Баланс', href: '/pages/reports/balance', hasPage: false }
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
                <span className={styles.logo}>??</span>
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

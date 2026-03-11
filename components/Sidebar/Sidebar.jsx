"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RefreshCw, ClipboardList, Library } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import styles from './Sidebar.module.scss'
import { UsersIcon, DealIcon } from '@/constants/icons'
import { IoSettingsOutline } from 'react-icons/io5'

const navItems = [
    { icon: RefreshCw, label: 'Операции', href: '/pages/operations', hasPage: true },
    { icon: UsersIcon, label: 'Контрагенты', href: '/pages/directories/counterparties', hasPage: true },
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
        icon: Library,
        label: 'Справочники',
        href: '/pages/directories',
        hasPage: true,
        submenu: [
            { label: 'Контрагенты', href: '/pages/directories/counterparties', hasPage: true },
            { label: 'Учетные статьи', href: '/pages/directories/transaction-categories', hasPage: true },
            { label: 'Мои счета', href: '/pages/directories/accounts', hasPage: true },
            { label: 'Мои юрлица', href: '/pages/directories/legal-entities', hasPage: true },
            { label: 'Товары & Услуги', href: '/pages/directories/product-service', hasPage: true }
        ]
    },
    {
        icon: IoSettingsOutline,
        label: 'Настройки',
        href: '/pages/settings',
        hasPage: true,
    },
]

export function Sidebar() {
    const pathname = usePathname()
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
                <svg className={styles.logo} xmlns="http://www.w3.org/2000/svg" width="34" height="29" viewBox="0 0 34 29" fill="none">
                    <path d="M16.0869 24C16.2118 24 16.3135 24.1017 16.3135 24.2266V27.9277C16.3135 28.0526 16.2118 28.1543 16.0869 28.1543H0.226563C0.101678 28.1543 1.38713e-05 28.0526 0 27.9277L0 24.2266C0 24.1017 0.101669 24 0.226563 24H16.0869ZM4.01758 6C4.14247 6 4.24414 6.10167 4.24414 6.22656V14.6758C4.24419 15.8174 4.64228 16.7512 5.51758 17.4258C6.36618 18.152 7.45306 18.4637 8.11621 18.4639C8.5141 18.4639 8.99242 18.3598 9.44336 18.2041C9.94711 17.9966 10.451 17.7375 10.8223 17.4004C11.1936 17.0631 11.5389 16.6739 11.7246 16.2588C11.9633 15.7918 12.043 15.2983 12.043 14.7275V6.22656C12.043 6.10169 12.1437 6.00004 12.2686 6L16.0869 6C16.2118 6 16.3134 6.10173 16.3135 6.22656V14.7275C16.3134 19.7093 11.8298 22.6152 8.11621 22.6152C4.721 22.615 0.000120103 19.9426 0 14.6758L0 6.22656C0.00011711 6.10189 0.100938 6.0002 0.225586 6H4.01758Z" fill="#0E73F6" />
                    <path d="M23.592 13.76H31.656V16.88H23.592V13.76ZM23.88 23H19.992V6.2H32.688V9.32H23.88V23Z" fill="white" />
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

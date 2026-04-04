"use client"

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RefreshCw, ClipboardList, Library, DivideCircle } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { UsersIcon, DealIcon } from '@/constants/icons'
import { AppLogo } from '../../constants/icons'

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
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
            { label: 'Прибыли и убытки (ОПУ)', href: '/pages/reports/profit-and-loss', hasPage: true },
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
    const sidebarRef = useRef(null)


    return (
        <aside className="bg-blue-950 w-[80px] flex flex-col gap-2 h-full items-center justify-start fixed left-0 z-1000" ref={sidebarRef}>
            {/* <div className="flex items-center justify-center h-[60px] pl-1 pt-1"> */}
            <AppLogo size={44} strokeWidth={1.5} className='mt-2' />
            {/* </div> */}

            <nav className="flex flex-col   w-full">
                {navItems
                    .filter(item => item.hasPage)
                    .map((item, index) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                        const hasSubmenu = item.submenu && item.submenu.length > 0
                        const isSubmenuActive = hasSubmenu && item.submenu.some(sub => pathname === sub.href)

                        const LinkContent = (
                            <div className={cn(
                                "flex flex-col h-[65px] items-center justify-center w-full rounded-md transition-all cursor-pointer text-white/60 hover:text-white ",
                                (isActive || isSubmenuActive) && " text-white"
                            )}>
                                <div className="mb-1">
                                    <item.icon size={22} strokeWidth={1.5} />
                                </div>
                                <span className="text-mini text-center font-medium leading-tight">
                                    {item.label}
                                </span>
                            </div>
                        )

                        if (hasSubmenu) {
                            return (
                                <div key={index} className='relative group'>
                                    <div className='relative'>
                                        {LinkContent}
                                    </div>
                                    <div className="bg-blue-950 -top-1/2 left-[80px]  absolute hidden group-hover:block rounded-none text-white min-w-[180px] shadow-none rounded-tr-lg rounded-br-lg p-2">
                                        <div className="flex flex-col gap-1">
                                            {item.submenu
                                                .filter(sub => sub.hasPage)
                                                .map((sub, subIndex) => {
                                                    const isSubActive = pathname === sub.href
                                                    return (
                                                        <Link
                                                            key={subIndex}
                                                            href={sub.href}
                                                            className={cn(
                                                                "block p-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors",
                                                                isSubActive && "bg-white/20 text-white"
                                                            )}
                                                        >
                                                            {sub.label}
                                                        </Link>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <Link className='w-full' key={index} href={item.href || '/'}>
                                {LinkContent}
                            </Link>
                        )
                    })}
            </nav>
        </aside>
    )
}

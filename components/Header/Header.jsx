"use client"

import TotalPrice from './total-prices'
import { Profile } from './profile'

export function Header() {

    return (
        <>
            <header className="flex items-center h-[60px] sticky top-0 z-10 justify-end bg-blue-950">
                <div className="flex items-center">
                    <TotalPrice />
                    <Profile />
                </div>
            </header>
        </>
    )
}

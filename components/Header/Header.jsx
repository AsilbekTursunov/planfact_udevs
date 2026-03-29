"use client"

import TotalPrice from './total-prices'
import { Profile } from './profile'

export function Header() {

    return (
        <>
            <header className="flex items-center h-[60px] fixed w-full z-100 top-0 justify-end bg-blue-950">
                <div className="flex items-center">
                    <TotalPrice />
                    <Profile />
                </div>
            </header>
        </>
    )
}

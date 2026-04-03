"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './OperationsTable.module.scss'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { EllipseIcon, EllipsisVertical } from 'lucide-react'

export function OperationMenu({ operation, onEdit, onDelete, onCopy }) {
  const [isOpen, setIsOpen] = useState(false)

  // Close popover when user starts scrolling
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = () => {
      setIsOpen(false)
    }

    // Using capture: true to catch scrolling events on all elements before they bubble
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [isOpen])

  const handleEdit = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    onEdit(operation)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    onDelete(operation)
  }

  const handleCopy = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    if (onCopy) onCopy(operation)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        type="button"
        onClick={(e) => e.stopPropagation()}
        asChild
      >
        <Button className="bg-transparent border-none shadow-none cursor-pointer w-5">
          <EllipsisVertical className='text-neutral-600' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[180px] p-1 flex shadow-md flex-col bg-white">
        <button
          className={cn(styles.menuItem, "w-full text-left")}
          onClick={handleEdit}
        >
          <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Редактировать</span>
        </button>

        <button
          className={cn(styles.menuItem, "w-full text-left")}
          onClick={handleCopy}
        >
          <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Копировать</span>
        </button>

        <button
          className={cn(styles.menuItem, styles.menuItemDanger, "w-full text-left")}
          onClick={handleDelete}
        >
          <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Удалить</span>
        </button>
      </PopoverContent>
    </Popover>
  )
}

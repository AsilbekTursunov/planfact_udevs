"use client"

import { cn } from '@/app/lib/utils'
import styles from './CounterpartyMenu.module.scss'
import { EllipsisVertical } from 'lucide-react'

export function CounterpartyMenu({ counterparty, onEdit, onDelete }) {
  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) onEdit(counterparty)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) onDelete(counterparty)
  }

  return (
    <div className='relative flex justify-center '>
      <div className="bg-transparent shadow-none cursor-pointer w-full h-full flex items-center justify-center">
        <EllipsisVertical size={18} className='text-neutral-600' />
      </div>
      <div 
        align="end"
        className={cn(
          "w-[180px] z-50 absolute ring-1 ring-gray-200 top-[80%] rounded-md right-[80%] p-1 shadow-md flex-col bg-white hidden group-hover:flex"
        )}
        onClick={(e) => e.stopPropagation()}
      >
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
          className={cn(styles.menuItem, styles.menuItemDanger, "w-full text-left")}
          onClick={handleDelete}
        >
          <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Удалить</span>
        </button>
      </div>
    </div>
  )
}

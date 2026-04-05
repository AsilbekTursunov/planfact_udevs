"use client"

import { cn } from '@/app/lib/utils'
import styles from './GroupMenu.module.scss'
import { EllipsisVertical, Plus } from 'lucide-react'

export function GroupMenu({ group, onEdit, onDelete, onCreateCounterparty }) {
  const handleEdit = (e) => {
    e.stopPropagation()
    if (onEdit) onEdit(group)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) onDelete(group)
  }

  const handleCreateCounterparty = (e) => {
    e.stopPropagation()
    if (onCreateCounterparty) onCreateCounterparty(group)
  }

  return (
    <div className='relative flex justify-center'>
      <div className="bg-transparent shadow-none cursor-pointer w-full h-full flex items-center justify-center">
        <EllipsisVertical className='text-neutral-600' />
      </div>
      <div 
        align="end"
        className={cn(
          "w-[200px] z-50 absolute ring-1 ring-gray-200 top-[80%] rounded-md right-[80%] p-1 shadow-md flex-col bg-white hidden group-hover:flex"
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
          className={cn(styles.menuItem, "w-full text-left")}
          onClick={handleCreateCounterparty}
        >
          <Plus className={styles.menuItemIcon} />
          <span>Создать контрагента</span>
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

"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './OperationsTable.module.scss'
import { Copy, CopyPlus, EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <div className="bg-transparent  shadow-none cursor-pointer w-full h-full flex items-center justify-center">
          <EllipsisVertical className='text-neutral-600' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem asChild>
          <button
            className={cn(styles.menuItem, "w-full text-left")}
            onClick={handleEdit}
          >
            <Pencil size={16} />
            <span>Редактировать</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className={cn(styles.menuItem, "w-full text-left")}
            onClick={handleCopy}
          >
            <Copy size={16} />
            <span>Копировать</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className={cn(styles.menuItem, styles.menuItemDanger, "w-full text-left")}
            onClick={handleDelete}
          >
            <Trash2 size={16} className='text-red-500' />
            <span>Удалить</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// <div className='relative flex justify-center px-2'>

//   <div align="end" className={cn("w-[180px] z-50 absolute ring-1 ring-gray-200 top-[80%] rounded-md right-[80%] p-1  shadow-md flex-col bg-white", isOpen ? 'flex' : 'hidden')}>


//     <button
//       className={cn(styles.menuItem, "w-full text-left")}
//       onClick={handleCopy}
//     >
//       <Copy size={16} />
//       <span>Копировать</span>
//     </button>

//     <button
//       className={cn(styles.menuItem, styles.menuItemDanger, "w-full text-left")}
//       onClick={handleDelete}
//     >
//       <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//         <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//       </svg>
//       <span>Удалить</span>
//     </button>
//   </div>
// </div>
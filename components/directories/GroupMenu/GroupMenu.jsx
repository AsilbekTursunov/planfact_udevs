"use client"

import { cn } from '@/app/lib/utils'
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function GroupMenu({ group, onEdit, onDelete, onCreateCounterparty }) {
  const handleEdit = () => {
    if (onEdit) onEdit(group)
  }

  const handleDelete = () => {
    if (onDelete) onDelete(group)
  }

  const handleCreateCounterparty = () => {
    if (onCreateCounterparty) onCreateCounterparty(group)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="bg-transparent shadow-none cursor-pointer w-full h-full flex items-center justify-center">
          <EllipsisVertical className='text-neutral-600' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2" align="end">
        <DropdownMenuItem asChild>
          <button
            className={cn("w-full flex items-center cursor-pointer text-sm gap-2 pb-2 justify-start outline-none")}
            onClick={handleEdit}
          >
            <Pencil size={16} />
            <span>Редактировать</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className={cn("w-full flex items-center cursor-pointer text-sm gap-2 pb-2 justify-start outline-none")}
            onClick={handleCreateCounterparty}
          >
            <Plus size={16} />
            <span>Создать контрагента</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className={cn("w-full flex items-center text-red-500 cursor-pointer text-sm gap-2 justify-start outline-none")}
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

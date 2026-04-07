"use client"

import { cn } from '@/app/lib/utils' 
import { Copy, EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,  
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function OperationMenu({ operation, onEdit, onDelete, onCopy }) {
  const handleEdit = () => {
    onEdit(operation)
  }

  const handleDelete = () => {
    onDelete(operation)
  }

  const handleCopy = () => {
    if (onCopy) onCopy(operation)
  }

  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild >
        <div className="bg-transparent w-5 shadow-none cursor-pointer h-full flex items-center justify-center">
          <EllipsisVertical className='text-neutral-600' />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 p-2" align="end">
        <DropdownMenuItem asChild>
          <button
            className={cn("w-full flex items-center cursor-pointer text-sm gap-2 pb-2 justify-start")}
            onClick={handleEdit}
          >
            <Pencil size={16} />
            <span>Редактировать</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className={cn("w-full flex items-center cursor-pointer text-sm gap-2 pb-2 justify-start")}
            onClick={handleCopy}
          >
            <Copy size={16} />
            <span>Копировать</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            className={cn("w-full flex items-center text-red-500 cursor-pointer text-sm gap-2 justify-start")}
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
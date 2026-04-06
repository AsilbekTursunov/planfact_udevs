"use client"

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical, Pencil, Plus, Trash2 } from 'lucide-react'

export function CategoryMenu({ category, onEdit, onDelete, onAddChild }) {
  const [isOpen, setIsOpen] = useState(false)
  const isStatic = category?.isStatic === true

  const handleEdit = () => {
    // DropdownMenuItem handles click and close automatically if propagation is not stopped
    if (!category?.guid) {
      console.error('CategoryMenu: category.guid is missing!', category)
    }
    onEdit(category)
  }

  const handleDelete = () => {
    if (!category?.guid) {
      console.error('CategoryMenu: category.guid is missing!', category)
    }
    onDelete(category)
  }

  const handleAddChild = () => {
    if (!category?.guid) {
      console.error('CategoryMenu: category.guid is missing!', category)
    }
    if (onAddChild) {
      onAddChild(category)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className='p-2 cursor-pointer hover:bg-neutral-50 rounded-full transition-colors'>
          <EllipsisVertical size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        {isStatic ? (
          <DropdownMenuItem asChild>
            <button
              className="flex w-full gap-2 items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md outline-none"
              onClick={handleAddChild}
            >
              <Plus size={16} />
              <span>Создать подстатью</span>
            </button>
          </DropdownMenuItem>
        ) : (
            <>
              <DropdownMenuItem asChild>
              <button
                  className="flex w-full gap-2 items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md outline-none"
                onClick={handleAddChild}
              >
                  <Plus size={16} />
                  <span className='flex-1 text-left'>Создать подстатью</span>
              </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
              <button
                  className="flex w-full gap-2 items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-md outline-none"
                onClick={handleEdit}
              >
                  <Pencil size={16} />
                  <span className='flex-1 text-left'>Редактировать</span>
              </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
              <button
                  className="flex w-full gap-2 items-center p-2 text-red-500 cursor-pointer hover:bg-neutral-100 rounded-md outline-none"
                onClick={handleDelete}
              >
                  <Trash2 size={16} />
                  <span className='flex-1 text-left'>Удалить</span>
              </button>
              </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

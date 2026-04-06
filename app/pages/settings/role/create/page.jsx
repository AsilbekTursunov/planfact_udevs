'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/shared/Input'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'

const PERMISSIONS_DATA = [
  { id: 'indicators', label: 'Показатели', hasSubmenu: false, allowedActions: ['read', 'add', 'edit', 'delete'] },
  {
    id: 'operations',
    label: 'Операции',
    hasSubmenu: true,
    allowedActions: ['read', 'add', 'edit', 'delete'],
    children: [
      { id: 'income', label: 'Поступление' },
      { id: 'payout', label: 'Выплата' },
      { id: 'transfer', label: 'Перемещение' },
      { id: 'accrual', label: 'Начисление' },
      { id: 'shipment', label: 'Отгрузка' },
      { id: 'delivery', label: 'Поставка' },
    ],
  },
  { id: 'deals', label: 'Сделки', hasSubmenu: false, allowedActions: ['edit'] },
  {
    id: 'reports',
    label: 'Отчёты',
    hasSubmenu: true,
    allowedActions: ['read'],
    children: [
      { id: 'cashflow', label: 'Движение денег (ДДС)' },
      { id: 'pnl', label: 'Прибыли и убытки (ОПУ)' },
      { id: 'balance', label: 'Баланс' },
    ],
  },
  {
    id: 'directories',
    label: 'Справочники',
    hasSubmenu: true,
    allowedActions: ['add'],
    children: [
      { id: 'counterparties', label: 'Контрагенты' },
      { id: 'categories', label: 'Учётные статьи' },
      { id: 'accounts', label: 'Мои счета' },
      { id: 'legalentities', label: 'Мои юрлица' },
      { id: 'products', label: 'Товары' },
      { id: 'services', label: 'Услуги' },
    ],
  },
  {
    id: 'settings',
    label: 'Настройки',
    hasSubmenu: true,
    allowedActions: ['edit'],
    children: [
      { id: 'general', label: 'Общие настройки' },
      { id: 'users', label: 'Пользователи' },
      { id: 'profile', label: 'Мой профиль' },
      { id: 'exchangerates', label: 'Курсы валют' },
    ],
  },
]

const CreateRole = () => {
  const router = useRouter()
  const [roleName, setRoleName] = useState('')
  const [permissions, setPermissions] = useState({})

  const handleCheckboxChange = (id, action) => {
    setPermissions((prev) => ({
      ...prev,
      [`${id}_${action}`]: !prev[`${id}_${action}`],
    }))
  }

  const handleParentCheckboxChange = (parent, action) => {
    const newValue = !permissions[`${parent.id}_${action}`]
    const updates = { [`${parent.id}_${action}`]: newValue }

    if (parent.children) {
      parent.children.forEach((child) => {
        updates[`${child.id}_${action}`] = newValue
      })
    }

    setPermissions((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const renderRow = (item, isChild = false) => {
    const id = item.id
    const actions = ['read', 'add', 'edit', 'delete']
    const isActionAllowed = (action) => {
      if (isChild) return true
      return item.allowedActions?.includes(action)
    }

    return (
      <tr key={id} className={cn('bg-white', isChild ? '' : 'font-medium')}>
        <td className={cn('px-4 py-3 text-[13px] text-[#344054] border-b border-[#f2f4f7]', isChild ? 'pl-10' : '')}>
          {!isChild ? item.label : ''}
        </td>
        <td className="px-4 py-3 text-[13px] text-[#344054] border-b border-[#f2f4f7]">
          {isChild ? item.label : ''}
        </td>
        {actions.map((action) => (
          <td key={action} className="px-4 py-3 text-[13px] text-[#344054] border-b border-[#f2f4f7] text-center w-[100px]">
            {isActionAllowed(action) && (
              <div className="flex justify-center items-center">
                <OperationCheckbox
                  checked={!!permissions[`${id}_${action}`]}
                  onChange={() => {
                    if (item.children) {
                      handleParentCheckboxChange(item, action)
                    } else {
                      handleCheckboxChange(id, action)
                    }
                  }}
                />
              </div>
            )}
          </td>
        ))}
      </tr>
    )
  }

  return (
    <div className="p-[30px] bg-white h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center gap-[80px] mb-[30px]">
        <h1 className="text-[18px] font-semibold text-[#1a1a1a] m-0">Должность</h1>
        <div className="w-[320px]">
          <Input
            placeholder="Введите email"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
      </div>

      {/* Permissions Table — Scrollable Table Wrapper */}
      <div className="border border-[#f2f4f7] rounded-[8px] overflow-hidden mb-[30px]">
        <table className="w-full border-collapse">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold capitalize text-[#344054] border-b border-[#f2f4f7]">Меню</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold capitalize text-[#344054] border-b border-[#f2f4f7]">Подменю</th>
              <th className="px-4 py-3 text-center w-[100px] text-[11px] font-semibold capitalize text-[#344054] border-b border-[#f2f4f7]">Читать</th>
              <th className="px-4 py-3 text-center w-[100px] text-[11px] font-semibold capitalize text-[#344054] border-b border-[#f2f4f7]">Добавить</th>
              <th className="px-4 py-3 text-center w-[100px] text-[11px] font-semibold capitalize text-[#344054] border-b border-[#f2f4f7]">Редактировать</th>
              <th className="px-4 py-3 text-center w-[100px] text-[11px] font-semibold capitalize text-[#344054] border-b border-[#f2f4f7]">Удалить</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS_DATA.map((item) => (
              <React.Fragment key={item.id}>
                {renderRow(item)}
                {item.children?.map((child) => renderRow(child, true))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-[12px] mt-auto pt-[20px]">
        <button
          className="px-[24px] py-[10px] rounded-[8px] bg-white border border-[#d0d5dd] text-[#344054] text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#f9fafb]"
          onClick={() => router.back()}
        >
          Отмена
        </button>
        <button
          className="px-[24px] py-[10px] rounded-[8px] bg-[#155eef] border border-[#155eef] text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#124bab]"
          onClick={() => console.log('Submit', { roleName, permissions })}
        >
          Добавить
        </button>
      </div>
    </div>
  )
}

// Utility to merge classNames
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default CreateRole
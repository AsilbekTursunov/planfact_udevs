'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
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
  { id: 'deals', label: 'Сделки', hasSubmenu: false, allowedActions: ['read', 'add', 'edit', 'delete'] },
  {
    id: 'reports',
    label: 'Отчёты',
    hasSubmenu: true,
    allowedActions: ['read', 'add', 'edit', 'delete'],
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
    allowedActions: ['read', 'add', 'edit', 'delete'],
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
    allowedActions: ['read', 'add', 'edit', 'delete'],
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
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      roleName: '',
      permissions: {}
    }
  })

  // Watch permissions to update checkbox UI
  const permissions = watch('permissions') || {}

  const handleCheckboxChange = (id, action) => {
    const key = `permissions.${id}_${action}`
    setValue(key, !permissions[`${id}_${action}`])
  }

  const handleParentCheckboxChange = (parent, action) => {
    const key = `permissions.${parent.id}_${action}`
    const newValue = !permissions[`${parent.id}_${action}`]

    setValue(key, newValue)

    if (parent.children) {
      parent.children.forEach((child) => {
        setValue(`permissions.${child.id}_${action}`, newValue)
      })
    }
  }

  const onSubmit = (data) => {
    console.log('Submit', data)
  }

  const renderRow = (item, isChild = false, parent = null) => {
    const id = item.id
    const actions = ['read', 'add', 'edit', 'delete']
    const isActionAllowed = (action) => {
      if (isChild) return true
      return item.allowedActions?.includes(action)
    }

    const isActionDisabled = (action) => {
      if (!isChild) return false
      if (!parent) return false
      // Child is disabled if parent column is not checked
      return !permissions[`${parent.id}_${action}`]
    }

    return (
      <tr key={id} className={cn('bg-white', isChild ? '' : 'font-medium')}>
        <td className={cn('px-4 py-3 text-sm text-[#344054] border-b border-[#f2f4f7]', isChild ? 'pl-10' : '')}>
          {!isChild ? item.label : ''}
        </td>
        <td className="px-4 py-3 text-sm text-[#344054] border-b border-[#f2f4f7]">
          {isChild ? item.label : ''}
        </td>
        {actions.map((action) => (
          <td key={action} className="px-4 py-3 text-sm text-[#344054] border-b border-[#f2f4f7] text-center w-[100px]">
            {isActionAllowed(action) && (
              <div className="flex justify-center items-center">
                <OperationCheckbox
                  disabled={isActionDisabled(action)}
                  checked={!!permissions[`${id}_${action}`]}
                  onChange={() => {
                    if (isActionDisabled(action)) return

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className=" bg-white w-full h-full flex flex-col overflow-auto"
    >
      {/* Header Section */}
      <h1 className="text-[18px] p-4 font-semibold text-[#1a1a1a] m-0 sticky top-0 z-10 bg-white">Добавить новую должность</h1>
      <div className="flex items-center gap-5 mb-[30px] p-4">
        <h1 className="text-sm  text-[#1a1a1a] m-0">Должности</h1>
        <div className="w-[320px]">
          <Input
            placeholder="Введите название"
            hasError={!!errors.roleName}
            {...register('roleName', { required: true })}
          />
          {errors.roleName && <span className="text-xs text-red-500">Это поле обязательно</span>}
        </div>
      </div>

      {/* Permissions Table — Scrollable Table Wrapper */}
      <div className="w-fit rounded-[8px] mx-4 mb-[30px]">
        <table className="w-fit border-collapse">
          <thead className="bg-gray-ucode-50">
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
                {item.children?.map((child) => renderRow(child, true, item))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <div className="flex  justify-end gap-[12px] mt-auto pt-[20px]">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => router.back()}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="primary-btn"
          >
            Добавить
          </button>
        </div>
      </div>
    </form>
  )
}

// Utility to merge classNames
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default CreateRole
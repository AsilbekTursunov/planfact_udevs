"use client"

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import styles from './CreateChartOfAccountsModal.module.scss'
import { useUcodeRequestMutation } from '../../../hooks/useDashboard'
import { authStore } from '../../../store/auth.store'
import { useForm, Controller } from 'react-hook-form'
import CustomModal from '../../shared/CustomModal'
import SelectStatiya from '../../ReadyComponents/SelectStatiya'
import Input from '../../shared/Input'
import TextArea from '../../shared/TextArea'
import { Loader2 } from 'lucide-react'

const tabToTipMap = {
  'income': 'Доходы',
  'expense': 'Расходы',
  'assets': 'Актив',
  'liabilities': 'Обязательства',
  'capital': 'Капитал'
}

const tabs = [
  { key: 'income', label: 'Доходы' },
  { key: 'expense', label: 'Расходы' },
  { key: 'assets', label: 'Активы' },
  { key: 'liabilities', label: 'Обязательства' },
  { key: 'capital', label: 'Капитал' }
]

export default function CreateChartOfAccountsModal({ isOpen, onClose, initialTab = 'income', parentCategory = null }) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nazvanie: '',
      chart_of_accounts_id_2: '',
      komentariy: ''
    }
  })

  const { mutateAsync: createAccount } = useUcodeRequestMutation()

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      reset({
        nazvanie: '',
        chart_of_accounts_id_2: parentCategory?.guid || '',
        komentariy: ''
      })
    }
  }, [isOpen, initialTab, parentCategory, reset])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        nazvanie: data.nazvanie.trim(),
        tip: [tabToTipMap[activeTab]],
        static: false,
        attributes: null,
        legal_entity_id: authStore?.userData?.legal_entity_id,
        ...(data.chart_of_accounts_id_2 && { chart_of_accounts_id_2: data.chart_of_accounts_id_2 }),
        ...(data.komentariy && { komentariy: data.komentariy }),
      }

      await createAccount({
        method: "create_chart_of_account",
        data: submitData,
      })

      queryClient.invalidateQueries({ queryKey: ['chartOfAccountsPlanFact'] })
      queryClient.invalidateQueries({ queryKey: ['chartOfAccountsV2'] })
      queryClient.invalidateQueries({ queryKey: ['get_chart_of_accounts'] })

      onClose()
    } catch (error) {
      console.error('Error creating chart of accounts:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      className={'p-0'}
    >
      <div className="border-b border-gray-200  p-4">
        <h2 className="text-lg font-semibold">Создание учетной статьи</h2>
      </div>

      <div className="">
        {/* Tabs */}
        <div className="flex items-center px-6 pt-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2  border-b-2 cursor-pointer",
                activeTab === tab.key ? "border-blue-500 text-blue-500" : "border-transparent text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="">
          <div className="p-6 space-y-5">
            <div className="flex flex-col gap-0.5">
              <label className={"text-sm text-slate-700 mb-1"}>
                Название <span className={'text-red-ucode'}>*</span>
              </label>
              <div className={""}>
                <Controller
                  name="nazvanie"
                  control={control}
                  rules={{ required: 'Укажите название статьи' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Укажите название статьи"
                      hasError={!!errors.nazvanie}
                      className="h-10"
                    />
                  )}
                />
                {errors.nazvanie && (
                  <div className={styles.errorMessage}>{errors.nazvanie.message}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className={"text-sm text-slate-700 mb-1"}>Относится к</label>
              <div className={""}>
                <Controller
                  name="chart_of_accounts_id_2"
                  control={control}
                  render={({ field }) => (
                    <SelectStatiya
                      selectedValue={field.value}
                      setSelectedValue={field.onChange}
                      placeholder="Выберите родительскую статью"
                      shownParent={tabToTipMap[activeTab]}
                      hasError={!!errors.chart_of_accounts_id_2}
                      className="h-10! bg-white"
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className={"text-sm text-slate-700 mb-1"}>Комментарий</label>
              <div className={""}>
                <Controller
                  name="komentariy"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder="Пояснение к статье"
                      className={''}
                      rows={4}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div className={"flex justify-end gap-2 py-3 border-t px-6"}>
            <button
              type="button"
              onClick={onClose}
              className={"secondary-btn"}
              disabled={isSubmitting}
            >
              Отменить
            </button>
            <button
              type="submit"
              className={"primary-btn px-6! py-2!"}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </CustomModal>
  )
}

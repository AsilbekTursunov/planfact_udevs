"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/app/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import styles from './CreateChartOfAccountsModal.module.scss'
import { useUcodeRequestMutation, useUpdateChartOfAccounts } from '../../../hooks/useDashboard'
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

const tipToTabMap = {
  'Доходы': 'income',
  'Расходы': 'expense',
  'Актив': 'assets',
  'Обязательства': 'liabilities',
  'Капитал': 'capital'
}

const tabs = [
  { key: 'income', label: 'Доходы' },
  { key: 'expense', label: 'Расходы' },
  { key: 'assets', label: 'Активы' },
  { key: 'liabilities', label: 'Обязательства' },
  { key: 'capital', label: 'Капитал' }
]

/**
 * CreateChartOfAccountsModal
 *
 * Unified modal for creating and editing chart of accounts entries.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - initialTab: 'income' | 'expense' | 'assets' | 'liabilities' | 'capital'
 * - parentCategory: { guid, name, ... } | null  — used when creating a child category
 * - category: { guid, name, tip, komentariy, chart_of_accounts_id_2, ... } | null — if provided, enters edit mode
 */
export default function CreateChartOfAccountsModal({
  isOpen,
  onClose,
  initialTab = 'income',
  parentCategory = null,
  category = null,
}) {
  const isEditMode = !!category?.guid
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(initialTab)

  const { mutateAsync: createAccount } = useUcodeRequestMutation()
  const updateMutation = useUpdateChartOfAccounts()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      nazvanie: '',
      chart_of_accounts_id_2: '',
      komentariy: ''
    }
  })

  // Initialize form when modal opens
  useEffect(() => {
    if (!isOpen) return

    if (isEditMode) {
      const categoryTip = category.tip && category.tip.length > 0 ? category.tip[0] : 'Доходы'
      setActiveTab(tipToTabMap[categoryTip] || 'income')
      reset({
        nazvanie: category.name || '',
        chart_of_accounts_id_2: category.chart_of_accounts_id_2 || '',
        komentariy: category.komentariy || ''
      })
    } else {
      setActiveTab(initialTab)
      reset({
        nazvanie: '',
        chart_of_accounts_id_2: parentCategory?.guid || '',
        komentariy: ''
      })
    }
  }, [isOpen, isEditMode, category, initialTab, parentCategory, reset])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        const submitData = {
          guid: category.guid,
          nazvanie: data.nazvanie.trim(),
          tip: [tabToTipMap[activeTab]],
          ...(data.chart_of_accounts_id_2 && { chart_of_accounts_id_2: data.chart_of_accounts_id_2 }),
          ...(data.komentariy && { komentariy: data.komentariy }),
        }
        await updateMutation.mutateAsync(submitData)
      } else {
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
      }

      queryClient.invalidateQueries({ queryKey: ['chartOfAccountsPlanFact'] })
      queryClient.invalidateQueries({ queryKey: ['chartOfAccountsV2'] })
      queryClient.invalidateQueries({ queryKey: ['get_chart_of_accounts'] })

      onClose()
    } catch (error) {
      console.error('Error saving chart of accounts:', error)
    }
  }

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} className={'p-0 w-[640px]'}>
      <div>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditMode ? 'Редактировать учетную статью' : 'Создать учетную статью'}
          </h2>
        </div>

        <div className={styles.content}>
          {/* Tabs */}
          <div className={styles.tabsContainer}>
            {tabs.map((tab, index) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  styles.tab,
                  index === 0 && styles.first,
                  index === tabs.length - 1 && styles.last,
                  index > 0 && styles.notFirst,
                  activeTab === tab.key ? styles.active : styles.inactive
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form id="chart-of-accounts-form" className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className={styles.formRow}>
              <label className={styles.label}>
                Название <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputContainer}>
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
                      className={cn(styles.input, errors.nazvanie && styles.inputError)}
                    />
                  )}
                />
                {errors.nazvanie && (
                  <div className={styles.errorMessage}>{errors.nazvanie.message}</div>
                )}
              </div>
            </div>

            {/* Parent category */}
            <div className={styles.formRow}>
              <label className={styles.label}>Относится к</label>
              <div className={styles.inputContainer}>
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
                      className="bg-white"
                    />
                  )}
                />
              </div>
            </div>

            {/* Comment */}
            <div className={styles.formRow}>
              <label className={styles.label}>Комментарий</label>
              <div className={styles.inputContainer}>
                <Controller
                  name="komentariy"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder="Пояснение к статье"
                      className={styles.textarea}
                      rows={4}
                    />
                  )}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            className="secondary-btn"
            disabled={isSubmitting}
          >
            Отменить
          </button>
          <button
            type="submit"
            form="chart-of-accounts-form"
            className="primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <Loader2 className="animate-spin" />
              : isEditMode ? 'Сохранить' : 'Создать'
            }
          </button>
        </div>
      </div>
    </CustomModal>
  )
}

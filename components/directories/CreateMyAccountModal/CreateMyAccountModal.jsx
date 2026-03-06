"use client"

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/app/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateMyAccount, useUpdateMyAccount, useCurrencies, useLegalEntitiesPlanFact } from '@/hooks/useDashboard'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import CreateLegalEntityModal from '@/components/directories/CreateLegalEntityModal/CreateLegalEntityModal'
import styles from './CreateMyAccountModal.module.scss'
import Input from '@/components/shared/Input'
import CustomDatePicker from '../../shared/DatePicker'

export default function CreateMyAccountModal({ isOpen, onClose, account = null }) {
  const queryClient = useQueryClient()
  const createMutation = useCreateMyAccount()
  const updateMutation = useUpdateMyAccount()
  const isEdit = !!account && !!account.guid

  const [formData, setFormData] = useState({
    nazvanie: '',
    tip: [],
    nachalьnyy_ostatok: '',
    data_sozdaniya: new Date().toISOString().split('T')[0],
    currenies_id: '',
    komentariy: '',
    legal_entity_id: null
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isLegalEntityModalOpen, setIsLegalEntityModalOpen] = useState(false)

  // Fetch currencies
  const { data: currenciesData, isLoading: loadingCurrencies } = useCurrencies({ limit: 100 })

  // Fetch legal entities using new invoke_function API
  const { data: legalEntitiesData, isLoading: loadingLegalEntities } = useLegalEntitiesPlanFact({
    page: 1,
    limit: 100,
  })

  // Transform currencies data
  const currencies = useMemo(() => {
    return (currenciesData?.data?.data?.response || currenciesData?.data?.response || []).map(item => ({
      guid: item.guid,
      label: `${item.kod || ''} (${item.nazvanie || ''})`.trim(),
      kod: item.kod || '',
      nazvanie: item.nazvanie || ''
    }))
  }, [currenciesData])

  // Transform legal entities data
  const legalEntities = useMemo(() => {
    return (legalEntitiesData?.data?.data?.data || []).map(item => ({
      guid: item.guid,
      label: item.nazvanie || ''
    }))
  }, [legalEntitiesData])

  // Account types
  const accountTypes = [
    { value: 'Наличный', label: 'Наличный' },
    { value: 'Безналичный', label: 'Безналичный' },
    { value: 'Карта физлица', label: 'Карта физлица' },
    { value: 'Электронный', label: 'Электронный' }
  ]

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      // Small delay to ensure smooth animation
      requestAnimationFrame(() => {
        setIsVisible(true)
      })

      // Initialize form data
      if (isEdit && account && account.guid) {
        // Editing existing account
        setFormData({
          nazvanie: account.nazvanie || '',
          tip: Array.isArray(account.tip) ? account.tip : [],
          nachalьnyy_ostatok: account.nachalьnyy_ostatok || '',
          data_sozdaniya: account.data_sozdaniya
            ? new Date(account.data_sozdaniya).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          currenies_id: account.currenies_id || '',
          komentariy: account.komentariy || '',
          legal_entity_id: account.legal_entity_id || null
        })
      } else {
        // Creating new account
        setFormData({
          nazvanie: '',
          tip: [],
          nachalьnyy_ostatok: '',
          data_sozdaniya: new Date().toISOString().split('T')[0],
          currenies_id: '',
          komentariy: '',
          legal_entity_id: null
        })
      }
      setErrors({})
    } else {
      setIsVisible(false)
    }
  }, [isOpen, account, isEdit])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 250)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nazvanie.trim()) {
      newErrors.nazvanie = 'Укажите название'
    }

    if (!formData.legal_entity_id) {
      newErrors.legal_entity_id = 'Выберите юрлицо'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
 
    try {
      const submitData = {
        nazvanie: formData.nazvanie.trim(),
        tip: formData.tip,
        ...(formData.nachalьnyy_ostatok && { nachalьnyy_ostatok: Number(formData.nachalьnyy_ostatok) }),
        ...(formData.data_sozdaniya && {
          data_sozdaniya: formData.data_sozdaniya
        }),
        ...(formData.currenies_id && { currenies_id: formData.currenies_id }),
        ...(formData.komentariy && { komentariy: formData.komentariy }),
        ...(formData.legal_entity_id && { legal_entity_id: formData.legal_entity_id }),
        // attributes: {}
      }

      if (isEdit && account && account.guid) {
        submitData.guid = account.guid
        await updateMutation.mutateAsync(submitData)
      } else {
        await createMutation.mutateAsync(submitData)
      }

      handleClose()
    } catch (error) {
      setErrors({ submit: error.message || `Не удалось ${isEdit ? 'обновить' : 'создать'} счет` })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVisible && !isOpen) return null

  const modalContent = (
    <>
      <div
        className={cn(styles.overlay, isClosing && styles.closing, !isClosing && isVisible && styles.opening)}
        onClick={handleClose}
      />
      <div
        className={cn(styles.modal, isClosing && styles.closing, !isClosing && isVisible && styles.opening)}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Редактирование счета' : 'Создание счета'}</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.form}>
            {/* Название */}
            <div className={styles.formRow}>
              <label className={styles.label}>
                Название <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputContainer}>
                <Input
                  type="text"
                  value={formData.nazvanie}
                  onChange={(e) => setFormData({ ...formData, nazvanie: e.target.value })}
                  placeholder="Например, ВТБ"
                  className={cn(errors.nazvanie && styles.inputError)}
                />
                {errors.nazvanie && (
                  <div className={styles.errorMessage}>{errors.nazvanie}</div>
                )}
              </div>
            </div>

            {/* Юрлицо */}
            <div className={styles.formRow}>
              <label className={styles.label}>Юрлицо <span className={styles.required}>*</span></label>
              <div className={styles.inputContainer}>
                <GroupedSelect
                  data={legalEntities}
                  value={formData.legal_entity_id}
                  onChange={(value) => setFormData({ ...formData, legal_entity_id: value })}
                  placeholder="Выберите юрлицо или создайте новое"
                  groupBy={false}
                  labelKey="label"
                  valueKey="guid"
                  disabled={false}
                  loading={loadingLegalEntities}
                  onCreate={() => setIsLegalEntityModalOpen(true)}
                  createButtonText="Создать юрлицо"
                  className="flex-1"
                />
                {errors.legal_entity_id && (
                  <div className={styles.errorMessage}>{errors.legal_entity_id}</div>
                )}
              </div>
            </div>

            {/* Тип */}
            <div className={styles.formRow}>
              <label className={styles.label}>
                Выберите тип счета
              </label>
              <div className={styles.inputContainer}>
                <GroupedSelect
                  data={accountTypes}
                  value={formData.tip.length > 0 ? formData.tip[0] : ''}
                  onChange={(value) => setFormData({ ...formData, tip: value ? [value] : [] })}
                  placeholder="Выберите тип"
                  groupBy={false}
                  labelKey="label"
                  valueKey="value"
                  className="flex-1"
                /> 
              </div>
            </div>

            {/* Начальный остаток - показываем только при создании */}
            {!isEdit && (
              <div className={styles.formRow}>
                <label className={styles.label}>Начальный остаток</label>
                <div className={styles.inputGroup}>
                  <Input
                    type="number"
                    value={formData.nachalьnyy_ostatok}
                    onChange={(e) => setFormData({ ...formData, nachalьnyy_ostatok: e.target.value })}
                    placeholder="0"
                    className={styles.input}
                    onWheel={(e) => e.target.blur()}
                  />

                  <CustomDatePicker
                    value={formData.data_sozdaniya}
                    onChange={(value) => setFormData({ ...formData, data_sozdaniya: value })}
                    placeholder="Выберите дату"
                    format='YYYY-MM-DD'
                    className={styles.datePicker}
                  />
                  {/* <DatePicker
                    value={formData.data_sozdaniya}
                    onChange={(value) => setFormData({ ...formData, data_sozdaniya: value })}
                    placeholder="Выберите дату"
                    className={styles.datePicker}
                  /> */}
                </div>
              </div>
            )}

            {/* Валюта */}
            <div className={styles.formRow}>
              <label className={styles.label}>
                Выберите валюту счета
              </label>
              <div className={styles.inputContainer}>
                <GroupedSelect
                  data={currencies}
                  value={formData.currenies_id}
                  onChange={(value) => setFormData({ ...formData, currenies_id: value })}
                  placeholder="Выберите валюту"
                  groupBy={false}
                  labelKey="label"
                  valueKey="guid"
                  loading={loadingCurrencies}
                  className="flex-1"
                /> 
              </div>
            </div>

            {/* Комментарий */}
            <div className={styles.formRow}>
              <label className={styles.label}>Комментарий</label>
              <div className={styles.inputContainer}>
                <textarea
                  value={formData.komentariy}
                  onChange={(e) => setFormData({ ...formData, komentariy: e.target.value })}
                  placeholder="Ваш комментарий или пояснение к этому счету"
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>

            {errors.submit && (
              <div className={styles.errorMessage}>{errors.submit}</div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={handleClose}>
            Отменить
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEdit ? 'Сохранение...' : 'Создание...') : (isEdit ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>

      {/* Legal Entity Modal */}
      <CreateLegalEntityModal
        isOpen={isLegalEntityModalOpen}
        onClose={(createdEntity) => {
          setIsLegalEntityModalOpen(false)
          if (createdEntity && createdEntity.guid) {
            // Select the newly created entity
            setFormData(prev => ({ ...prev, legal_entity_id: createdEntity.guid }))
            // Invalidate legal entities query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['legalEntitiesV2'] })
          }
        }}
        legalEntity={null}
      />
    </>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

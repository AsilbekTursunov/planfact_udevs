"use client"

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/app/lib/utils'
import { useUpdateCounterpartiesGroup } from '@/hooks/useDashboard'
import styles from '../CreateCounterpartyModal/CreateCounterpartyModal.module.scss'
import Input from '@/components/shared/Input'
import TextArea from '@/components/shared/TextArea'

export default function EditCounterpartyGroupModal({ isOpen, onClose, group }) {
  const queryClient = useQueryClient()
  const updateMutation = useUpdateCounterpartiesGroup()
  const [formData, setFormData] = useState({
    nazvanie_gruppy: '',
    opisanie_gruppy: ''
  })
  const [errors, setErrors] = useState({})
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen && group) {
      setIsClosing(false)
      setIsVisible(true)
      setFormData({
        nazvanie_gruppy: group.nazvanie_gruppy || group.nazvanie || '',
        opisanie_gruppy: group.opisanie_gruppy || ''
      })
      setErrors({})
    } else {
      setIsClosing(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }
  }, [isOpen, group])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nazvanie_gruppy.trim()) {
      newErrors.nazvanie_gruppy = 'Название группы обязательно'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const submitData = {
        guid: group.guid,
        nazvanie_gruppy: formData.nazvanie_gruppy.trim(),
        opisanie_gruppy: formData.opisanie_gruppy.trim() || '',
        data_sozdaniya: group.data_sozdaniya || new Date().toISOString(),
        data_obnovleniya: new Date().toISOString(),
        plan_fakt_admins_id: group.plan_fakt_admins_id || '',
        attributes: {}
      }

      await updateMutation.mutateAsync(submitData)
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
      queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
      
      handleClose()
    } catch (error) {
      console.error('Error updating group:', error)
    }
  }

  if (!isOpen && !isVisible) return null

  return (
    <>
      <div 
        className={cn(styles.overlay, isClosing ? styles.closing : styles.opening)}
        onClick={handleClose}
        style={{ zIndex: 1100 }}
      />

      <div 
        className={cn(styles.modal, isClosing ? styles.closing : styles.opening)}
        style={{ zIndex: 1101 }}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Редактировать группу контрагентов</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.content}>
          <div className={styles.form}>
            <div className={styles.formRow}>
              <label className={styles.label}>
                Название группы <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputContainer}>
                <Input
                  type="text"
                  value={formData.nazvanie_gruppy}
                  onChange={(e) => setFormData({ ...formData, nazvanie_gruppy: e.target.value })}
                  placeholder="Введите название группы"
                  className={cn(styles.input, errors.nazvanie_gruppy && styles.inputError)}
                />
                {errors.nazvanie_gruppy && (
                  <div className={styles.errorMessage}>{errors.nazvanie_gruppy}</div>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <label className={styles.label}>Описание группы</label>
              <div className={styles.inputContainer}>
                <TextArea
                  value={formData.opisanie_gruppy}
                  onChange={(e) => setFormData({ ...formData, opisanie_gruppy: e.target.value })}
                  placeholder="Введите описание группы"
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button 
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button 
              type="submit"
              className={styles.submitButton}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

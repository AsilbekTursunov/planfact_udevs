"use client"

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/app/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import Input from '@/components/shared/Input'
import TextArea from '@/components/shared/TextArea'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import { useChartOfAccountsPlanFact, useCreateCounterparty, useCreateCounterpartiesGroup, useCounterpartiesGroupsPlanFact, useUpdateCounterpartiesGroup, useDeleteCounterpartiesGroups } from '@/hooks/useDashboard'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { TreeSelect } from '@/components/common/TreeSelect/TreeSelect'
import EditCounterpartyGroupModal from '@/components/directories/EditCounterpartyGroupModal/EditCounterpartyGroupModal'
import { DeleteGroupConfirmModal } from '@/components/directories/DeleteGroupConfirmModal/DeleteGroupConfirmModal'
import styles from './CreateCounterpartyModal.module.scss'
import { GoPlusCircle, GoTrash } from 'react-icons/go'

export default function CreateCounterpartyModal({ isOpen, onClose, preselectedGroupId = null }) {
  const queryClient = useQueryClient()
  const createMutation = useCreateCounterparty()
  const createGroupMutation = useCreateCounterpartiesGroup()
  const deleteGroupMutation = useDeleteCounterpartiesGroups()
  const updateGroupMutation = useUpdateCounterpartiesGroup()

  const [activeTab, setActiveTab] = useState('counterparty') // 'counterparty' or 'group'
  const [details, setDetails] = useState(false)

  const [formData, setFormData] = useState({
    nazvanie: '',
    polnoe_imya: '',
    counterparties_group_id: '',
    gruppa: [],
    inn: '',
    kpp: [{ id: Date.now(), value: '' }],
    nomer_scheta: [{ id: Date.now(), value: '' }],
    primenyat_stat_i_po_umolchaniyu: false,
    chart_of_accounts_id: '',
    chart_of_accounts_id_2: '',
    komentariy: ''
  })

  const [groupFormData, setGroupFormData] = useState({
    nazvanie_gruppy: '',
    opisanie_gruppy: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [deletingGroup, setDeletingGroup] = useState(null)

  // Get chart of accounts for articles dropdowns
  const { data: chartOfAccountsData } = useChartOfAccountsPlanFact({ page: 1, limit: 100 })
  const chartOfAccountsRaw = chartOfAccountsData?.data?.data?.data || []

  // Flatten hierarchical structure to array
  const chartOfAccounts = useMemo(() => {
    const flatten = (items) => {
      let result = []
      items.forEach(item => {
        result.push(item)
        if (item.children && item.children.length > 0) {
          result = result.concat(flatten(item.children))
        }
      })
      return result
    }
    return Array.isArray(chartOfAccountsRaw) ? flatten(chartOfAccountsRaw) : []
  }, [chartOfAccountsRaw])

  // Get counterparties groups for dropdown
  const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact({ page: 1, limit: 100 })
  const counterpartiesGroups = counterpartiesGroupsData?.data?.data?.data || []

  // Transform chart of accounts for GroupedSelect
  const chartOfAccountsOptions = useMemo(() => {
    if (!Array.isArray(chartOfAccounts)) return []
    return chartOfAccounts.map(item => ({
      guid: item.guid,
      label: item.nazvanie || '',
      group: (Array.isArray(item.tip) && item.tip.length > 0) ? item.tip[0] : 'Без группы'
    }))
  }, [chartOfAccounts])

  // Build tree for chart of accounts - separate trees for income and expenses
  const chartOfAccountsTreeIncome = useMemo(() => {
    if (!Array.isArray(chartOfAccountsRaw) || chartOfAccountsRaw.length === 0) {
      return []
    }

    // Find the root item with tip "Доходы"
    const incomeRoot = chartOfAccountsRaw.find(item =>
      Array.isArray(item.tip) && item.tip.some(t => t && t.includes('Доход'))
    )

    if (!incomeRoot || !incomeRoot.children) {
      return []
    }

    // Convert to TreeSelect format
    const convertToTreeFormat = (items) => {
      return items.map(item => ({
        value: item.guid,
        title: item.nazvanie || 'Без названия',
        selectable: !!item.guid, // Only selectable if has guid
        expanded: false,
        tip: item.tip,
        children: item.children && item.children.length > 0
          ? convertToTreeFormat(item.children)
          : undefined
      }))
    }

    return convertToTreeFormat(incomeRoot.children)
  }, [chartOfAccountsRaw])

  const chartOfAccountsTreeExpense = useMemo(() => {
    if (!Array.isArray(chartOfAccountsRaw) || chartOfAccountsRaw.length === 0) return []

    // Find the root item with tip "Расходы"
    const expenseRoot = chartOfAccountsRaw.find(item =>
      Array.isArray(item.tip) && item.tip.some(t => t && t.includes('Расход'))
    )

    if (!expenseRoot || !expenseRoot.children) return []

    // Convert to TreeSelect format
    const convertToTreeFormat = (items) => {
      return items.map(item => ({
        value: item.guid,
        title: item.nazvanie || 'Без названия',
        selectable: !!item.guid, // Only selectable if has guid
        expanded: false,
        tip: item.tip,
        children: item.children && item.children.length > 0
          ? convertToTreeFormat(item.children)
          : undefined
      }))
    }

    return convertToTreeFormat(expenseRoot.children)
  }, [chartOfAccountsRaw])

  // Transform counterparties groups for GroupedSelect
  const counterpartiesGroupsOptions = useMemo(() => {
    return counterpartiesGroups.map(item => ({
      guid: item.guid,
      label: item.nazvanie_gruppy || '',
      rawData: item // Add full group data for edit/delete
    }))
  }, [counterpartiesGroups])

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setIsVisible(true)
      setActiveTab('counterparty')
      setFormData({
        nazvanie: '',
        polnoe_imya: '',
        counterparties_group_id: preselectedGroupId || '',
        gruppa: [],
        inn: '',
        kpp: [{ id: Date.now(), value: '' }],
        nomer_scheta: [{ id: Date.now() + 1, value: '' }],
        primenyat_stat_i_po_umolchaniyu: false,
        chart_of_accounts_id: '',
        chart_of_accounts_id_2: '',
        komentariy: ''
      })
      setGroupFormData({
        nazvanie_gruppy: '',
        opisanie_gruppy: ''
      })
      setErrors({})
    }
  }, [isOpen, preselectedGroupId])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 250)
  }

  const handleAddKpp = () => {
    setFormData(prev => ({
      ...prev,
      kpp: [...prev.kpp, { id: Date.now(), value: '' }]
    }))
  }

  const handleRemoveKpp = (id) => {
    setFormData(prev => ({
      ...prev,
      kpp: prev.kpp.filter(item => item.id !== id)
    }))
  }

  const handleKppChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      kpp: prev.kpp.map(item => item.id === id ? { ...item, value } : item)
    }))
  }

  const handleAddAccount = () => {
    setFormData(prev => ({
      ...prev,
      nomer_scheta: [...prev.nomer_scheta, { id: Date.now(), value: '' }]
    }))
  }

  const handleRemoveAccount = (id) => {
    setFormData(prev => ({
      ...prev,
      nomer_scheta: prev.nomer_scheta.filter(item => item.id !== id)
    }))
  }

  const handleAccountChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      nomer_scheta: prev.nomer_scheta.map(item => item.id === id ? { ...item, value } : item)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nazvanie.trim()) {
      newErrors.nazvanie = 'Укажите название'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateGroupForm = () => {
    const newErrors = {}

    if (!groupFormData.nazvanie_gruppy.trim()) {
      newErrors.nazvanie_gruppy = 'Укажите название группы'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (activeTab === 'group') {
      if (!validateGroupForm()) return

      setIsSubmitting(true)
      try {
        const submitData = {
          nazvanie_gruppy: groupFormData.nazvanie_gruppy.trim(),
          ...(groupFormData.opisanie_gruppy && { opisanie_gruppy: groupFormData.opisanie_gruppy }),
          data_sozdaniya: new Date().toISOString(),
          attributes: {}
        }

        await createGroupMutation.mutateAsync(submitData)

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
        queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })

        handleClose()
      } catch (error) {
        console.error('Error creating counterparties group:', error)
        setErrors({ submit: error.message || 'Не удалось создать группу контрагентов' })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      if (!validateForm()) return

      setIsSubmitting(true)
      try {
        // Определяем тип на основе выбранных статей
        let tip = []
        if (formData.chart_of_accounts_id && !formData.chart_of_accounts_id_2) {
          tip = ['Плательщик']
        } else if (!formData.chart_of_accounts_id && formData.chart_of_accounts_id_2) {
          tip = ['Получатель']
        } else if (formData.chart_of_accounts_id && formData.chart_of_accounts_id_2) {
          tip = ['Смешанный']
        }

        const now = new Date()

        // Process KPP
        const kppValues = formData.kpp.filter(k => k.value && k.value.toString().trim() !== '').map(k => k.value)
        const validKpp = kppValues.length > 1 ? kppValues.map(Number) : (kppValues.length === 1 ? Number(kppValues[0]) : undefined)

        // Process Account Numbers
        const accountValues = formData.nomer_scheta.filter(a => a.value && a.value.toString().trim() !== '').map(a => a.value)
        const validAccount = accountValues.length > 1 ? accountValues.map(Number) : (accountValues.length === 1 ? Number(accountValues[0]) : undefined)

        const submitData = {
          nazvanie: formData.nazvanie.trim(),
          ...(formData.polnoe_imya && { polnoe_imya: formData.polnoe_imya }),
          ...(formData.gruppa && formData.gruppa.length > 0 && { gruppa: formData.gruppa }),
          ...(tip.length > 0 && { tip }),
          ...(formData.inn && { inn: Number(formData.inn) }),
          ...(validKpp && { kpp: validKpp }),
          ...(validAccount && { nomer_scheta: validAccount }),
          ...(formData.counterparties_group_id && { counterparties_group_id: formData.counterparties_group_id }),
          primenyat_stat_i_po_umolchaniyu: formData.primenyat_stat_i_po_umolchaniyu,
          ...(formData.chart_of_accounts_id && { chart_of_accounts_id: formData.chart_of_accounts_id }),
          ...(formData.chart_of_accounts_id_2 && { chart_of_accounts_id_2: formData.chart_of_accounts_id_2 }),
          ...(formData.komentariy && { komentariy: formData.komentariy }),
          data_sozdaniya: now.toISOString(),
          attributes: {}
        }

        await createMutation.mutateAsync(submitData) 

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
        queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })

        handleClose()
      } catch (error) {
        console.error('Error creating counterparty:', error)
        setErrors({ submit: error.message || 'Не удалось создать контрагента' })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen && !isVisible) return null

  const modalContent = (
    <>
      <div
        className={cn(styles.overlay, isClosing ? styles.closing : styles.opening)}
        onClick={handleClose}
      />

      <div
        className={cn(styles.modal, isClosing ? styles.closing : styles.opening)}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            {activeTab === 'counterparty' ? 'Создать контрагента' : 'Создать группу контрагентов'}
          </h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <button
              onClick={() => setActiveTab('counterparty')}
              className={cn(
                styles.tab,
                styles.first,
                activeTab === 'counterparty' ? styles.active : styles.inactive
              )}
            >
              Создать контрагента
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={cn(
                styles.tab,
                styles.last,
                styles.notFirst,
                activeTab === 'group' ? styles.active : styles.inactive
              )}
            >
              Создать группу
            </button>
          </div>

          {/* Form */}
          <div className={styles.form}>
            {activeTab === 'counterparty' ? (
              <>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Название <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputContainer}>
                    <Input
                      type="text"
                      value={formData.nazvanie}
                      onChange={(e) => setFormData({ ...formData, nazvanie: e.target.value })}
                      placeholder="Например, Васильев"
                      className={cn(styles.input, errors.nazvanie && styles.inputError)}
                    />
                    {errors.nazvanie && (
                      <div className={styles.errorMessage}>{errors.nazvanie}</div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Полное название</label>
                  <div className={styles.inputContainer}>
                    <Input
                      type="text"
                      value={formData.polnoe_imya}
                      onChange={(e) => setFormData({ ...formData, polnoe_imya: e.target.value })}
                      placeholder="Например, ООО «Васильев и партнеры»"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Группа контрагентов</label>
                  <div className={styles.inputContainer}>
                    <GroupedSelect
                      data={counterpartiesGroupsOptions}
                      value={formData.counterparties_group_id}
                      onChange={(value) => setFormData({ ...formData, counterparties_group_id: value })}
                      placeholder="Выберите группу контрагентов"
                      groupBy={false}
                      labelKey="label"
                      valueKey="guid"
                      className="flex-1"
                      showGroupActions={false}
                      onEditGroup={(item) => setEditingGroup(item.rawData)}
                      onDeleteGroup={(item) => setDeletingGroup(item.rawData)}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <label className={styles.label}></label>
                  <div onClick={() => setDetails(!details)} className={styles.requisites}>
                    <p>Реквизиты</p>
                  </div>
                </div>

                <div className={cn(styles.requisitesContainer, details && styles.active)}>
                  <div className={styles.formRow}>
                    <label className={styles.label}>
                      ИНН
                      <span className={styles.infoIcon}>?</span>
                    </label>
                    <div className={styles.inputContainer}>
                      <Input
                        type="number"
                        value={formData.inn}
                        onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                        placeholder="Укажите ИНН"
                        className={cn(styles.input, styles.requisitesInput)}
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.label}>КПП</label>
                    <div className={styles.multiInputContainer}>
                      {formData.kpp.map((item, index) => (
                        <div key={item.id} className={styles.inputWithAction}>
                          <div className={styles.inputWrapper}>
                            <Input
                              type="number"
                              value={item.value}
                              onChange={(e) => handleKppChange(item.id, e.target.value)}
                              placeholder="Укажите КПП"
                              className={cn(styles.input, styles.requisitesInput)}
                              onWheel={(e) => e.target.blur()}
                            />
                          </div>
                          {index === 0 ? (
                            <button className={styles.actionButton} onClick={handleAddKpp}>
                              <GoPlusCircle size={20} />
                            </button>
                          ) : (
                            <button className={styles.actionButton} onClick={() => handleRemoveKpp(item.id)}>
                              <GoTrash size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.label}>Номер счета</label>
                    <div className={styles.multiInputContainer}>
                      {formData.nomer_scheta.map((item, index) => (
                        <div key={item.id} className={styles.inputWithAction}>
                          <div className={styles.inputWrapper}>
                            <Input
                              type="text"
                              value={item.value}
                              onChange={(e) => handleAccountChange(item.id, e.target.value)}
                              placeholder="Укажите номер счета"
                              className={cn(styles.input, styles.requisitesInput)}
                            />
                          </div>
                          {index === 0 ? (
                            <button className={styles.actionButton} onClick={handleAddAccount}>
                              <GoPlusCircle size={20} />
                            </button>
                          ) : (
                            <button className={styles.actionButton} onClick={() => handleRemoveAccount(item.id)}>
                              <GoTrash size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}></label>
                  <OperationCheckbox
                    checked={formData.primenyat_stat_i_po_umolchaniyu}
                    onChange={(e) => setFormData({ ...formData, primenyat_stat_i_po_umolchaniyu: e.target.checked })}
                    label="Применять статьи по умолчанию "
                  />
                  <label className={styles.infoIcon}>?</label>
                </div>

                {formData.primenyat_stat_i_po_umolchaniyu && (
                  <>
                    <div className={styles.formRow}>
                      <label className={styles.label}>Статья для поступлений</label>
                      <div className={styles.inputContainer}>
                        <TreeSelect
                          data={chartOfAccountsTreeIncome}
                          value={formData.chart_of_accounts_id}
                          onChange={(value) => setFormData({ ...formData, chart_of_accounts_id: value })}
                          placeholder="Выберите статью"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <label className={styles.label}>Статья для выплат</label>
                      <div className={styles.inputContainer}>
                        <TreeSelect
                          data={chartOfAccountsTreeExpense}
                          value={formData.chart_of_accounts_id_2}
                          onChange={(value) => setFormData({ ...formData, chart_of_accounts_id_2: value })}
                          placeholder="Выберите статью"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.formRow}>
                  <label className={styles.label}>Комментарий</label>
                  <div className={styles.inputContainer}>
                    <TextArea
                      value={formData.komentariy}
                      onChange={(e) => setFormData({ ...formData, komentariy: e.target.value })}
                      placeholder="Пояснение к контрагенту"
                      className={styles.textarea}
                      rows={4}
                    />
                  </div>
                </div>

                {errors.submit && (
                  <div className={styles.errorMessage}>{errors.submit}</div>
                )}
              </>
            ) : (
              <>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Название <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputContainer}>
                      <Input
                      type="text"
                      value={groupFormData.nazvanie_gruppy}
                      onChange={(e) => setGroupFormData({ ...groupFormData, nazvanie_gruppy: e.target.value })}
                      placeholder="Например, мои поставщики"
                      className={cn(styles.input, errors.nazvanie_gruppy && styles.inputError)}
                    />
                    {errors.nazvanie_gruppy && (
                      <div className={styles.errorMessage}>{errors.nazvanie_gruppy}</div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Комментарий</label>
                  <div className={styles.inputContainer}>
                      <TextArea
                      value={groupFormData.opisanie_gruppy}
                      onChange={(e) => setGroupFormData({ ...groupFormData, opisanie_gruppy: e.target.value })}
                      placeholder="Пояснение к группе контрагентов"
                      className={styles.textarea}
                      rows={4}
                    />
                  </div>
                </div>

                {errors.submit && (
                  <div className={styles.errorMessage}>{errors.submit}</div>
                )}
              </>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerRight}>
            <button
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Отменить
            </button>
            <button
              onClick={handleSubmit}
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Group Modal */}
      {editingGroup && (
        <EditCounterpartyGroupModal
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          group={editingGroup}
        />
      )}

      {/* Delete Group Confirmation Modal */}
      <DeleteGroupConfirmModal
        isOpen={!!deletingGroup}
        group={deletingGroup}
        onConfirm={async () => {
          if (deletingGroup?.guid) {
            try {
              await deleteGroupMutation.mutateAsync([deletingGroup.guid])
              setDeletingGroup(null)
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
              queryClient.invalidateQueries({ queryKey: ['counterpartiesV2'] })
            } catch (error) {
              console.error('Error deleting group:', error)
            }
          }
        }}
        onCancel={() => setDeletingGroup(null)}
        isDeleting={deleteGroupMutation.isPending}
      />
    </>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}

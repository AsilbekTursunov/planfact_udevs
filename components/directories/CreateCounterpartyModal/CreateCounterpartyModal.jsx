"use client"

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/app/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import Input from '@/components/shared/Input'
import TextArea from '@/components/shared/TextArea'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import { useCreateCounterparty, useCreateCounterpartiesGroup, useCounterpartiesGroupsPlanFact, useUpdateCounterpartiesGroup, useDeleteCounterpartiesGroups, useUpdateCounterparty } from '@/hooks/useDashboard'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import SinglSelectStatiya from '@/components/ReadyComponents/SingleSelectStatiya'
import EditCounterpartyGroupModal from '@/components/directories/EditCounterpartyGroupModal/EditCounterpartyGroupModal'
import { DeleteGroupConfirmModal } from '@/components/directories/DeleteGroupConfirmModal/DeleteGroupConfirmModal'
import styles from './CreateCounterpartyModal.module.scss'
import { PlusCircle, PlusSquare, Trash2 } from 'lucide-react'


export default function CreateCounterpartyModal({ isOpen, onClose, preselectedGroupId = null, counterpartyData = null, onSuccess = null }) {
  const queryClient = useQueryClient()
  const createMutation = useCreateCounterparty()
  const updateMutation = useUpdateCounterparty()
  const createGroupMutation = useCreateCounterpartiesGroup()
  const deleteGroupMutation = useDeleteCounterpartiesGroups()
  const updateGroupMutation = useUpdateCounterpartiesGroup()

  const [activeTab, setActiveTab] = useState('counterparty') // 'counterparty' or 'group'
  const [details, setDetails] = useState(false)

  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [deletingGroup, setDeletingGroup] = useState(null)

  const { register, handleSubmit, control, watch, reset, setError, formState: { errors, isSubmitting: isSubmittingCounterparty } } = useForm({
    defaultValues: {
      nazvanie: '',
      polnoe_imya: '',
      counterparties_group_id: '',
      gruppa: [],
      inn: '',
      kpp: [{ value: '' }],
      nomer_scheta: [{ value: '' }],
      primenyat_stat_i_po_umolchaniyu: false,
      chart_of_accounts_id: '',
      chart_of_accounts_id_2: '',
      komentariy: ''
    }
  })

  const { fields: kppFields, append: appendKpp, remove: removeKpp } = useFieldArray({
    control,
    name: "kpp"
  })

  const { fields: accountFields, append: appendAccount, remove: removeAccount } = useFieldArray({
    control,
    name: "nomer_scheta"
  })

  const primenyat_stat_i_po_umolchaniyu = watch('primenyat_stat_i_po_umolchaniyu')

  const groupForm = useForm({
    defaultValues: {
      nazvanie_gruppy: '',
      opisanie_gruppy: ''
    }
  })

  const { register: registerGroup, handleSubmit: handleSubmitGroup, formState: { errors: groupErrors, isSubmitting: isSubmittingGroup }, reset: resetGroup, setError: setErrorGroup } = groupForm

  const isSubmitting = isSubmittingCounterparty || isSubmittingGroup

  // Get counterparties groups for dropdown
  const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact({ page: 1, limit: 100 })
  const counterpartiesGroups = useMemo(() => {
    if (!counterpartiesGroupsData?.data?.data?.data) return []
    return counterpartiesGroupsData?.data?.data?.data
  }, [counterpartiesGroupsData])

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

      if (counterpartyData) {
        const rawData = counterpartyData.rawData || counterpartyData

        // Extraction logic similar to EditCounterpartyModal
        const getChartOfAccountsId = (field) => {
          if (rawData[field]) {
            if (typeof rawData[field] === 'string' && rawData[field].length === 36) return rawData[field]
            if (rawData[field]?.guid) return rawData[field].guid
          }
          const dataField = `${field}_data`
          if (rawData[dataField]?.guid) return rawData[dataField].guid
          return ''
        }

        const getCounterpartiesGroupId = () => {
          if (rawData.counterparties_group_id) {
            if (typeof rawData.counterparties_group_id === 'string' && rawData.counterparties_group_id.length === 36) return rawData.counterparties_group_id
          }
          if (rawData.counterparties_group_id_data?.guid) return rawData.counterparties_group_id_data.guid
          return preselectedGroupId || ''
        }

        reset({
          nazvanie: rawData.nazvanie || '',
          polnoe_imya: rawData.polnoe_imya || '',
          counterparties_group_id: getCounterpartiesGroupId(),
          gruppa: rawData.gruppa || [],
          inn: rawData.inn ? String(rawData.inn) : '',
          kpp: rawData.kpp
            ? (Array.isArray(rawData.kpp) ? rawData.kpp.map(v => ({ value: String(v) })) : [{ value: String(rawData.kpp) }])
            : [{ value: '' }],
          nomer_scheta: rawData.account_number
            ? (Array.isArray(rawData.account_number) ? rawData.account_number.map(v => ({ value: String(v) })) : [{ value: String(rawData.account_number) }])
            : [{ value: '' }],
          primenyat_stat_i_po_umolchaniyu: rawData.primenyat_stat_i_po_umolchaniyu || false,
          chart_of_accounts_id: getChartOfAccountsId('chart_of_accounts_id'),
          chart_of_accounts_id_2: getChartOfAccountsId('chart_of_accounts_id_2'),
          komentariy: rawData.komentariy || ''
        })
      } else {
        reset({
          nazvanie: '',
          polnoe_imya: '',
          counterparties_group_id: preselectedGroupId || '',
          gruppa: [],
          inn: '',
          kpp: [{ value: '' }],
          nomer_scheta: [{ value: '' }],
          primenyat_stat_i_po_umolchaniyu: false,
          chart_of_accounts_id: '',
          chart_of_accounts_id_2: '',
          komentariy: ''
        })
      }

      resetGroup({
        nazvanie_gruppy: '',
        opisanie_gruppy: ''
      })
    }
  }, [isOpen, preselectedGroupId, counterpartyData, reset, resetGroup])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 250)
  }

  const onSubmitGroup = async (data) => {
    try {
      const submitData = {
        nazvanie_gruppy: data.nazvanie_gruppy.trim(),
        ...(data.opisanie_gruppy && { opisanie_gruppy: data.opisanie_gruppy }),
      }

      await createGroupMutation.mutateAsync(submitData)
      queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsPlanFact'] })
      queryClient.invalidateQueries({ queryKey: ['counterpartiesPlanFact'] })
      handleClose()
    } catch (error) {
      console.error('Error creating counterparties group:', error)
      setErrorGroup('root', { message: error.message || 'Не удалось создать группу контрагентов' })
    }
  }

  const onSubmitCounterparty = async (data) => {
    try {
      let tip = []
      if (data.chart_of_accounts_id && !data.chart_of_accounts_id_2) {
        tip = ['Плательщик']
      } else if (!data.chart_of_accounts_id && data.chart_of_accounts_id_2) {
        tip = ['Получатель']
      } else if (data.chart_of_accounts_id && data.chart_of_accounts_id_2) {
        tip = ['Смешанный']
      }

      const kppValues = data.kpp.filter(k => k.value && k.value.toString().trim() !== '').map(k => k.value)
      const validKpp = kppValues.length > 0 ? kppValues : undefined

      const accountValues = data.nomer_scheta.filter(a => a.value && a.value.toString().trim() !== '').map(a => a.value)
      const validAccount = accountValues.length > 0 ? accountValues : undefined

      const isEdit = !!counterpartyData
      const guid = counterpartyData?.guid || counterpartyData?.rawData?.guid

      const submitData = {
        ...(isEdit && { guid }),
        nazvanie: data.nazvanie.trim(),
        ...(data.polnoe_imya && { polnoe_imya: data.polnoe_imya }),
        ...(data.gruppa && data.gruppa.length > 0 && { gruppa: data.gruppa }),
        ...(tip.length > 0 && { tip }),
        ...(data.inn && { inn: data.inn }),
        ...(validKpp && { kpp: validKpp }),
        ...(validAccount && { account_number: validAccount }),
        ...(data.counterparties_group_id && { counterparties_group_id: data.counterparties_group_id }),
        primenyat_stat_i_po_umolchaniyu: data.primenyat_stat_i_po_umolchaniyu,
        ...(data.chart_of_accounts_id && (data.primenyat_stat_i_po_umolchaniyu || isEdit) && { chart_of_accounts_id: data.chart_of_accounts_id }),
        ...(data.chart_of_accounts_id_2 && (data.primenyat_stat_i_po_umolchaniyu || isEdit) && { chart_of_accounts_id_2: data.chart_of_accounts_id_2 }),
        ...(data.komentariy && { komentariy: data.komentariy }),
        ...(isEdit && { data_obnovleniya: new Date().toISOString() }),
        attributes: {}
      }

      if (isEdit) {
        await updateMutation.mutateAsync(submitData)
      } else {
        await createMutation.mutateAsync(submitData)
      }

      queryClient.invalidateQueries({ queryKey: ['get_counterparties'] })
      queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsV2'] })
      queryClient.invalidateQueries({ queryKey: ['get_counterparty_by_id'] })
      queryClient.invalidateQueries({ queryKey: ['counterpartiesGroupsPlanFact'] })
      if (onSuccess) onSuccess()
      handleClose()
      reset()
    } catch (error) {
      console.error('Error creating counterparty:', error)
      setError('root', { message: error.message || 'Не удалось создать контрагента' })
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
            {activeTab === 'group'
              ? 'Создать группу'
              : (counterpartyData ? 'Редактировать контрагента' : 'Создать контрагента')}
          </h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Tabs */}
          {!counterpartyData && (
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
          )}

          {/* Form */}
          {activeTab === 'counterparty' ? (
            <form id="counterparty-form" className={styles.form} onSubmit={handleSubmit(onSubmitCounterparty)}>
              <div className={styles.formRow}>
                <label className={styles.label}>
                  Название <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputContainer}>
                  <Input
                    type="text"
                    placeholder="Например, Васильев"
                    className={cn(styles.input, errors.nazvanie && styles.inputError)}
                    {...register('nazvanie', { required: 'Укажите название' })}
                  />
                  {errors.nazvanie && (
                    <div className={styles.errorMessage}>{errors.nazvanie.message}</div>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Полное название</label>
                <div className={styles.inputContainer}>
                  <Input
                    type="text"
                    placeholder="Например, ООО «Васильев и партнеры»"
                    className={styles.input}
                    {...register('polnoe_imya')}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Группа контрагентов</label>
                <div className={styles.inputContainer}>
                  <Controller
                    name="counterparties_group_id"
                    control={control}
                    render={({ field }) => (
                      <GroupedSelect
                        data={counterpartiesGroupsOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Выберите группу контрагентов"
                        groupBy={false}
                        labelKey="label"
                        valueKey="guid"
                        className="flex-1"
                        showGroupActions={false}
                        onEditGroup={(item) => setEditingGroup(item.rawData)}
                        onDeleteGroup={(item) => setDeletingGroup(item.rawData)}
                      />
                    )}
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
                    ИНН <span className={styles.infoIcon}>?</span>
                  </label>
                  <div className={styles.inputContainer}>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Укажите ИНН"
                      className={cn(styles.input, styles.requisitesInput)}
                      {...register('inn')}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>КПП</label>
                  <div className={styles.multiInputContainer}>
                    {kppFields.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-center">
                          <Input
                          type="text"
                          inputMode="numeric"
                            placeholder="Укажите КПП"
                          className={cn(styles.input, styles.requisitesInput)}
                            {...register(`kpp.${index}.value`)}
                          />
                        {kppFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeKpp(index)}
                            className="text-neutral-400 hover:text-[#f43f5e] shrink-0 outline-none"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {index === kppFields.length - 1 && (
                          <button
                            type="button"
                            onClick={() => appendKpp({ value: '' })}
                            className="text-neutral-400 hover:text-[#0e73f6] shrink-0 outline-none"
                          >
                            <PlusCircle size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Номер счета</label>
                  <div className={styles.multiInputContainer}>
                    {accountFields.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-center">
                          <Input
                            type="text"
                            placeholder="Укажите номер счета"
                            className={cn(styles.input, styles.requisitesInput)}
                            {...register(`nomer_scheta.${index}.value`)}
                          />
                        {accountFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAccount(index)}
                            className="text-neutral-400 hover:text-[#f43f5e] shrink-0 outline-none"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {index === accountFields.length - 1 && (
                          <button
                            type="button"
                            onClick={() => appendAccount({ value: '' })}
                            className="text-neutral-400 hover:text-[#0e73f6] shrink-0 outline-none"
                          >
                            <PlusCircle size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}></label>
                <Controller
                  name="primenyat_stat_i_po_umolchaniyu"
                  control={control}
                  render={({ field }) => (
                    <OperationCheckbox
                      checked={field.value}
                      onChange={field.onChange}
                      label="Применять статьи по умолчанию "
                    />
                  )}
                />
                <label className={styles.infoIcon}>?</label>
              </div>

              {primenyat_stat_i_po_umolchaniyu && (
                <>
                  <div className={styles.formRow}>
                    <label className={styles.label}>Статья для поступлений</label>
                    <div className={styles.inputContainer}>
                      <Controller
                        name="chart_of_accounts_id"
                        control={control}
                        render={({ field }) => (
                          <SinglSelectStatiya
                            selectedValue={field.value}
                            setSelectedValue={field.onChange}
                            placeholder="Выберите статью"
                            className="flex-1 bg-white"
                            type="Расходы"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.label}>Статья для выплат</label>
                    <div className={styles.inputContainer}>
                      <Controller
                        name="chart_of_accounts_id_2"
                        control={control}
                        render={({ field }) => (
                          <SinglSelectStatiya
                            selectedValue={field.value}
                            setSelectedValue={field.onChange}
                            placeholder="Выберите статью"
                            className="flex-1 bg-white"
                            type="Доходы"
                          />
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.formRow}>
                <label className={styles.label}>Комментарий</label>
                <div className={styles.inputContainer}>
                  <TextArea
                    placeholder="Пояснение к контрагенту"
                    className={styles.textarea}
                    rows={4}
                    hasError={!!errors.komentariy}
                    {...register('komentariy')}
                  />
                </div>
              </div>

              {/* {errors.root && (
                <div className={styles.errorMessage}>{errors.root.message}</div>
              )} */}
            </form>
          ) : (
              <form id="group-form" className={styles.form} onSubmit={handleSubmitGroup(onSubmitGroup)}>
                <div className={styles.formRow}>
                  <label className={styles.label}>
                    Название <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputContainer}>
                    <Input
                      type="text"
                      placeholder="Например, мои поставщики"
                      className={cn(styles.input, groupErrors.nazvanie_gruppy && styles.inputError)}
                      {...registerGroup('nazvanie_gruppy', { required: 'Укажите название группы' })}
                    />
                    {groupErrors.nazvanie_gruppy && (
                      <div className={styles.errorMessage}>{groupErrors.nazvanie_gruppy.message}</div>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Комментарий</label>
                  <div className={styles.inputContainer}>
                    <TextArea
                      placeholder="Пояснение к группе контрагентов"
                      className={styles.textarea}
                      rows={4}
                      hasError={!!groupErrors.opisanie_gruppy}
                      {...registerGroup('opisanie_gruppy')}
                    />
                  </div>
                </div>

                {/* {groupErrors.root && (
                  <div className={styles.errorMessage}>{groupErrors.root.message}</div>
                )} */}
            </form>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={handleClose}
            className="secondary-btn"
            disabled={isSubmitting}
          >
            Отменить
          </button>
          <button
            type="submit"
            form={activeTab === 'counterparty' ? 'counterparty-form' : 'group-form'}
            className="primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (activeTab === 'counterparty' && counterpartyData ? 'Сохранение...' : 'Создание...')
              : (activeTab === 'counterparty' && counterpartyData ? 'Сохранить' : 'Создать')}
          </button>
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

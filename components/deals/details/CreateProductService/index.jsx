'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import styles from './style.module.scss'
import { useUcodeDefaultApiQuery, useUcodeDefaultApiMutation } from '@/hooks/useDashboard'
import { queryClient } from '../../../../lib/queryClient'
import { formatAmount } from '../../../../utils/helpers'
import Select from '../../../common/Select'
import Input from '../../../shared/Input'

const CreateProductService = ({
  open,
  onClose,
  initialData = null,
  isEditing = false
}) => {
  const { mutateAsync: mutateProductService, isPending } = useUcodeDefaultApiMutation({
    mutationKey: 'ADD_PRODUCT_SERVICE_TO_DEAL'
  })

  const [formData, setFormData] = useState({
    product_and_service_id: null,   // selected product/service option {value, label}
    quantity: '',
    units_of_measurement_id: null,  // selected unit option {value, label}
    tsena_za_ed: '',
    discount: '',
    status: '',
    nds: '',
    artikul: '',
    group_product_and_service_id: "",
    naimenovanie: ""
  })
  const [errors, setErrors] = useState({})

  // Fetch product/service list
  const { data: productServices } = useUcodeDefaultApiQuery({
    queryKey: 'get_product_services_list',
    urlMethod: 'GET',
    urlParams: '/items/product_and_service?from-ofs=true&offset=0&limit=100',
    querySetting: {
      select: data => data?.data?.data?.response
    }
  })


  const productServicesList = useMemo(() => {
    return productServices?.map(item => ({
      value: item?.guid,
      label: item?.naimenovanie,
    })) || []
  }, [productServices])

  // Fetch units of measurement
  const { data: units } = useUcodeDefaultApiQuery({
    queryKey: 'get_product_services_units',
    urlMethod: 'GET',
    urlParams: '/items/units_of_measurement?from-ofs=true&offset=0&limit=100',
    querySetting: {
      select: data => data?.data?.data?.response
    }
  })


  const apiUnitOptions = useMemo(() => {
    return units?.map(item => ({
      value: item?.guid,
      label: `${item?.full_name} ${item?.short_name}`,
    })) || []
  }, [units])

  console.log('apiUnitOptions', apiUnitOptions)

  // Auto-fill fields when a product/service is selected
  const handleProductServiceChange = (selectedOption) => {
    const item = productServices?.find(p => p?.guid === selectedOption?.value)
    if (!item) {
      setFormData(prev => ({ ...prev, product_and_service_id: selectedOption }))
      return
    }

    const mesurementFullNam = item?.units_of_measurement_id_data?.full_name + ' ' + item?.units_of_measurement_id_data?.short_name


    setFormData(prev => ({
      ...prev,
      product_and_service_id: selectedOption,
      tsena_za_ed: item.tsena_za_ed != null ? String(item.tsena_za_ed) : prev.tsena_za_ed,
      nds: item.nds != null ? String(item.nds) : prev.nds,
      discount: item.discount != null ? String(item.discount) : prev.discount,
      quantity: item.quantity != null ? String(item.quantity) : prev.quantity,
      units_of_measurement_id: { value: item?.units_of_measurement_id, label: mesurementFullNam },
      status: item.status != null ? String(item.status) : prev.status,
      artikul: item?.artikul,
      naimenovanie: item?.naimenovanie,
      group_product_and_service_id: item?.group_product_and_service_id
    }))
  }

  const set = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const setRaw = (field) => (e) => {
    const raw = e.target.value.replace(/\s/g, '').replace(/[^0-9.]/g, '')
    setFormData(prev => ({ ...prev, [field]: raw }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const setPercent = (field) => (e) => {
    const raw = e.target.value.replace(/%/g, '').replace(/[^0-9.]/g, '').slice(0, 3)
    setFormData(prev => ({ ...prev, [field]: raw }))
  }

  const handlePercentKeyDown = (field) => (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      setFormData(prev => ({ ...prev, [field]: String(prev[field] || '').slice(0, -1) }))
    }
  }

  // Calculate total sum
  const totalSum = useMemo(() => {
    const qty = parseFloat(String(formData.quantity).replace(/\s/g, '')) || 0
    const priceVal = parseFloat(String(formData.tsena_za_ed).replace(/\s/g, '')) || 0
    const discountVal = parseFloat(String(formData.discount).replace(/[^0-9.]/g, '')) || 0
    const ndsVal = parseFloat(String(formData.nds).replace(/[^0-9.]/g, '')) || 0
    const subtotal = qty * priceVal
    const afterDiscount = subtotal * (1 - discountVal / 100)
    const afterNds = afterDiscount * (1 + ndsVal / 100)
    return isNaN(afterNds) ? 0 : afterNds
  }, [formData.quantity, formData.tsena_za_ed, formData.discount, formData.nds])


  const resetForm = () => {
    setFormData({
      product_and_service_id: null,   // selected product/service option {value, label}
      quantity: '',
      units_of_measurement_id: null,  // selected unit option {value, label}
      tsena_za_ed: '',
      discount: '',
      status: '',
      nds: '',
      artikul: '',
      group_product_and_service_id: "",
      naimenovanie: ""
    })
  }

  // Auto-fill from initialData for Edit / Copy
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          product_and_service_id: { value: initialData.guid, label: initialData.naimenovanie || '' },
          quantity: initialData.quantity != null ? String(initialData.quantity) : '',
          units_of_measurement_id: initialData.units_of_measurement_id ? {
            value: initialData.units_of_measurement_id,
            label: (initialData.units_of_measurement_id_data?.full_name || '') + ' ' + (initialData.units_of_measurement_id_data?.short_name || '')
          } : null,
          tsena_za_ed: initialData.tsena_za_ed != null ? String(initialData.tsena_za_ed) : '',
          discount: initialData.discount != null ? String(initialData.discount) : '',
          status: initialData.status?.[0] || '',
          nds: initialData.nds != null ? String(initialData.nds) : '',
          artikul: initialData.artikul || initialData.article || '',
          group_product_and_service_id: initialData.group_product_and_service_id || '',
          naimenovanie: initialData.naimenovanie || ''
        })
      } else {
        resetForm()
      }
    }
  }, [open, initialData])

  // Block body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const validate = () => {
    const newErrors = {}
    if (!formData.product_and_service_id) newErrors.product_and_service_id = 'Выберите наименование'
    if (!formData.quantity) newErrors.quantity = 'Введите количество'
    if (!formData.tsena_za_ed) newErrors.tsena_za_ed = 'Введите цену'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return

    const payload = {
      naimenovanie: formData?.naimenovanie,
      tsena_za_ed: formData?.tsena_za_ed,
      units_of_measurement_id: formData?.units_of_measurement_id?.value,
      nds: formData?.nds,
      commentary: formData?.comment,
      status: [formData?.status],
      group_product_and_service_id: formData?.group_product_and_service_id,
      quantity: formData?.quantity,
      discount: formData?.discount
    }

    if (formData?.artikul) {
      payload.article = formData?.artikul;
    }

    if (isEditing && initialData?.guid) {
      payload.guid = initialData.guid;
    }

    try {
      await mutateProductService({
        urlMethod: isEditing ? "PUT" : "POST",
        urlParams: "/items/product_and_service?from-ofs=true",
        data: payload
      })
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['product_services_list'] })
      onClose()
    } catch (error) {
      console.error('mutateProductService', error?.message)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Panel */}
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isEditing ? 'Редактировать позицию' : 'Добавить товар/услугу'}
            </h2>
            <p className={styles.subtitle}>Заполните данные позиции сделки</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Наименование */}
          <div className={styles.formRow}>
            <label className={styles.label}>Наименование <span className={styles.required}>*</span></label>
            <Select
              options={productServicesList}
              value={formData.product_and_service_id}
              onChange={handleProductServiceChange}
              placeholder="Наименование"
            />
            {errors.product_and_service_id && <span className={styles.errorText}>{errors.product_and_service_id}</span>}
          </div>

          {/* Кол-во / Единица */}
          <div className={styles.twoCol}>
            <div className={styles.colItem}>
              <label className={styles.label}>Кол-во <span className={styles.required}>*</span></label>
              <Input
                type="text"
                value={formData.quantity}
                onChange={setRaw('quantity')}
                className={`${styles.input} ${errors.quantity ? styles.inputError : ''}`}
                placeholder="0"
              />
              {errors.quantity && <span className={styles.errorText}>{errors.quantity}</span>}
            </div>
            <div className={styles.colItem}>
              <label className={styles.label}>Единица</label>
              <Select
                options={apiUnitOptions}
                value={formData.units_of_measurement_id}
                onChange={set('units_of_measurement_id')}
                placeholder="Единица"
              />
            </div>
          </div>

          {/* Цена за ед. */}
          <div className={styles.formRow}>
            <label className={styles.label}>Цена за ед. <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={formData.tsena_za_ed ? formatAmount(formData.tsena_za_ed) : ''}
              onChange={setRaw('tsena_za_ed')}
              className={`${styles.input} ${styles.textRight} ${errors.tsena_za_ed ? styles.inputError : ''}`}
              placeholder="Цена за ед."
            />
            {errors.tsena_za_ed && <span className={styles.errorText}>{errors.tsena_za_ed}</span>}
          </div>

          {/* Скидка / НДС */}
          <div className={styles.twoCol}>
            <div className={styles.colItem}>
              <label className={styles.label}>Скидка</label>
              <input
                type="text"
                maxLength={3}
                value={formData.discount ? `${formData.discount}%` : ''}
                onChange={setPercent('discount')}
                onKeyDown={handlePercentKeyDown('discount')}
                className={`${styles.input} ${styles.textRight}`}
                placeholder="0%"
              />
            </div>
            <div className={styles.colItem}>
              <label className={styles.label}>НДС</label>
              <input
                type="text"
                maxLength={3}
                value={formData.nds ? `${formData.nds}%` : ''}
                onChange={setPercent('nds')}
                onKeyDown={handlePercentKeyDown('nds')}
                className={`${styles.input} ${styles.textRight}`}
                placeholder="0%"
              />
            </div>
          </div>

          {/* Сумма */}
          <div className={styles.formRow}>
            <label className={styles.label}>Сумма</label>
            <div className={`${styles.input} ${styles.sumDisplay}`}>
              {totalSum.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Отменить
          </button>
          <button className="primary-btn" onClick={handleCreate} disabled={isPending}>
            {isPending ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </>
  )
}

export default CreateProductService
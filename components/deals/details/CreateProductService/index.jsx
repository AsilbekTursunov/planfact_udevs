'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import styles from './style.module.scss'
import { useUcodeDefaultApiQuery } from '@/hooks/useDashboard'
import { queryClient } from '../../../../lib/queryClient'
import { formatAmount } from '../../../../utils/helpers'
import Input from '../../../shared/Input'
import { useUcodeRequestMutation, useUcodeRequestQuery } from '../../../../hooks/useDashboard'
import Loader from '../../../shared/Loader'
import SingleSelect from '../../../shared/Selects/SingleSelect'

const CreateProductService = ({
  open,
  onClose,
  initialData = null,
  isEditing = false,
  dealGuid = null
}) => {


  const [formData, setFormData] = useState({
    product_and_service_id: initialData?.guid ? { value: initialData.guid, label: initialData.name || '' } : null,
    quantity: initialData?.kolvo != null ? String(initialData.kolvo) : '',
    units_of_measurement_id: initialData?.unit_of_measurement_id || null,
    tsena_za_ed: initialData?.tsena_za_ed != null ? String(initialData.tsena_za_ed) : '',
    discount: initialData?.discount != null ? String(initialData.discount) : '',
    status: Array.isArray(initialData?.status) ? initialData.status[0] : (initialData?.status || ''),
    nds: initialData?.nds != null ? String(initialData.nds) : '',
    artikul: initialData?.artikul || initialData?.article || '',
    group_product_and_service_id: initialData?.group_product_and_service_id || "",
    naimenovanie: initialData?.name || "",
    unit_name: initialData?.unit_name || ""
  })

  const [errors, setErrors] = useState({})

  // Fetch product/service list
  const { data: productServices } = useUcodeRequestQuery({
    method: 'list_products_and_services', 
    querySetting: {
      select: data => data?.data?.data?.data
    }
  })


  const productServicesList = useMemo(() => {
    return productServices?.map(item => ({
      value: item?.guid,
      label: item?.Naimenovanie,
    })) || []
  }, [productServices])



  const { mutateAsync: mutateProductServiceCustom, isPending: isProductServiceCustomPending } = useUcodeRequestMutation()

  // Auto-fill fields when a product/service is selected
  const handleProductServiceChange = (value) => {
    const item = productServices?.find(p => p?.guid === value)
    if (!item) {
      setFormData(prev => ({ ...prev, product_and_service_id: value }))
      return
    }

    const mesurementFullNam = item?.unit_name + ' ' + item?.unit_short_name


    setFormData(prev => ({
      ...prev,
      product_and_service_id: item?.guid,
      tsena_za_ed: item.TSena_za_ed,
      nds: item.NDS,
      discount: item.Skidka,
      quantity: item.Kol_vo,
      units_of_measurement_id: { value: item?.units_of_measurement_id, label: mesurementFullNam },
      status: item.Status,
      artikul: item?.Artikul,
      naimenovanie: item?.Naimenovanie,
      group_product_and_service_id: item?.product_and_service_group_id
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

  const [prevOpen, setPrevOpen] = useState(open)
  const [prevInitialData, setPrevInitialData] = useState(initialData)

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open)
    setPrevInitialData(initialData)

    if (open) {
      if (initialData) {
        setFormData({
          product_and_service_id: initialData.guid ? { value: initialData.guid, label: initialData.name || '' } : null,
          quantity: initialData.kolvo != null ? String(initialData.kolvo) : '',
          units_of_measurement_id: initialData.unit_of_measurement_id ? {
            value: initialData.unit_of_measurement_id,
            label: initialData.unit_name || ''
          } : null,
          tsena_za_ed: initialData.tsena_za_ed != null ? String(initialData.tsena_za_ed) : '',
          discount: initialData.discount != null ? String(initialData.discount) : '',
          status: Array.isArray(initialData.status) ? initialData.status[0] : (initialData.status || ''),
          nds: initialData.nds != null ? String(initialData.nds) : '',
          artikul: initialData.artikul || initialData.article || '',
          group_product_and_service_id: initialData.group_product_and_service_id || '',
          naimenovanie: initialData.name || ''
        })
      } else {
        resetForm()
      }
    }
  }

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

    const object_data = {
      Naimenovanie: formData?.naimenovanie || '',
      Kol_vo: Number(String(formData?.quantity || '0').replace(/\s/g, '')),
      TSena_za_ed: Number(String(formData?.tsena_za_ed || '0').replace(/\s/g, '')),
      Skidka: Number(String(formData?.discount || '0').replace(/\s/g, '')),
      Summa: totalSum,
      Tip: "product",
    };

    if (!isEditing && dealGuid) {
      object_data.sales_transaction_id = dealGuid;
    }

    if (isEditing && initialData?.guid) {
      object_data.guid = initialData.guid;
    }

    if (formData?.units_of_measurement_id?.value) {
      object_data.units_of_measurement_id = formData.units_of_measurement_id.value;
    }

    if (formData?.nds) {
      object_data.Nds = Number(String(formData?.nds || '0').replace(/\s/g, ''));
    }

    if (formData?.artikul) {
      object_data.article = formData.artikul;
    }

    if (formData?.group_product_and_service_id) {
      object_data.product_and_service_group_id = formData.group_product_and_service_id;
    }

    if (formData?.comment) {
      object_data.commentary = formData.comment;
    }

    if (formData?.status) {
      object_data.status = [formData.status];
    }


    try {
      await mutateProductServiceCustom({
        method: isEditing ? "update_product_and_service" : "create_product_and_service",
        data: object_data
      })
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['get_sales_transaction_by_guid'] })
      queryClient.invalidateQueries({ queryKey: ['products_services_list'] })
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
						<label className={styles.label}>
							Наименование <span className={styles.required}>*</span>
						</label>
            <SingleSelect
              data={productServicesList}
							value={formData.product_and_service_id}
							onChange={handleProductServiceChange}
							placeholder='Наименование'
              className={'h-[38]! bg-white'}
						/>
						{errors.product_and_service_id && (
							<span className={styles.errorText}>{errors.product_and_service_id}</span>
						)}
					</div>

					{/* Кол-во / Единица */}
					<div className={styles.twoCol}>
						<div className={styles.colItem}>
							<label className={styles.label}>
								Кол-во <span className={styles.required}>*</span>
							</label>
							<Input
								type='text'
								value={formData.quantity}
								onChange={setRaw('quantity')}
								className={`${styles.input} ${errors.quantity ? styles.inputError : ''}`}
								placeholder='0'
							/>
							{errors.quantity && <span className={styles.errorText}>{errors.quantity}</span>}
						</div>
						<div className={styles.colItem}>
							<label className={styles.label}>Единица</label>
							<Input
								type='text'
                value={formData.unit_name || ''}
								className={styles.input}
								placeholder='Единица'
								readOnly
							/>
						</div>
					</div>

					{/* Цена за ед. */}
					<div className={styles.formRow}>
						<label className={styles.label}>
							Цена за ед. <span className={styles.required}>*</span>
						</label>
						<input
							type='text'
							value={formData.tsena_za_ed ? formatAmount(formData.tsena_za_ed) : ''}
							onChange={setRaw('tsena_za_ed')}
							className={`${styles.input} ${styles.textRight} ${errors.tsena_za_ed ? styles.inputError : ''}`}
							placeholder='Цена за ед.'
						/>
						{errors.tsena_za_ed && <span className={styles.errorText}>{errors.tsena_za_ed}</span>}
					</div>

					{/* Скидка / НДС */}
					<div className={styles.twoCol}>
						<div className={styles.colItem}>
							<label className={styles.label}>Скидка</label>
              <Input
								type='text'
								maxLength={3}
								value={formData.discount ? `${formData.discount}%` : ''}
								onChange={setPercent('discount')}
								onKeyDown={handlePercentKeyDown('discount')}
								className={`${styles.input} ${styles.textRight}`}
								placeholder='0%'
							/>
						</div>
						<div className={styles.colItem}>
							<label className={styles.label}>НДС</label>
              <Input
								type='text'
								maxLength={3}
								value={formData.nds ? `${formData.nds}%` : ''}
								onChange={setPercent('nds')}
								onKeyDown={handlePercentKeyDown('nds')}
								className={`${styles.input} ${styles.textRight}`}
								placeholder='0%'
							/>
						</div>
					</div>

					{/* Сумма */}
					<div className={styles.formRow}>
						<label className={styles.label}>Сумма</label>
						<div className={`${styles.input} ${styles.sumDisplay}`}>
							{totalSum.toLocaleString('ru-RU', {
								minimumFractionDigits: 0,
								maximumFractionDigits: 2,
							})}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<button className={styles.cancelBtn} onClick={onClose}>
						Отменить
					</button>
					<button
						className='primary-btn'
						onClick={handleCreate}
						disabled={isProductServiceCustomPending}
					>
						{isProductServiceCustomPending ? <Loader /> : isEditing ? 'Сохранить' : 'Создать'}
					</button>
				</div>
			</div>
		</>
	)
}

export default CreateProductService
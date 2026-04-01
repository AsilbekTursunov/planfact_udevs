import Modal from '../../common/Modal/Modal'
import styles from './style.module.scss'
import { X } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import SegmentedControl from '../../shared/SegmentedControl'
import Input from '../../shared/Input'
import TextArea from '../../shared/TextArea'
import Select from '../../common/Select'
import { useUcodeDefaultApiQuery, useUcodeRequestMutation } from '../../../hooks/useDashboard' // refreshed import
import { queryClient } from '../../../lib/queryClient'
import Loader from '../../shared/Loader'


const CreateSingle = ({ open = true, setOpen, initialData = null, isEditing = false }) => {
  const [viewMode, setViewMode] = useState('product')

  const viewOptions = [
    { value: 'product', label: 'Товары' },
    { value: 'service', label: 'Услуги' }
  ]

  const { mutateAsync: mutateProductService, isPending } = useUcodeRequestMutation()

  const { data: units, } = useUcodeDefaultApiQuery({
    queryKey: "get_product_services_units",
    urlMethod: "GET",
    urlParams: "/items/units_of_measurement?from-ofs=true&data=%7B%22offset%22%3A0%2C%22limit%22%3A100%7D",
    querySetting: {
      select: data => data?.data?.data?.response
    }
  })

  const { data: groups } = useUcodeDefaultApiQuery({
    queryKey: "get_product_services_groups",
    urlMethod: "GET",
    urlParams: "/items/group_product_and_service?from-ofs=true&data=%7B%22offset%22%3A0%2C%22limit%22%3A100%7D",
    querySetting: {
      select: data => data?.data?.data?.response
    }
  })

  const groupsList = useMemo(() => {
    return groups?.map(item => {
      return {
        value: item?.guid,
        label: item?.name
      }
    })
  }, [groups])

  const apiOptions = useMemo(() => {
    return units?.map(item => ({
      value: item?.guid, label: `${item?.full_name} ${item?.short_name}`
    }))
  }, [units])


  const currencyOptions = [
    { value: 'rub', label: 'RUB' },
    { value: 'usd', label: 'USD' }
  ]

  const [formData, setFormData] = useState({
    name: '',
    article: '',
    unit: apiOptions?.[0],
    group: [],
    price: '',
    currency: currencyOptions[0],
    vat: '',
    comment: ''
  })

  const resetForm = () => {
    setFormData({
      name: '',
      article: '',
      unit: apiOptions?.[0],
      group: [],
      price: '',
      currency: currencyOptions[0],
      vat: '',
      comment: ''
    })
    setViewMode('product')
  }

  useEffect(() => {

    if (open) {
      if (initialData) {
        setViewMode(initialData?.status?.[0] === 'service' ? 'service' : 'product')
        setFormData({
          name: initialData?.naimenovanie || initialData?.Naimenovanie || '',
          article: initialData?.artikul || initialData?.Artikul || '',
          unit: apiOptions?.find(opt => opt.value === initialData?.units_of_measurement_id || opt.value === initialData?.unit_of_measurement_id) || apiOptions?.[0],
          group: [],
          price: (initialData?.tsena_za_ed || initialData?.TSena_za_ed || '').toString(),
          currency: currencyOptions[0],
          vat: (initialData?.nds || initialData?.NDS || '').toString(),
          comment: initialData?.commentary || initialData?.kommentariy || ''
        })
      } else {
        resetForm()
      }
    }
    // eslint-disable-next-line
  }, [open, initialData, apiOptions])

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitted(true)

    if (!formData.name) {
      return
    }
    const payload = {
      Naimenovanie: formData?.name,
      TSena_za_ed: parseInt((formData?.price || '').replace(/\s/g, '').replace(/[^\d]/g, '')) || 0,
      unit_of_measurement_id: formData?.unit?.value,
      NDS: parseInt((formData?.vat || '').replace('%', '')) || 0,
      product_and_service_group_id: formData?.group?.value,
      Tip: viewMode,
      kommentariy: formData?.comment,
    }

    if (viewMode === 'product') {
      payload.Artikul = formData.article;
    }

    if (isEditing && initialData?.guid) {
      payload.guid = initialData.guid;
    }

    try {
      await mutateProductService({
        method: isEditing ? "update_product_and_service" : "create_product_and_service",
        data: payload
      })
      resetForm()
      setOpen(false) // Close modal after successful creation
      queryClient.invalidateQueries({ queryKey: ['get_product_services_list'] })
      queryClient.invalidateQueries({ queryKey: ['list_products_and_services'] })
    } catch (error) {
      console.error('mutateProductService', error?.message)
    }
  }

  // const handleDelete = async (guid) => {
  //   try {
  //     await mutateProductService({
  //       urlMethod: "DELETE",
  //       urlParams: "/items/product_and_service?from-ofs=true",
  //       data: {
  //         guid
  //       }
  //     })
  //     queryClient.invalidateQueries({ queryKey: ['get_product_services_list'] })
  //   } catch (error) {
  //     console.error('mutateProductService', error?.message)
  //   }
  // }

  return (
    <Modal
      open={open}
      className={styles.modalBackdrop}
      onClose={() => setOpen(false)}
    >
      <div className={styles.singlecontainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing
              ? (viewMode === 'product' ? 'Редактирование товара' : 'Редактирование услуги')
              : (viewMode === 'product' ? 'Создание товара' : 'Создание услуги')}
          </h2>

          <div className={styles.headerActions}>
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)}>
              <X size={20} color="#9ca3af" />
            </button>
          </div>
        </div>

        <div className={styles.body}>

          <div className={styles.formRow}>
            <div className={styles.label}>Тип</div>
            <div className={styles.fieldContainer}>
              <SegmentedControl
                options={viewOptions}
                value={viewMode}
                onChange={setViewMode}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.label}>Название товара</div>
            <div className={styles.fieldContainer}>
              <Input
                placeholder="Например, кафельная плитка"
                className={styles.fullWidth}
                value={formData.name}
                error={isSubmitted && !formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
              />
              {isSubmitted && !formData.name && <span className={styles.errorMessage}>Укажите название</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            {viewMode === 'product' && <>
              <div className={styles.label}>Артикул</div>
              <div className={styles.fieldContainer}>
                <Input
                  placeholder="Введите артикул"
                  style={{ width: '140px' }}
                  value={formData.article}
                  onChange={e => handleFieldChange('article', e.target.value)}
                />
              </div>
            </>}

            <div className={styles.label}>
              Единица измерения
            </div>
            <div className={`${styles.fieldContainer} ${viewMode === 'service' ? styles.service : ''}`}>
              <Select
                instanceId="create-single-unit-select"
                options={apiOptions}
                value={formData.unit}
                onChange={val => handleFieldChange('unit', val)} 
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.label}>Группа товаров</div>
            <div className={styles.fieldContainer}>
              <Select
                instanceId="create-single-group-select"
                options={groupsList}
                value={formData.group}
                onChange={val => handleFieldChange('group', val)}
                placeholder="Выберите группу"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.labelWithHelp}>
              Цена продажи
            </div>
            <div className={styles.priceGroup}>
              <Input
                className={styles.priceInput}
                placeholder="0.00"
                value={formData.price}
                onChange={e => {
                  const raw = e.target.value.replace(/\s/g, '').replace(/[^0-9.]/g, '');
                  if (raw === '' || raw === '.') {
                    handleFieldChange('price', raw);
                    return;
                  }
                  const num = parseFloat(raw);
                  if (!isNaN(num)) {
                    handleFieldChange('price', num.toLocaleString('ru-RU'));
                  }
                }}
              />
              <Select
                instanceId="create-single-currency-select"
                className={styles.currencySelect}
                options={currencyOptions}
                value={formData.currency}
                onChange={val => handleFieldChange('currency', val)}
                defaultValue={currencyOptions[0]}
              />
            </div>

            <div className={styles.label} style={{ marginLeft: 'auto', width: 'auto', marginRight: '1rem' }}>
              НДС
            </div>
            <div className={styles.fieldContainer} style={{ width: '120px' }}>
              <Input
                placeholder="0%"
                className={styles.fullWidth}
                value={formData.vat ? `${formData.vat}%` : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/%/g, '').replace(/\D/g, '').slice(0, 2);
                  handleFieldChange('vat', raw);
                }}
                onKeyDown={e => {
                  if (e.key === 'Backspace') {
                    e.preventDefault();
                    const val = String(formData.vat || '');
                    handleFieldChange('vat', val.slice(0, -1));
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.formRowTop}>
            <div className={styles.label}>Комментарий</div>
            <div className={styles.fieldContainer}>
              <TextArea
                placeholder="Добавьте комментарий к этому товару"
                className={styles.textArea}
                rows={4}
                value={formData.comment}
                hasError={false}
                onChange={e => handleFieldChange('comment', e.target.value)}
              />
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <div className={styles.footerButtons}>
            <button type="button" className={styles.cancelButton} onClick={() => setOpen(false)}>
              Отменить
            </button>
            <button type="button" className={styles.saveButton} onClick={handleSubmit} disabled={isPending}>
              {isPending ? <Loader /> : isEditing ? "Сохранить" : "Создать"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreateSingle
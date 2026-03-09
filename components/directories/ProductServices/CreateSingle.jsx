import { Modal } from '@mui/material'
import styles from './style.module.scss'
import { X } from 'lucide-react'
import { useState } from 'react'
import SegmentedControl from '../../shared/SegmentedControl'
import Input from '../../shared/Input'
import TextArea from '../../shared/TextArea'
import { MultiSelect } from '../../common/MultiSelect/MultiSelect'
import Select from '../../common/Select'


const options = []

// Изделие (изд) 

const CreateSingle = ({ open = true, setOpen }) => {
  const [viewMode, setViewMode] = useState('product')

  const viewOptions = [
    { value: 'product', label: 'Товары' },
    { value: 'service', label: 'Услуги' }
  ]

  const unitOptions = [
    { value: 'a', label: 'Ар (а)' },
    { value: 'bob', label: 'Бобина (боб)' },
    { value: 'ga', label: 'Гектар (га)' },
    { value: 'year', label: 'Год (г)' },
    { value: 'g', label: 'Грамм (г)' },
    { value: 'ed', label: 'Единица (ед)' },
    { value: 'izd', label: 'Изделие (изд)' },
    { value: 'km2', label: 'Квадратный километр (км 2)' },
    { value: 'm2', label: 'Квадратный метр (м 2)' },
    { value: 'mm2', label: 'Квадратный миллиметр (мм 2)' },
    { value: 'sm2', label: 'Квадратный сантиметр (см 2)' },
    { value: 'kg', label: 'Килограмм (кг)' },
    { value: 'km', label: 'Километр (км)' },
    { value: 'm3', label: 'Кубический метр (м 3)' },
    { value: 'mm3', label: 'Кубический миллиметр (мм 3)' },
    { value: 'sm3', label: 'Кубический сантиметр (см 3)' },
    { value: 'list', label: 'Лист (л.)' },
    { value: 'l', label: 'Литр (л)' },
    { value: 'month', label: 'Месяц (мес)' },
    { value: 'm', label: 'Метр (м)' },
    { value: 'mg', label: 'Миллиграмм (мг)' },
    { value: 'ml', label: 'Миллилитр (мл)' },
    { value: 'mm', label: 'Миллиметр (мм)' },
    { value: 'nabor', label: 'Набор (набор)' },
    { value: 'pm', label: 'Погонный метр (пог. м)' },
    { value: 'rulon', label: 'Рулон (рул)' },
    { value: 'sm', label: 'Сантиметр (см)' },
    { value: 'sec', label: 'Секунда (с)' },
    { value: 'sut', label: 'Сутки (сут)' },
    { value: 't', label: 'Тонна (т)' },
    { value: 'upak', label: 'Упаковка (упак)' },
    { value: 'usl_m', label: 'Условный метр (усл. м)' },
    { value: 'c', label: 'Центнер (ц)' },
    { value: 'hour', label: 'Час (ч)' },
    { value: 'chast', label: 'Часть (часть)' },
    { value: 'chel_dn', label: 'Человеко-день (чел.дн)' },
    { value: 'chel_ch', label: 'Человеко-час (чел.ч)' },
    { value: 'pcs', label: 'Штука (шт)' },
    { value: 'elem', label: 'Элемент (элем)' },
    { value: 'box', label: 'Ящик (ящ.)' }
  ]

  const groupOptions = [
    { value: 'g1', label: 'Группа 1' },
    { value: 'g2', label: 'Группа 2' }
  ]

  const currencyOptions = [
    { value: 'rub', label: 'RUB' },
    { value: 'usd', label: 'USD' }
  ]

  const [formData, setFormData] = useState({
    name: '',
    article: '',
    unit: unitOptions[0],
    group: [],
    price: '',
    currency: currencyOptions[0],
    vat: '',
    comment: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)

    if (!formData.name) {
      return
    }

    const payload = {
      ...formData,
    }

    if (viewMode === 'product') {
      payload.article = formData.article;
      // create product action   
      console.log('Create product:', payload)
      return
    }

    // create service action
    delete payload.article;
    console.log('Create service:', payload)
  }

  return (
    <Modal
      open={open}
      className={styles.modalBackdrop}
      onClose={setOpen}
      disableAutoFocus
    >
      <div className={styles.singlecontainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {viewMode === 'product' ? 'Создание товара' : 'Создание услуги'}
          </h2>

          <div className={styles.headerActions}>
            <SegmentedControl
              options={viewOptions}
              value={viewMode}
              onChange={setViewMode}
            />
            <button type="button" className={styles.closeButton} onClick={setOpen}>
              <X size={20} color="#9ca3af" />
            </button>
          </div>
        </div>

        <div className={styles.body}>

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
                buttonClassname={styles.multiSelect}
                options={unitOptions}
                value={formData.unit}
                onChange={val => handleFieldChange('unit', val)}
                defaultValue={unitOptions[0]}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.label}>Группа товаров</div>
            <div className={styles.fieldContainer}>
              <MultiSelect
                buttonClassname={styles.multiSelect}
                options={groupOptions}
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
                onChange={e => handleFieldChange('price', e.target.value)}
              />
              <Select
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
                value={formData.vat}
                onChange={e => handleFieldChange('vat', e.target.value)}
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
                onChange={e => handleFieldChange('comment', e.target.value)}
              />
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <div className={styles.footerButtons}>
            <button type="button" className={styles.cancelButton} onClick={setOpen}>
              Отменить
            </button>
            <button type="button" className={styles.saveButton} onClick={handleSubmit}>
              Создать
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreateSingle
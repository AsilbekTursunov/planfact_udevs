import Modal from '../../common/Modal/Modal'
import styles from './style.module.scss'
import { X } from 'lucide-react'
import { useState } from 'react'
import SegmentedControl from '../../shared/SegmentedControl'
import Input from '../../shared/Input'
import TextArea from '../../shared/TextArea'

const CreateGroup = ({ open = true, setOpen }) => {
  const [viewMode, setViewMode] = useState('product')

  const viewOptions = [
    { value: 'product', label: 'Товары' },
    { value: 'service', label: 'Услуги' }
  ]

  const [formData, setFormData] = useState({
    name: '',
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
      // create product action   
      console.log('Create product:', payload)
      return
    }

    // create service action
    console.log('Create service:', payload)
  }

  return (
    <Modal
      open={open}
      className={styles.modalBackdrop}
      onClose={setOpen}
    >
      <div className={styles.groupcontainer}>
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
            <div className={styles.label}>Название  {viewMode === 'product' ? 'товара' : 'услуги'}</div>
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

export default CreateGroup
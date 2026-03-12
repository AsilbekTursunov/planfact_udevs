import React, { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import styles from './style.module.scss'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { TreeSelect } from '@/components/common/TreeSelect/TreeSelect'
import { useLegalEntitiesPlanFact, useCounterpartiesGroupsPlanFact, useChartOfAccountsPlanFact } from '@/hooks/useDashboard'
import { MultiSelect } from '../../../common/MultiSelect/MultiSelect'

const CreateShipment = ({ open, onClose, dealName, dealGuid, kontragentName }) => {
  const today = new Date()

  const [shipmentDate, setShipmentDate] = useState(today.toISOString().split('T')[0])
  const [isPlanned, setIsPlanned] = useState(false)
  const [legalEntity, setLegalEntity] = useState('')
  const [client, setClient] = useState(kontragentName || '')
  const [chartOfAccounts, setChartOfAccounts] = useState([])
  const [showChartOfAccounts, setShowChartOfAccounts] = useState(false)
  const [rows, setRows] = useState([
    { id: 1, name: '', quantity: 0, price: 0, discount: '0 %', nds: '0 %', sum: 0 }
  ])

  const [errors, setErrors] = useState({})

  // Fetch legal entities data
  const { data: legalEntitiesData, isLoading: loadingLegalEntities } = useLegalEntitiesPlanFact({
    page: 1,
    limit: 100,
  })

  // Transform legal entities data for GroupedSelect
  const legalEntities = (legalEntitiesData?.data?.data?.data || []).map(item => ({
    guid: item.guid,
    label: item.nazvanie || 'Без названия',
    group: 'Юрлица',
  }))

  const { data: counterpartiesGroupsData, isLoading: isLoadingGroups } = useCounterpartiesGroupsPlanFact({
    page: 1, limit: 100
  })

  const { data: chartOfAccountsData } = useChartOfAccountsPlanFact({
    page: 1, limit: 100
  })

  // Transform counterparties
  const counterAgentsTree = React.useMemo(() => {
    const groups = counterpartiesGroupsData?.data?.data?.data || []
    if (groups.length === 0) return []
    const buildTree = item => {
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        return {
          value: item.guid,
          title: item.nazvanie_gruppy || 'Без названия',
          selectable: false,
          children: item.children.map(child => ({
            value: child.guid,
            title: child.nazvanie || 'Без названия',
            selectable: true,
          }))
        }
      }
      return {
        value: item.guid,
        title: item.nazvanie_gruppy || item.nazvanie || 'Без названия',
        selectable: true,
      }
    }
    return groups.map(buildTree)
  }, [counterpartiesGroupsData])

  // Chart of accounts options
  const chartOfAccountsOptions = React.useMemo(() => {
    const rawData = chartOfAccountsData?.data?.data?.data || [];
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
		const flat = Array.isArray(rawData) ? flatten(rawData) : []
		return flat.map(item => ({
			value: item.guid,
			label: item.nazvanie || 'Без названия',
			group: (Array.isArray(item.tip) && item.tip.length > 0) ? item.tip[0] : 'Без группы'
		}))
  }, [chartOfAccountsData])

  // Block body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  const addRow = () => {
    setRows(prev => [...prev, {
      id: Date.now(),
      name: '',
      quantity: 0,
      price: 0,
      discount: '0 %',
      nds: '0 %',
      sum: 0
    }])
  }

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row
      const updated = { ...row, [field]: value }
      if (field === 'quantity' || field === 'price') {
        updated.sum = (Number(updated.quantity) || 0) * (Number(updated.price) || 0)
      }
      return updated
    }))
  }

  const totalSum = rows.reduce((acc, row) => acc + (Number(row.sum) || 0), 0)

  const handleCreate = () => {
    // TODO: API call
    console.log('Create shipment:', { shipmentDate, isPlanned, legalEntity, client, rows })
    onClose?.()
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Panel */}
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Создание отгрузки</h2>
            <div className={styles.subtitle}>
              Сделка: <span className={styles.dealLink}>{dealName || dealGuid}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className={styles.body}>
          {/* Date + Planned */}
          <div className={styles.formRow}>
            <label className={styles.label}>
              Дата отгрузки <span className={styles.required}>*</span>
            </label>
            <div className={styles.fieldGroup} style={{ flex: 1, maxWidth: '600px' }}>
              <DatePicker
                value={shipmentDate}
                onChange={value => {
                  setShipmentDate(value)
                  if (errors.shipmentDate) {
                    setErrors({ ...errors, shipmentDate: null })
                  }
                }}
                dateFormat='YYYY-MM-DD'
                className={styles.datePicker}
                placeholder='Выберите дату'
                showCheckbox={true}
                checkboxLabel='Плановая отгрузка'
                checkboxValue={isPlanned}
                onCheckboxChange={checked => setIsPlanned(checked)}
              />
              {errors.shipmentDate && (
                <span className={styles.errorText}>{errors.shipmentDate}</span>
              )}
            </div>
          </div>

          {/* Legal Entity */}
          <div className={styles.formRow}>
            <label className={styles.label}>
              Юрлицо <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputContainer} style={{ flex: 1, maxWidth: '600px' }}>
              <GroupedSelect
                data={legalEntities}
                value={legalEntity}
                onChange={(value) => setLegalEntity(value)}
                placeholder="Выберите юрлицо"
                groupBy={false}
                labelKey="label"
                valueKey="guid"
                disabled={false}
                loading={loadingLegalEntities}
                className="flex-1"
              />
              {errors.legalEntity && (
                <div className={styles.errorMessage}>{errors.legalEntity}</div>
              )}
            </div>
          </div>

          {/* Client */}
          <div className={styles.formRow}>
            <label className={styles.label}>
              Клиент <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputContainer} style={{ flex: 1, maxWidth: '600px' }}>
              <TreeSelect
                data={counterAgentsTree}
                value={client}
                onChange={value => setClient(value)}
                placeholder='Выберите клиента...'
                className='flex-1'
                loading={isLoadingGroups}
              />
              {errors.client && (
                <div className={styles.errorMessage}>{errors.client}</div>
              )}
            </div>
          </div>

          {/* Chart of accounts */} 
          {showChartOfAccounts && (
            <div className={styles.formRow}>
              <label className={styles.label}>
                Статья доходов
              </label>
              <div className={styles.inputContainer} style={{ flex: 1, maxWidth: '600px' }}>
                <MultiSelect
                  data={chartOfAccountsOptions}
                  value={chartOfAccounts}
                  onChange={(values) => setChartOfAccounts(values)}
                  placeholder="Выберите статьи учета"
                  valueKey="value"
                  hideSelectAll={true}
                />
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className={styles.productsSection}>
            <div className={styles.productsSectionHeader}>
              <span className={styles.productsTitle}>Товары/услуги для отгрузки</span>
              <button 
                className={styles.fillFromDeal}
                onClick={() => setShowChartOfAccounts(!showChartOfAccounts)}
              >
                Заполнить позициями из сделки
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkCol}>
                      <input type="checkbox" className={styles.checkbox} />
                    </th>
                    <th>Наименование</th>
                    <th className={styles.numCol}>Кол-во</th>
                    <th className={styles.numCol}>Цена за ед.</th>
                    <th className={styles.numCol}>Скидка</th>
                    <th className={styles.numCol}>НДС</th>
                    <th className={styles.numCol}>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.checkCol}>
                        <input type="checkbox" className={styles.checkbox} />
                      </td>
                      <td>
                        <div className={styles.selectWrapper}>
                          <select
                            value={row.name}
                            onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                            className={styles.selectSmall}
                          >
                            <option value="">Выберите или создайте позицию</option>
                          </select>
                          <ChevronDown size={14} className={styles.selectIcon} />
                        </div>
                      </td>
                      <td className={styles.numCol}>
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                          className={styles.numInput}
                        />
                      </td>
                      <td className={styles.numCol}>
                        <input
                          type="number"
                          value={row.price}
                          onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                          className={styles.numInput}
                        />
                      </td>
                      <td className={styles.numCol}>
                        <span className={styles.readonlyVal}>{row.discount}</span>
                      </td>
                      <td className={styles.numCol}>
                        <span className={styles.readonlyVal}>{row.nds}</span>
                      </td>
                      <td className={styles.numCol}>
                        <span className={styles.sumVal}>{row.sum.toLocaleString('ru-RU')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>
              <button className={styles.addRowBtn} onClick={addRow}>Добавить...</button>
              <span className={styles.totalSum}>Сумма отгрузки: <strong>{totalSum.toLocaleString('ru-RU')}</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.requiredNote}>
            <span className={styles.required}>*</span> Обязательные поля
          </span>
          <div className={styles.footerActions}>
            <button className={styles.cancelBtn} onClick={onClose}>Отменить</button>
            <button className={styles.createBtn} onClick={handleCreate}>Создать</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateShipment
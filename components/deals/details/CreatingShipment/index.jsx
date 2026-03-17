import React, { useState, useEffect, useMemo } from 'react'
import { X, TrashIcon } from 'lucide-react'
import styles from './style.module.scss'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { TreeSelect } from '@/components/common/TreeSelect/TreeSelect'
import { useLegalEntitiesPlanFact, useCounterpartiesGroupsPlanFact, useChartOfAccountsPlanFact } from '@/hooks/useDashboard'
import { MultiSelect } from '../../../common/MultiSelect/MultiSelect'
import { formatAmount } from '../../../../utils/helpers'
import OperationCheckbox from '../../../shared/Checkbox/operationCheckbox'
import { useUcodeRequestMutation, useUcodeRequestQuery } from '../../../../hooks/useDashboard'
import Loader from '../../../shared/Loader'
import { queryClient } from '../../../../lib/queryClient'
import { productServiceDto } from '../../../../lib/dtos/productServiceDto'

const CreateShipment = ({ open, onClose, dealName, dealGuid, kontragentId, initialData = null, isEditing = false, isCopying = false }) => {
  const today = new Date()

  const [shipmentDate, setShipmentDate] = useState(today.toISOString().split('T')[0])
  const isFutureDate = new Date(shipmentDate).setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)

  const [isPlanned, setIsPlanned] = useState(false)
  const [legalEntity, setLegalEntity] = useState('')
  const [client, setClient] = useState(kontragentId || '')
  const [chartOfAccounts, setChartOfAccounts] = useState([])
  const [showChartOfAccounts, setShowChartOfAccounts] = useState(false)
  const [rows, setRows] = useState([
    { id: 1, name: '', quantity: 0, price: 0, discount: '', nds: '', sum: 0 }
  ])


  useEffect(() => {
    if (open) {
      if (initialData) {
        setShipmentDate(initialData.data_operatsii?.split('T')[0] || today.toISOString().split('T')[0])
        setIsPlanned(initialData.planned_shipment || false)
        setLegalEntity(initialData.legal_entity_id || '')
        setClient(initialData.partners_id || kontragentId || '')

        if (initialData.product_and_service_data) {
          setRows(initialData?.product_and_service_data?.map((row, idx) => ({
            id: idx + 1,
            name: row.guid || row.product_and_service_id || '',
            quantity: row.Kol_vo || 0,
            price: row.TSena_za_ed || 0,
            discount: row.Skidka || '',
            nds: row.NDS || '',
            sum: row.Summa || 0
          })))
        }
      } else {
        setShipmentDate(today.toISOString().split('T')[0])
        setIsPlanned(false)
        setLegalEntity('')
        setClient(kontragentId || '')
        setRows([{ id: 1, name: '', quantity: 0, price: 0, discount: '', nds: '', sum: 0 }])
      }
    }
  }, [open, initialData])

  const [selectedProducts, setSelectedProducts] = useState(new Set())

  const [errors, setErrors] = useState({})

  // Fetch legal entities data
  const { data: legalEntitiesData, isLoading: loadingLegalEntities } = useLegalEntitiesPlanFact({
    page: 1,
    limit: 100,
  })

  const { mutateAsync: createShipment, isPending: isCreating } = useUcodeRequestMutation()

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


  const { data: productServices } = useUcodeRequestQuery({
    method: "list_products_and_services",
    querySetting: {
      select: data => data?.data?.data?.data
    }
  })

  const productServicesList = useMemo(() => {
    return productServiceDto(productServices)
  }, [productServices])

  const groupedProductServicesList = useMemo(() => {
    if (!productServicesList) return []
    return productServicesList.map(item => {
      const groupData = item?.group_product_and_service_id_data
      const groupName = groupData ? (groupData.name || groupData.nazvanie || 'Без группы') : 'Без группы'

      return {
        ...item,
        value: item.guid,
        label: item.name || 'Без названия',
        group: groupName
      }
    })
  }, [productServicesList])

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

  // Log initialData when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      console.log('initialData:', initialData)
    }
  }, [open, initialData])

  const addRow = () => {
    setRows(prev => [...prev, {
      id: Date.now(),
      name: '',
      quantity: 0,
      price: 0,
      discount: '',
      nds: '',
      sum: 0
    }])
  }

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row
      const updated = { ...row, [field]: value }
      if (field === 'quantity' || field === 'price') {
        const q = Number(updated.quantity?.toString().replace(/\s/g, '')) || 0
        const p = Number(updated.price?.toString().replace(/\s/g, '')) || 0
        updated.sum = q * p
      }
      return updated
    }))
  }

  const totalSum = useMemo(() => {
    return rows.reduce((acc, row) => {
      const sumVal = Number(row.sum?.toString().replace(/\s/g, '')) || 0;
      return acc + sumVal;
    }, 0)
  }, [rows])

  const handleCreate = async () => {
    const newErrors = {}
    if (!shipmentDate) newErrors.shipmentDate = 'Выберите дату'
    if (!legalEntity) newErrors.legalEntity = 'Выберите юрлицо'
    if (!client) newErrors.client = 'Выберите клиента'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const payload = {
        legal_entity_id: legalEntity,
        sales_id: dealGuid,
        partners_id: client,
        planned_shipment: isFutureDate ? true : isPlanned,
        status_nachislenie: ["confirmed"],
        type: ["Отгрузка"],
        summa: totalSum,
        data_nachislenie: shipmentDate,
        data_oplaty: shipmentDate,
        currency_code: "RUB",
        description: "Shipment",
        product_and_service_data: rows.filter(row => row.name).map(row => {
          const product = productServicesList.find(p => p.guid === row.name)
          return {
            guid: product?.guid || undefined,
            Naimenovanie: product ? product.name : "",
            Artikul: product?.article || "",
            Kol_vo: Number(row.quantity?.toString().replace(/\s/g, '')) || 0,
            TSena_za_ed: Number(row.price?.toString().replace(/\s/g, '')) || 0,
            Summa: Number(row.sum?.toString().replace(/\s/g, '')) || 0,
            Skidka: Number(row.discount?.toString().replace(/\s/g, '')) || 0,
            NDS: Number(row.nds?.toString().replace(/\s/g, '')) || 0,
            unit_of_measurement_id: product?.raw?.units_of_measurement_id || undefined
          }
        })
      }

      if (isEditing && initialData?.guid) {
        payload.transaction_guid = initialData.guid
      }

      await createShipment({
        method: isEditing ? "update_shipment_transaction" : "create_shipment_transaction",
        data: payload
      })

      // Clear fields on success
      setShipmentDate(today.toISOString().split('T')[0])
      setIsPlanned(false)
      setLegalEntity('')
      setClient(kontragentId || '')
      setChartOfAccounts([])
      setRows([{ id: 1, name: '', quantity: 0, price: 0, discount: '', nds: '', sum: 0 }])
      setSelectedProducts(new Set())
      setErrors({})

      queryClient.invalidateQueries({ queryKey: ['get_sales_transaction_by_guid'] })
      queryClient.invalidateQueries({ queryKey: ['list_sales_operations'] })
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      onClose()
    }
  }

  const handleRemoveRow = () => {
    const newRow = rows.filter(item => !selectedProducts.has(item.id))
    setRows(newRow)
    setSelectedProducts(new Set())
  }

  const handleSelectProductSerice = (rowId, value) => {

    const product = productServicesList?.find(p => p.guid === value)
    if (!product) return;

    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      const q = Number(product.kolvo) || 0;
      const p = Number(product.tsena_za_ed) || 0;
      return {
        ...row,
        name: value,
        price: p,
        quantity: q,
        discount: product.discount || '',
        nds: product.nds || '',
        sum: q * p
      }
    }))
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
            <h2 className={styles.title}>
              {isEditing ? 'Редактирование отгрузки' : isCopying ? 'Копирование отгрузки' : 'Создание отгрузки'}
            </h2>
            <div className={styles.subtitle}>
              Сделка: <span className={styles.dealLink}>{dealName}</span>
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
              <div className="flex items-center gap-4">
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
                />
                <div style={{ opacity: isFutureDate ? 0.5 : 1, pointerEvents: isFutureDate ? 'none' : 'auto' }}>
                  <OperationCheckbox
                    checked={isFutureDate ? true : isPlanned}
                    onChange={e => {
                      if (!isFutureDate) {
                        setIsPlanned(e.target.checked)
                      }
                    }}
                    label='Плановая отгрузка'
                  />
                </div>
              </div>
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
                      <div className='flex items-center justify-center'>
                        <OperationCheckbox type="checkbox" checked={selectedProducts?.size > 0 && selectedProducts?.size === rows?.length} onChange={(e) => {
                          if (e.target.checked) {
                            const allrows = rows.map((row) => row.id)
                            setSelectedProducts(new Set(allrows))
                          } else {
                            setSelectedProducts(new Set())
                          }
                        }} className={styles.checkbox} />
                      </div>
                    </th>
                    {selectedProducts?.size > 0 && <th colSpan={6}>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <span className="text-sm font-bold text-neutral-900">Выбрано: {selectedProducts?.size}</span>
                          <button
                            className="outline-none border-none bg-transparent text-sm font-medium text-red-600 cursor-pointer flex items-center gap-2"
                            onClick={handleRemoveRow}
                          >
                            <TrashIcon size={16} className='text-red-500' />
                            Убрать из отгрузки
                          </button>
                        </div>
                        <button
                          className='outline-none border-none bg-transparent cursor-pointer'
                          onClick={() => setSelectedProducts(new Set())}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </th>}
                    {selectedProducts?.size === 0 && <>
                      <th>Наименование</th>
                      <th className={styles.numColHeader}>Кол-во</th>
                      <th className={styles.numColHeader}>Цена за ед.</th>
                      <th className={styles.numColHeader}>Скидка</th>
                      <th className={styles.numColHeader}>НДС</th>
                      <th className={styles.numColHeader}>Сумма</th>
                    </>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className={styles.checkCol}>
                        <div className='flex items-center justify-center'>
                          <OperationCheckbox type="checkbox" checked={selectedProducts.has(row.id)} className={styles.checkbox} onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(prev => {
                                const next = new Set(prev)
                                next.add(row.id)
                                return next
                              })
                            } else {
                              setSelectedProducts(prev => {
                                const next = new Set(prev)
                                next.delete(row.id)
                                return next
                              })
                            }
                          }} />
                        </div>
                      </td>
                      <td>
                        <div className={styles.selectWrapper}>
                          <div>
                            <GroupedSelect
                              data={groupedProductServicesList}
                              value={row.name}
                              onChange={(value) => handleSelectProductSerice(row?.id, value)}
                              placeholder="Выберите позицию"
                              groupBy={true}
                              labelKey="label"
                              valueKey="value"
                              className="shipment-grouped-select"
                              dropdownClassName='grouped-select-dropdown'
                            />
                          </div>
                        </div>
                      </td>
                      <td className={styles.numCol}>
                        <input
                          type="text"
                          min={0}
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, 'quantity', formatAmount(e.target.value))}
                          className={styles.numInput}
                        />
                      </td>
                      <td className={styles.numCol}>
                        <input
                          type="text"
                          min={0}
                          value={row.price}
                          onChange={(e) => updateRow(row.id, 'price', formatAmount(e.target.value))}
                          className={styles.numInput}
                        />
                      </td>
                      <td className={styles.numCol}>
                        <input
                          type="text"
                          value={row.discount}
                          maxLength={2}
                          onChange={(e) => updateRow(row.id, 'discount', e.target.value)}
                          className={`${styles.numInput} pr-2`}
                        />
                        <span className='absolute top-1/2 -translate-y-1/2 right-1'>%</span>
                      </td>
                      <td className={styles.numCol}>
                        <input
                          type="text"
                          maxLength={2}
                          value={row.nds}
                          onChange={(e) => updateRow(row.id, 'nds', e.target.value)}
                          className={`${styles.numInput} pr-2`}
                        />
                        <span className='absolute top-1/2 -translate-y-1/2 right-1'>%</span>
                      </td>
                      <td className={styles.numCol}>
                        <input
                          type="text"
                          min={0}
                          value={row.sum}
                          onChange={(e) => updateRow(row.id, 'sum', formatAmount(e.target.value))}
                          className={styles.numInput}
                        />
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
            <button className="primary-btn" onClick={handleCreate}>{
              isCreating ? <Loader /> : 'Создать'
            }</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateShipment
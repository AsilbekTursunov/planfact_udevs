"use client"
import { useState, useMemo, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/app/lib/utils'
import { useDeleteLegalEntities, useLegalEntitiesPlanFact } from '@/hooks/useDashboard'
import LegalEntityMenu from '@/components/directories/LegalEntityMenu/LegalEntityMenu'
import styles from './style.module.scss'
import CreateGroup from '../../../../components/directories/ProductServices/CreateGroup'
import CreateSingle from '../../../../components/directories/ProductServices/CreateSingle'
import { ChevronDown, ChevronUp, ScanSearch, Search } from 'lucide-react'
import Select from '../../../../components/common/Select'
import Input from '../../../../components/shared/Input'

export default function LegalEntitiesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [isCreateSingleOpen, setIsCreateSingleOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [editingLegalEntity, setEditingLegalEntity] = useState(null)
  const [deletingLegalEntity, setDeletingLegalEntity] = useState(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleCreateSingle = () => {
    setIsCreateSingleOpen(true)
    setIsMenuOpen(false)
  }

  const handleCreateGroup = () => {
    setIsCreateGroupOpen(true)
    setIsMenuOpen(false)
  }

  const deleteMutation = useDeleteLegalEntities()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch legal entities using new invoke_function API
  const { data: legalEntitiesData, isLoading: isLoadingLegalEntities } = useLegalEntitiesPlanFact({
    page: 1,
    limit: 100,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery.toLowerCase() }),
  })

  console.log('Legal entities data:', legalEntitiesData)

  // Extract legal entities from response - correct path is data.data.data
  const legalEntitiesItems = useMemo(() => {
    const items = legalEntitiesData?.data?.data?.data || []
    console.log('Legal entities items:', items)
    return Array.isArray(items) ? items : []
  }, [legalEntitiesData])

  // Transform API data to component format
  const entities = useMemo(() => {
    return legalEntitiesItems.map((item) => ({
      id: item.guid,
      guid: item.guid,
      shortName: item.nazvanie || 'Без названия',
      fullName: item.polnoe_nazvanie || '-',
      inn: item.inn?.toString() || '-',
      kpp: item.kpp?.toString() || '-',
      rawData: item // Store raw data for editing
    }))
  }, [legalEntitiesItems])

  const isRowSelected = (id) => selectedRows.includes(id)

  const toggleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(prev => prev.filter(rid => rid !== id))
    } else {
      setSelectedRows(prev => [...prev, id])
    }
  }

  const allSelected = selectedRows.length === entities.length && entities.length > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([])
    } else {
      setSelectedRows(entities.map(e => e.id))
    }
  }

  const filteredData = useMemo(() => {
    // Search is now handled by API, so just return entities
    return entities
  }, [entities])

  const handleEdit = (legalEntity) => {
    setEditingLegalEntity(legalEntity.rawData)
  }

  const handleDelete = (legalEntity) => {
    setDeletingLegalEntity(legalEntity.rawData)
  }

  const handleDeleteConfirm = async () => {
    if (deletingLegalEntity?.guid) {
      try {
        await deleteMutation.mutateAsync([deletingLegalEntity.guid])
        setDeletingLegalEntity(null)
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['legalEntitiesPlanFact'] })
        queryClient.invalidateQueries({ queryKey: ['legalEntitiesV2'] })
      } catch (error) {
        console.error('Error deleting legal entity:', error)
      }
    }
  }

  // Block body scroll when page is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Товары & Услуги</h1>

              <div className={styles.createButtonContainer} ref={menuRef}>
                <button
                  onClick={handleMenuClick}
                  className={styles.createButton}
                >
                  Создать
                  {isMenuOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {isMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <button
                      className={styles.dropdownItem}
                      onClick={handleCreateSingle}
                    >
                      Создать
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={handleCreateGroup}
                    >
                      Создать группу
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* filter by Товары or Услуги   */}

            <div className={styles.filtersContainer}>
              <div className={styles.filtersColumn}>
                {/* <div className={styles.filterLabel}>Тип</div> */}
                <Select
                  options={[
                    { value: 'all', label: 'Все' },
                    { value: 'products', label: 'Товары' },
                    { value: 'services', label: 'Услуги' }
                  ]}
                  defaultValue={{ value: 'all', label: 'Все' }}
                  isSearchable={false}
                />
              </div>

              {/* <Select/> */}

              {/* filter by group and single  */}
              <div className={styles.filtersColumn}>
                {/* <div className={styles.filterLabel}>Группировка</div> */}
                <Select
                  options={[
                    { value: 'none', label: 'Без группировки' },
                    { value: 'group', label: 'По группам' }
                  ]}
                  defaultValue={{ value: 'group', label: 'По группам' }}
                  isSearchable={false}
                />
              </div>
              {/* Search */}

              <div className={styles.searchContainer}>

                <Input
                  type="text"
                  placeholder="Поиск по краткому названию"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <div className={styles.tableOuter}>
            <table className={styles.table}>
              <thead className={styles.theadDefault}>
                <tr>
                  <th className={cn(styles.th, styles.thIndex)}>
                    №
                  </th> 
                  <th className={styles.th}>
                    <button className={styles.headerButton}>
                      Наименование
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                  <th className={styles.th}>Тип</th>
                  <th className={styles.th}>Артикул</th>
                  <th className={styles.th}>Цена за ед</th>
                  <th className={styles.th}>Единица</th>
                  <th className={styles.th}>НДС</th>
                  <th className={styles.th}>Цена с НДС</th>
                  <th className={styles.th}>Комментарий</th>
                  <th className={cn(styles.th, styles.thActions)}></th>
                </tr>
              </thead>

              {/* <tbody className={styles.tbody}>
                {isLoadingLegalEntities ? (
                  <tr>
                    <td colSpan={6} className={styles.td} style={{ textAlign: 'center', padding: '2rem' }}>
                      Загрузка...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.td} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      {searchQuery ? 'Ничего не найдено' : 'Нет данных'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((entity, index) => (
                    <tr key={entity.id} className={styles.row}>
                      <td className={cn(styles.td, styles.tdIndex)}>
                        {index + 1}
                      </td>
                      <td className={styles.td}>{entity.shortName}</td>
                      <td className={styles.tdMuted}>{entity.fullName}</td>
                      <td className={styles.tdMuted}>{entity.inn}</td>
                      <td className={styles.tdMuted}>{entity.kpp}</td>
                      <td className={cn(styles.td, styles.tdActions)} onClick={(e) => e.stopPropagation()}>
                        <LegalEntityMenu
                          legalEntity={entity}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody> */}
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerText}>
            <span className={styles.footerCount}>
              {isLoadingLegalEntities ? 'Загрузка...' : `${legalEntitiesItems.length} ${legalEntitiesItems.length === 1 ? 'юрлицо' : legalEntitiesItems.length < 5 ? 'юрлица' : 'юрлиц'}`}
            </span>
          </div>
        </div>
      </div>

      <CreateSingle open={isCreateSingleOpen} setOpen={() => setIsCreateSingleOpen(false)} />

      <CreateGroup open={isCreateGroupOpen} setOpen={() => setIsCreateGroupOpen(false)} />

    </div>
  )
}

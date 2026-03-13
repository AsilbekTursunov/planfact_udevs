"use client"
import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/app/lib/utils'
import { useLegalEntitiesPlanFact } from '@/hooks/useDashboard'
import styles from './style.module.scss'
import CreateGroup from '../../../../components/directories/ProductServices/CreateGroup'
import CreateSingle from '../../../../components/directories/ProductServices/CreateSingle'
import { ChevronDown, ChevronUp, Search, MoreVertical } from 'lucide-react'
import Select from '../../../../components/common/Select'
import Input from '../../../../components/shared/Input'
import { useUcodeDefaultApiQuery, useUcodeDefaultApiMutation } from '../../../../hooks/useDashboard'

import { MdOutlineModeEdit } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { IoCopyOutline } from "react-icons/io5";
import CustomModal from '../../../../components/shared/CustomModal';
import Loader from '../../../../components/shared/Loader'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'


export default function LegalEntitiesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isCreateSingleOpen, setIsCreateSingleOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [filters, setFilters] = useState({
    type: { value: 'all', label: 'Все' },
    group: { value: 'none', label: 'Без группировки' },
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openRowMenuId, setOpenRowMenuId] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [isCopying, setIsCopying] = useState(false)
  const menuRef = useRef(null)
  const rowMenuRef = useRef(null)

  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const toggleGroup = (id) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const { mutateAsync: deleteProductService } = useUcodeDefaultApiMutation({ mutationKey: 'DELETE_PRODUCT_SERVICE' })

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

  // Close row action menu on outside click
  useEffect(() => {
    const handleRowMenuClose = (event) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(event.target)) {
        setOpenRowMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleRowMenuClose)
    return () => document.removeEventListener('mousedown', handleRowMenuClose)
  }, [])

  const { data: productServices, isLoading } = useUcodeDefaultApiQuery({
    queryKey: "get_product_services_list",
    urlMethod: "GET",
    urlParams: "/items/product_and_service?from-ofs=true&offset=0&limit=10",
    querySetting: {
      select: data => data?.data?.data?.response
    }
  })



  const { data: productServicesGrouped } = useUcodeDefaultApiQuery({
    queryKey: 'product-services-grouped',
    urlMethod: 'GET',
    urlParams: '/items/group_product_and_service?from-ofs=true&offset=0&limit=10',
    querySetting: {
      select: data => data?.data?.data?.response
    }
  }); 

  const productServicesList = useMemo(() => {
    const rawList = productServices?.filter(item => filters?.type?.value === 'all' ? true : item.status?.includes(filters?.type?.value)).map(item => {
      const price = Number(item?.tsena_za_ed) || 0;
      const vatStr = item?.nds || '';
      const vatNum = parseFloat(vatStr) || 0;
      const priceWithVat = vatNum > 0 ? price * (1 + vatNum / 100) : price;

      const groupData = item?.group_product_and_service_id_data;
      const groupName = groupData ? (groupData.name || groupData.nazvanie || groupData.naimenovanie || 'Без группы') : 'Товары без группы';
      const groupId = groupData ? groupData.guid : 'no-group';

      return {
        guid: item?.guid,
        name: item?.naimenovanie,
        artikul: item?.artikul,
        group: item?.group_data?.nazvanie_gruppy || '—',
        price,
        unit: item?.units_of_measurement_id_data?.full_name || item?.units_of_measurement_id_data?.abbreviation || '—',
        vat: vatStr ? `${vatStr}%` : '—',
        priceWithVat: Math.round(priceWithVat),
        comment: item?.commentary || '',
        type: item?.status ? item?.status?.[0] === 'product' ? 'Товары' : 'Услуги' : '',
        raw: item,
        groupName: groupName,
        groupId: groupId
      }
    }) || []

    if (filters?.group?.value === 'none') {
      return rawList;
    }

    const groupsMap = new Map();

    if (productServicesGrouped) {
      productServicesGrouped.forEach(group => {
        groupsMap.set(group.guid, {
          isGroup: true,
          guid: group.guid,
          name: group.name || group.nazvanie_gruppy || 'Без названия',
          items: []
        });
      });
    }

    rawList.forEach(item => {
      if (!groupsMap.has(item.groupId)) {
        groupsMap.set(item.groupId, {
          isGroup: true,
          guid: item.groupId,
          name: item.groupName,
          items: []
        });
      }
      groupsMap.get(item.groupId).items.push(item);
    });

    const groupedArray = Array.from(groupsMap.values());
    groupedArray.sort((a, b) => {
      if (a.guid === 'no-group') return -1;
      if (b.guid === 'no-group') return 1;
      return a.name.localeCompare(b.name);
    });

    return groupedArray;
  }, [productServices, productServicesGrouped, filters])


  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleCreateSingle = () => {
    setItemToEdit(null)
    setIsCopying(false)
    setIsCreateSingleOpen(true)
    setIsMenuOpen(false)
  }

  const handleCreateGroup = () => {
    setIsCreateGroupOpen(true)
    setIsMenuOpen(false)
  }


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

  // Extract legal entities from response - correct path is data.data.data
  const legalEntitiesItems = useMemo(() => {
    const items = legalEntitiesData?.data?.data?.data || []
    console.log('Legal entities items:', items)
    return Array.isArray(items) ? items : []
  }, [legalEntitiesData])

  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.guid) return;
    setIsDeletingItem(true);
    try {
      await deleteProductService({
        urlMethod: 'DELETE',
        urlParams: `/items/product_and_service/${itemToDelete.guid}?from-ofs=true`,
        data: { guid: itemToDelete.guid }
      });
      queryClient.invalidateQueries({ queryKey: ['get_product_services_list'] });
      setItemToDelete(null);
    } catch (e) {
      console.error('delete error', e);
    } finally {
      setIsDeletingItem(false);
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
                <Select
                  instanceId="product-service-type-filter"
                  options={[
                    { value: 'all', label: 'Все' },
                    { value: 'product', label: 'Товары' },
                    { value: 'service', label: 'Услуги' }
                  ]}
                  value={filters.type}
                  isSearchable={false}
                  onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                />
              </div>

              <div className={styles.filtersColumn}>
                {/* <div className={styles.filterLabel}>Группировка</div> */}
                <Select
                  instanceId="product-service-grouping-filter"
                  options={[
                    { value: 'none', label: 'Без группировки' },
                    { value: 'group', label: 'По группам' }
                  ]}
                  value={filters.group}
                  onChange={(value) => setFilters(prev => ({ ...prev, group: value }))}
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
                  <th className={cn(styles.th, styles.thIndex)}>№</th>
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
                  <th className={styles.th}>Группа</th>
                  <th className={styles.th}>Цена за ед.</th>
                  <th className={styles.th}>Единица</th>
                  <th className={styles.th}>НДС</th>
                  <th className={styles.th}>Цена с НДС</th>
                  <th className={styles.th}>Комментарий</th>
                  <th className={cn(styles.th, styles.thActions)}></th>
                </tr>
              </thead>

              <tbody className={styles.tbody}>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className={styles.td} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      Загрузка...
                    </td>
                  </tr>
                ) : productServicesList.length === 0 ? (
                  <tr>
                      <td colSpan={11} className={styles.td} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                        Нет данных
                    </td>
                  </tr>
                ) : (
                      productServicesList.map((item, index) => {
                        if (item.isGroup) {
                          const isExpanded = expandedGroups.has(item.guid);
                          return (
                            <React.Fragment key={item.guid}>
                              <tr className={cn(styles.row, styles.groupRow)} onClick={() => toggleGroup(item.guid)} style={{ cursor: 'pointer', background: '#f9fafb' }}>
                                <td colSpan={11} className={styles.td} style={{ padding: '12px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleGroup(item.guid); }}
                                    >
                                      {isExpanded ? <ExpendClose /> : <ExpendOpen />}
                                    </button>
                                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>{item.name} ({item.items.length})</span>
                                  </div>
                                </td>
                              </tr>

                              {isExpanded && item.items.length === 0 && (
                                <tr className={styles.row}>
                                  <td colSpan={11} className={styles.td} style={{ textAlign: 'center', padding: '16px', color: '#9ca3af' }}>
                                    Нет данных
                                  </td>
                                </tr>
                              )}

                              {isExpanded && item.items.map((child, childIndex) => (
                                <tr key={child.guid || childIndex} className={styles.row}>
                                  <td className={cn(styles.td, styles.tdIndex)}>
                                    <div style={{ borderLeft: '1px dashed #d1d5db', height: '40px', marginLeft: '20px' }} />
                                  </td>
                                  <td className={styles.td} style={{ fontWeight: 500, paddingLeft: '1rem' }}>{child.name || '—'}</td>
                                  <td className={styles.tdMuted}>{child.type || '—'}</td>
                                  <td className={styles.tdMuted}>{child.artikul || '—'}</td>
                                  <td className={styles.tdMuted}>{child.groupName}</td>
                                  <td className={styles.td}>{child.price ? `${child.price.toLocaleString('ru-RU')} ₽` : '—'}</td>
                                  <td className={styles.tdMuted}>{child.unit}</td>
                                  <td className={styles.tdMuted}>{child.vat}</td>
                                  <td className={styles.td}>{child.priceWithVat ? `${child.priceWithVat.toLocaleString('ru-RU')} ₽` : '—'}</td>
                                  <td className={styles.tdMuted} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.comment || '—'}</td>
                                  <td className={cn(styles.td, styles.tdActions)} onClick={(e) => e.stopPropagation()}>
                                    <div style={{ position: 'relative' }} ref={openRowMenuId === child.guid ? rowMenuRef : null}>
                                      <button className={styles.rowMenuButton} onClick={() => setOpenRowMenuId(openRowMenuId === child.guid ? null : child.guid)}>
                                        <MoreVertical size={16} />
                                      </button>
                                      {openRowMenuId === child.guid && (
                                        <div className={styles.rowMenu}>
                                          <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(child.raw); setIsCopying(false); setIsCreateSingleOpen(true); }}>
                                            <MdOutlineModeEdit size={14} color='#686868' /> Редактировать
                                          </button>
                                          <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(child.raw); setIsCopying(true); setIsCreateSingleOpen(true); }}>
                                            <IoCopyOutline size={14} color='#686868' /> Копировать
                                          </button>
                                          <button className={cn(styles.rowMenuItem, styles.rowMenuItemDanger)} onClick={() => { setOpenRowMenuId(null); setItemToDelete(child); }}>
                                            <GoTrash size={14} color='#ef4444' /> Удалить
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          )
                        } else {
                          return (
                        <tr key={item.guid || index} className={styles.row}>
                          <td className={cn(styles.td, styles.tdIndex)}>{index + 1}</td>
                          <td className={styles.td} style={{ fontWeight: 500 }}>{item.name || '—'}</td>
                          <td className={styles.tdMuted}>{item.type || '—'}</td>
                          <td className={styles.tdMuted}>{item.artikul || '—'}</td>
                          <td className={styles.tdMuted}>{item.groupName}</td>
                          <td className={styles.td}>{item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : '—'}</td>
                          <td className={styles.tdMuted}>{item.unit}</td>
                          <td className={styles.tdMuted}>{item.vat}</td>
                          <td className={styles.td}>{item.priceWithVat ? `${item.priceWithVat.toLocaleString('ru-RU')} ₽` : '—'}</td>
                          <td className={styles.tdMuted} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.comment || '—'}</td>
                              <td className={cn(styles.td, styles.tdActions)} onClick={(e) => e.stopPropagation()}>
                            <div style={{ position: 'relative' }} ref={openRowMenuId === item.guid ? rowMenuRef : null}>
                                  <button className={styles.rowMenuButton} onClick={() => setOpenRowMenuId(openRowMenuId === item.guid ? null : item.guid)}>
                                <MoreVertical size={16} />
                              </button>
                              {openRowMenuId === item.guid && (
                                <div className={styles.rowMenu}>
                                      <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(false); setIsCreateSingleOpen(true); }}>
                                        <MdOutlineModeEdit size={14} color='#686868' /> Редактировать
                                  </button>
                                      <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(true); setIsCreateSingleOpen(true); }}>
                                        <IoCopyOutline size={14} color='#686868' /> Копировать
                                  </button>
                                  <button className={cn(styles.rowMenuItem, styles.rowMenuItemDanger)} onClick={() => { setOpenRowMenuId(null); setItemToDelete(item); }}>
                                        <GoTrash size={14} color='#ef4444' /> Удалить
                                  </button>
                                </div>
                              )}
                            </div>
                              </td>
                            </tr>
                          )
                        }
                      })
                )}
              </tbody>

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

      <CreateSingle
        open={isCreateSingleOpen}
        setOpen={(open) => {
          setIsCreateSingleOpen(open);
          if (!open) { setItemToEdit(null); setIsCopying(false); }
        }}

        initialData={itemToEdit}
        isEditing={!!itemToEdit && !isCopying}
      />

      <CreateGroup open={isCreateGroupOpen} setOpen={() => setIsCreateGroupOpen(false)} />

      <CustomModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)}>
        <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#101828', fontFamily: 'Inter, sans-serif' }}>
          Удалить товар
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#344054', lineHeight: '20px', fontFamily: 'Inter, sans-serif' }}>
          Вы действительно хотите удалить товар «<strong>{itemToDelete?.name}</strong>» ?<br />Восстановить его будет невозможно.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={() => setItemToDelete(null)}
            style={{ background: 'transparent', border: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#0c8c9a', padding: '8px 16px', cursor: 'pointer' }}
          >
            Отменить
          </button>
          <button
            disabled={isDeletingItem}
            onClick={handleDeleteConfirm}
            style={{ background: isDeletingItem ? '#f98080' : '#F04438', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, padding: '8px 20px', cursor: 'pointer' }}
          >
            {isDeletingItem ? <Loader /> : 'Удалить'}
          </button>
        </div>
      </CustomModal>

    </div>
  )
}

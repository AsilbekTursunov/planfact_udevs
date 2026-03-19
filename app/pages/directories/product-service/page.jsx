"use client"
import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/app/lib/utils'
import { useLegalEntitiesPlanFact } from '@/hooks/useDashboard'
import styles from './style.module.scss'
import CreateGroup from '../../../../components/directories/ProductServices/CreateGroup'
import CreateSingle from '../../../../components/directories/ProductServices/CreateSingle'
import { ChevronDown, ChevronUp, Search, MoreVertical, Download } from 'lucide-react'
import Select from '../../../../components/common/Select'
import Input from '../../../../components/shared/Input'
import { useUcodeDefaultApiQuery, useUcodeDefaultApiMutation } from '../../../../hooks/useDashboard'

import { MdOutlineModeEdit } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { IoCopyOutline } from "react-icons/io5";
import CustomModal from '../../../../components/shared/CustomModal';
import Loader from '../../../../components/shared/Loader'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'
import OperationCheckbox from '../../../../components/shared/Checkbox/operationCheckbox'


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
  const [editGroup, setEditGroup] = useState(null)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [isCopying, setIsCopying] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set())
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

  console.log('productServices', productServices)
  console.log('productServicesGrouped', productServicesGrouped)

  const productServicesList = useMemo(() => {
    const rawList = productServices?.filter(item => filters?.type?.value === 'all' ? true : item.status?.includes(filters?.type?.value)).map(item => {
      const price = Number(item?.tsena_za_ed) || 0;
      const vatStr = item?.nds || '';
      const vatNum = parseFloat(vatStr) || 0;
      const priceWithVat = vatNum > 0 ? price * (1 + vatNum / 100) : price;

      const groupData = item?.group_product_and_service_id_data;
      const groupName = groupData ? (groupData.name || groupData.nazvanie || groupData.naimenovanie || 'Без группы') : 'Товары & Услуги без группы ';
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
          items: [],
          raw: group,
          commentary: group.commentary,
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

  const isAllExpanded = useMemo(() => {
    const groupCount = productServicesList.filter(item => item.isGroup).length;
    return groupCount > 0 && expandedGroups.size === groupCount;
  }, [expandedGroups, productServicesList])

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedGroups(new Set())
    } else {
      const allGroupIds = productServicesList.filter(item => item.isGroup).map(g => g.guid);
      setExpandedGroups(new Set(allGroupIds))
    }
  }


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

  const handleSelectAll = () => {
    if (selectedItems.size === productServicesList.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(productServicesList.map(item => item.guid)))
    }
  }

  const handleSelectChilds = (group) => {
    const childs = group.items.map(item => item.guid)
    setSelectedItems(new Set(childs))
  }

  const handleSelectChild = (child) => {
    setSelectedItems(new Set([...selectedItems, child.guid]))
  }

  return (
    <>
      <div className="flex flex-col flex-1 w-full h-full p-3 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="h1 text-xl text-neutral-700 font-semibold">Товары & Услуги</h1>
            <div ref={menuRef} className="flex items-center gap-2 relative">
              <button onClick={handleMenuClick} className="primary-btn flex items-center gap-2 ">
                Создать
                {isMenuOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {isMenuOpen && (
                <div className="absolute top-full w-32 p-2 flex flex-col justify-start items-start left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    className=" text-neutral-700 font-normal hover:bg-neutral-100 w-full text-start text-sm p-1 cursor-pointer"
                    onClick={handleCreateSingle}
                  >
                    Создать
                  </button>
                  <button
                    className=" text-neutral-700 font-normal hover:bg-neutral-100 w-full text-start text-sm p-1 cursor-pointer"
                    onClick={handleCreateGroup}
                  >
                    Создать группу
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ">
            <button className="outline-btn flex items-center gap-2 bg-white p-2 ">
              <Download size={16} />
              <span>.xls</span>
            </button>
            <div className="w-32 h-10">
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
            <div className="w-44 h-10">
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
            <div className="w-64 h-10">
              <Input
                type="text"
                placeholder="Поиск по краткому названию"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>
          </div>
        </div>
        <div id="table-container" className="flex-1 w-full">
          <table className='w-full max-h-[calc(100vh-60px)] overflow-y-auto'>
            <thead className='z-30 sticky top-0'>
              <tr className='bg-neutral-100 text-neutral-500 font-normal text-sm w-full border-b border-gray-300'>
                <th className='w-10'>
                  <div className=' flex items-center justify-center'>
                    <OperationCheckbox checked={selectedItems.size === productServicesList.length} onChange={handleSelectAll} />
                  </div>
                </th>
                <th className='p-3 text-start'>
                  <div className="flex items-center gap-2">
                    {filters?.group?.value === 'group' && (
                      <button
                        onClick={toggleExpandAll}
                        className="p-1 hover:bg-neutral-200 rounded cursor-pointer"
                      >
                        {isAllExpanded ? <ExpendClose /> : <ExpendOpen />}
                      </button>
                    )}
                    <span>Наименование</span>
                  </div>
                </th>
                <th className='p-3 text-start'> Артикул</th>
                <th className='p-3 text-end'> Цена за ед.</th>
                <th className='p-3 text-center'> Единица</th>
                <th className='p-3 text-center'> НДС</th>
                <th className='p-3 text-end'> Цена с НДС</th>
                <th className='p-3 text-start'> Комментарий</th>
                <th className='p-3 text-start w-10'> &nbsp;</th>
              </tr>
            </thead>
            <tbody className=' flex-1 overflow-y-auto'>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-neutral-400">
                    Загрузка...
                  </td>
                </tr>
              ) : productServicesList.length === 0 ? (
                <tr>
                    <td colSpan={9} className="p-8 text-center text-neutral-400">
                      Нет данных
                    </td>
                  </tr>
                ) : (
                    productServicesList.map((item, index) => {
                      if (item.isGroup) {
                        const isExpanded = expandedGroups.has(item.guid);
                        const isAllChildsSelected = item?.items?.length > 0 && item.items.every(child => selectedItems.has(child.guid));
                        return (
                          <React.Fragment key={item.guid}>
                          <tr
                            className="hover:bg-neutral-50 bg-neutral-50/50 font-medium cursor-pointer border-b border-gray-200"
                            onClick={() => toggleGroup(item.guid)}
                          >
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center">
                                <OperationCheckbox checked={isAllChildsSelected} onChange={() => handleSelectChilds(item)} />
                              </div>
                            </td>
                              <td colSpan={6} className="p-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleGroup(item.guid); }}
                                  className="p-1 hover:bg-neutral-100 rounded"
                                >
                                  {isExpanded ? <ExpendClose /> : <ExpendOpen />}
                                </button>
                                <span className="font-semibold text-neutral-800 text-sm">
                                  {item.name} ({item.items.length})
                                </span>
                              </div>
                            </td>
                              <td className="p-3 text-center">
                                <p className='text-xs font-normal text-neutral-500'>{item.commentary}</p>
                              </td>
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              {item.guid !== 'no-group' && (
                                <div className="relative inline-block" ref={openRowMenuId === item.guid ? rowMenuRef : null}>
                                  <button
                                    className="p-1 hover:bg-neutral-200 cursor-pointer rounded-full"
                                    onClick={() => setOpenRowMenuId(openRowMenuId === item.guid ? null : item.guid)}
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  {openRowMenuId === item.guid && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-36 p-1 flex flex-col font-normal text-sm">
                                        <button className="flex items-center gap-2 p-1.5 text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer" onClick={() => {
                                          setOpenRowMenuId(null); setItemToEdit(item.raw || item); setIsCopying(false); setIsCreateGroupOpen(true);
                                          setEditGroup(item)
                                        }}>
                                        <MdOutlineModeEdit size={14} className="text-neutral-500" /> Редактировать
                                      </button>
                                      <button className="flex items-center gap-2 p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer" onClick={() => { setOpenRowMenuId(null); setItemToDelete(item); }}>
                                        <GoTrash size={14} className="text-red-500" /> Удалить
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>

                          {isExpanded && item.items.length === 0 && (
                            <tr>
                              <td colSpan={9} className="p-4 text-center text-neutral-400 text-sm">
                                Нет данных
                              </td>
                            </tr>
                          )}

                          {isExpanded && item.items.map((child, childIndex) => (
                          <tr key={child.guid || childIndex} className="hover:bg-neutral-50 border-b border-gray-200 text-sm">
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center">
                                <OperationCheckbox checked={selectedItems.has(child.guid)} onChange={() => handleSelectChild(child)} />
                              </div>
                            </td>
                            <td className="p-3 text-start font-medium text-neutral-700 pl-8 relative">
                              <div className="absolute left-4 top-1/2 -ms-1  h-full border-s border-dashed border-gray-300 -translate-y-1/2" />
                              {child.name || '—'}
                            </td>
                            <td className="p-3 text-start text-neutral-500">{child.artikul || '—'}</td>
                            <td className="p-3 text-end text-neutral-700">{child.price ? `${child.price.toLocaleString('ru-RU')} ₽` : '—'}</td>
                            <td className="p-3 text-center text-neutral-500">{child.unit}</td>
                            <td className="p-3 text-center text-neutral-500">{child.vat}</td>
                            <td className="p-3 text-end text-neutral-700">{child.priceWithVat ? `${child.priceWithVat.toLocaleString('ru-RU')} ₽` : '—'}</td>
                            <td className="p-3 text-start text-neutral-500 max-w-[160px] overflow-hidden text-overflow-ellipsis whitespace-nowrap">{child.comment || '—'}</td>
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block" ref={openRowMenuId === child.guid ? rowMenuRef : null}>
                                <button
                                  className="p-1 hover:bg-neutral-200 rounded-full"
                                  onClick={() => setOpenRowMenuId(openRowMenuId === child.guid ? null : child.guid)}
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {openRowMenuId === child.guid && (
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-36 p-1 flex flex-col">
                                    <button className="flex items-center gap-2 p-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer" onClick={() => { setOpenRowMenuId(null); setItemToEdit(child.raw); setIsCopying(false); setIsCreateSingleOpen(true); }}>
                                      <MdOutlineModeEdit size={14} className="text-neutral-500" /> Редактировать
                                    </button>
                                    <button className="flex items-center gap-2 p-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer" onClick={() => { setOpenRowMenuId(null); setItemToEdit(child.raw); setIsCopying(true); setIsCreateSingleOpen(true); }}>
                                      <IoCopyOutline size={14} className="text-neutral-500" /> Копировать
                                    </button>
                                    <button className="flex items-center gap-2 p-1.5 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer" onClick={() => { setOpenRowMenuId(null); setItemToDelete(child); }}>
                                      <GoTrash size={14} className="text-red-500" /> Удалить
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
                        <tr key={item.guid || index} className="hover:bg-neutral-50 border-b border-gray-200 text-sm">
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center">
                              <OperationCheckbox checked={selectedItems.has(item.guid)} onChange={() => handleSelectChild(item)} />
                            </div>
                          </td>
                          <td className="p-3 text-start font-medium text-neutral-700">{item.name || '—'}</td>
                          <td className="p-3 text-start text-neutral-500">{item.artikul || '—'}</td>
                          <td className="p-3 text-end text-neutral-700">{item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : '—'}</td>
                          <td className="p-3 text-center text-neutral-500">{item.unit}</td>
                          <td className="p-3 text-center text-neutral-500">{item.vat}</td>
                          <td className="p-3 text-end text-neutral-700">{item.priceWithVat ? `${item.priceWithVat.toLocaleString('ru-RU')} ₽` : '—'}</td>
                          <td className="p-3 text-start text-neutral-500 max-w-[160px] overflow-hidden text-overflow-ellipsis whitespace-nowrap">{item.comment || '—'}</td>
                          <td className="p-3 text-center w-10 " onClick={(e) => e.stopPropagation()}>
                            <div className="relative  inline-block" ref={openRowMenuId === item.guid ? rowMenuRef : null}>
                              <button
                                className="p-1 hover:bg-neutral-200 cursor-pointer rounded-full"
                                onClick={() => setOpenRowMenuId(openRowMenuId === item.guid ? null : item.guid)}
                              >
                                <MoreVertical size={16} />
                              </button>
                              {openRowMenuId === item.guid && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-36 p-1 flex flex-col">
                                  <button className="flex items-center gap-2 p-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer" onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(false); setIsCreateSingleOpen(true); }}>
                                    <MdOutlineModeEdit size={14} className="text-neutral-500" /> Редактировать
                                  </button>
                                  <button className="flex items-center gap-2 p-1.5 text-sm text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer" onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(true); setIsCreateSingleOpen(true); }}>
                                    <IoCopyOutline size={14} className="text-neutral-500" /> Копировать
                                  </button>
                                  <button className="flex items-center  gap-2 p-1.5 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer" onClick={() => { setOpenRowMenuId(null); setItemToDelete(item); }}>
                                    <GoTrash size={14} className="text-red-500" /> Удалить
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
      <div className="fixed bottom-0 left-[80px] py-4 px-3 right-0 bg-white border-t border-gray-200">
        <div className={styles.footerText}>
          <span className={styles.footerCount}>
            {isLoadingLegalEntities ? 'Загрузка...' : `${legalEntitiesItems.length} ${legalEntitiesItems.length === 1 ? 'юрлицо' : legalEntitiesItems.length < 5 ? 'юрлица' : 'юрлиц'}`}
          </span>
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

      <CreateGroup initialData={editGroup} open={isCreateGroupOpen} setOpen={() => setIsCreateGroupOpen(false)} />

      <CustomModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)}>
        <h2 className="mb-3 text-xl font-bold text-neutral-900 font-sans">
          Удалить товар
        </h2>
        <p className="mb-7 text-sm text-neutral-600 leading-5 font-sans">
          Вы действительно хотите удалить товар «<strong>{itemToDelete?.name}</strong>» ?<br />Восстановить его будет невозможно.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setItemToDelete(null)}
            className="bg-transparent text-[#0c8c9a] font-semibold text-sm px-4 py-2 hover:bg-neutral-50 rounded-md"
          >
            Отменить
          </button>
          <button
            disabled={isDeletingItem}
            onClick={handleDeleteConfirm}
            className="delete-btn flex items-center justify-center font-semibold text-sm px-5 py-2"
          >
            {isDeletingItem ? <Loader /> : 'Удалить'}
          </button>
        </div>
      </CustomModal>
    </>


    // <div className={styles.container}>
    //   <div className={styles.content}>
    //     {/* Header */}
    //


    //     {/* Table */}
    //     <div className={styles.tableWrapper}>
    //       <div className={styles.tableOuter}>
    //         <table className={styles.table}>
    //           <thead className={styles.theadDefault}>
    //             <tr>
    //               <th className={cn(styles.th, styles.thIndex)}>№</th>
    //               <th className={styles.th}>
    //                 <button className={styles.headerButton}>
    //                   Наименование
    //                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    //                   </svg>
    //                 </button>
    //               </th>
    //               <th className={styles.th}>Тип</th>
    //               <th className={styles.th}>Артикул</th>
    //               <th className={styles.th}>Группа</th>
    //               <th className={styles.th}>Цена за ед.</th>
    //               <th className={styles.th}>Единица</th>
    //               <th className={styles.th}>НДС</th>
    //               <th className={styles.th}>Цена с НДС</th>
    //               <th className={styles.th}>Комментарий</th>
    //               <th className={cn(styles.th, styles.thActions)}></th>
    //             </tr>
    //           </thead>

    //           <tbody className={styles.tbody}>
    //             {isLoading ? (
    //               <tr>
    //                 <td colSpan={11} className={styles.td} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
    //                   Загрузка...
    //                 </td>
    //               </tr>
    //             ) : productServicesList.length === 0 ? (
    //               <tr>
    //                   <td colSpan={11} className={styles.td} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
    //                     Нет данных
    //                 </td>
    //               </tr>
    //             ) : (
    //                   productServicesList.map((item, index) => {
    //                     if (item.isGroup) {
    //                       const isExpanded = expandedGroups.has(item.guid);
    //                       return (
    //                         <React.Fragment key={item.guid}>
    //                           <tr className={cn(styles.row, styles.groupRow)} onClick={() => toggleGroup(item.guid)} style={{ cursor: 'pointer', background: '#f9fafb' }}>
    //                             <td colSpan={11} className={styles.td} style={{ padding: '12px 16px' }}>
    //                               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //                                 <button
    //                                   onClick={(e) => { e.stopPropagation(); toggleGroup(item.guid); }}
    //                                 >
    //                                   {isExpanded ? <ExpendClose /> : <ExpendOpen />}
    //                                 </button>
    //                                 <span style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>{item.name} ({item.items.length})</span>
    //                               </div>
    //                             </td>
    //                           </tr>

    //                           {isExpanded && item.items.length === 0 && (
    //                             <tr className={styles.row}>
    //                               <td colSpan={11} className={styles.td} style={{ textAlign: 'center', padding: '16px', color: '#9ca3af' }}>
    //                                 Нет данных
    //                               </td>
    //                             </tr>
    //                           )}

    //                           {isExpanded && item.items.map((child, childIndex) => (
    //                             <tr key={child.guid || childIndex} className={styles.row}>
    //                               <td className={cn(styles.td, styles.tdIndex)}>
    //                                 <div style={{ borderLeft: '1px dashed #d1d5db', height: '40px', marginLeft: '20px' }} />
    //                               </td>
    //                               <td className={styles.td} style={{ fontWeight: 500, paddingLeft: '1rem' }}>{child.name || '—'}</td>
    //                               <td className={styles.tdMuted}>{child.type || '—'}</td>
    //                               <td className={styles.tdMuted}>{child.artikul || '—'}</td>
    //                               <td className={styles.tdMuted}>{child.groupName}</td>
    //                               <td className={styles.td}>{child.price ? `${child.price.toLocaleString('ru-RU')} ₽` : '—'}</td>
    //                               <td className={styles.tdMuted}>{child.unit}</td>
    //                               <td className={styles.tdMuted}>{child.vat}</td>
    //                               <td className={styles.td}>{child.priceWithVat ? `${child.priceWithVat.toLocaleString('ru-RU')} ₽` : '—'}</td>
    //                               <td className={styles.tdMuted} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.comment || '—'}</td>
    //                               <td className={cn(styles.td, styles.tdActions)} onClick={(e) => e.stopPropagation()}>
    //                                 <div style={{ position: 'relative' }} ref={openRowMenuId === child.guid ? rowMenuRef : null}>
    //                                   <button className={styles.rowMenuButton} onClick={() => setOpenRowMenuId(openRowMenuId === child.guid ? null : child.guid)}>
    //                                     <MoreVertical size={16} />
    //                                   </button>
    //                                   {openRowMenuId === child.guid && (
    //                                     <div className={styles.rowMenu}>
    //                                       <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(child.raw); setIsCopying(false); setIsCreateSingleOpen(true); }}>
    //                                         <MdOutlineModeEdit size={14} color='#686868' /> Редактировать
    //                                       </button>
    //                                       <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(child.raw); setIsCopying(true); setIsCreateSingleOpen(true); }}>
    //                                         <IoCopyOutline size={14} color='#686868' /> Копировать
    //                                       </button>
    //                                       <button className={cn(styles.rowMenuItem, styles.rowMenuItemDanger)} onClick={() => { setOpenRowMenuId(null); setItemToDelete(child); }}>
    //                                         <GoTrash size={14} color='#ef4444' /> Удалить
    //                                       </button>
    //                                     </div>
    //                                   )}
    //                                 </div>
    //                               </td>
    //                             </tr>
    //                           ))}
    //                         </React.Fragment>
    //                       )
    //                     } else {
    //                       return (
    //                     <tr key={item.guid || index} className={styles.row}>
    //                       <td className={cn(styles.td, styles.tdIndex)}>{index + 1}</td>
    //                       <td className={styles.td} style={{ fontWeight: 500 }}>{item.name || '—'}</td>
    //                       <td className={styles.tdMuted}>{item.type || '—'}</td>
    //                       <td className={styles.tdMuted}>{item.artikul || '—'}</td>
    //                       <td className={styles.tdMuted}>{item.groupName}</td>
    //                       <td className={styles.td}>{item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : '—'}</td>
    //                       <td className={styles.tdMuted}>{item.unit}</td>
    //                       <td className={styles.tdMuted}>{item.vat}</td>
    //                       <td className={styles.td}>{item.priceWithVat ? `${item.priceWithVat.toLocaleString('ru-RU')} ₽` : '—'}</td>
    //                       <td className={styles.tdMuted} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.comment || '—'}</td>
    //                           <td className={cn(styles.td, styles.tdActions)} onClick={(e) => e.stopPropagation()}>
    //                         <div style={{ position: 'relative' }} ref={openRowMenuId === item.guid ? rowMenuRef : null}>
    //                               <button className={styles.rowMenuButton} onClick={() => setOpenRowMenuId(openRowMenuId === item.guid ? null : item.guid)}>
    //                             <MoreVertical size={16} />
    //                           </button>
    //                           {openRowMenuId === item.guid && (
    //                             <div className={styles.rowMenu}>
    //                                   <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(false); setIsCreateSingleOpen(true); }}>
    //                                     <MdOutlineModeEdit size={14} color='#686868' /> Редактировать
    //                               </button>
    //                                   <button className={styles.rowMenuItem} onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(true); setIsCreateSingleOpen(true); }}>
    //                                     <IoCopyOutline size={14} color='#686868' /> Копировать
    //                               </button>
    //                               <button className={cn(styles.rowMenuItem, styles.rowMenuItemDanger)} onClick={() => { setOpenRowMenuId(null); setItemToDelete(item); }}>
    //                                     <GoTrash size={14} color='#ef4444' /> Удалить
    //                               </button>
    //                             </div>
    //                           )}
    //                         </div>
    //                           </td>
    //                         </tr>
    //                       )
    //                     }
    //                   })
    //             )}
    //           </tbody>

    //         </table>
    //       </div>
    //     </div>

    //     {/* Footer */}
    //     <div className={styles.footer}>
    //       <div className={styles.footerText}>
    //         <span className={styles.footerCount}>
    //           {isLoadingLegalEntities ? 'Загрузка...' : `${legalEntitiesItems.length} ${legalEntitiesItems.length === 1 ? 'юрлицо' : legalEntitiesItems.length < 5 ? 'юрлица' : 'юрлиц'}`}
    //         </span>
    //       </div>
    //     </div>
    //   </div>



    // </div>
  )
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import styles from './deal-detail.module.scss';
import { useUcodeRequestQuery, useUcodeDefaultApiQuery, useUcodeDefaultApiMutation } from '../../../../hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import DealStatus from '../../../../components/deals/details/Status';
import CreateShipment from '../../../../components/deals/details/CreatingShipment';
import { CirclePlus, Ellipsis, Search, MoreVertical } from 'lucide-react';
import { HiOutlineDatabase } from "react-icons/hi";
import { PiDatabaseFill } from "react-icons/pi";
import { MdOutlineModeEdit } from "react-icons/md";
import { GoTrash } from "react-icons/go";
import { IoCopyOutline } from "react-icons/io5";
import Input from '../../../../components/shared/Input';
import OperationCheckbox from '../../../../components/shared/Checkbox/operationCheckbox';
import OperationModal from '../../../../components/operations/OperationModal/OperationModal';
import CreateProductService from '../../../../components/deals/details/CreateProductService';
import CustomModal from '../../../../components/shared/CustomModal';
import Loader from '../../../../components/shared/Loader';
import { formatDateFormat } from '../../../../utils/formatDate';
import { formatAmount } from '../../../../utils/helpers';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id;
  const queryClient = useQueryClient();

  const { data: dealData } = useUcodeRequestQuery({
    method: "get_sales_transaction_by_guid",
    data: {
      guid: dealId
    },
    querySetting: {
      select: (response) => response?.data?.data?.data
    }
  })

  console.log('dealData', dealData)

  const deal = useMemo(() => {
    return {
      guid: dealId,
      nazvanie: dealData?.Nazvanie,
      kontragentId: dealData?.counterparties_id || dealData?.partners_id,
      kontragent: { nazvanie: dealData?.counterparties_id_data?.nazvanie || 'test' },
      data_nachala: dealData?.sale_date || dealData?.data_nachala || '2026-05-26',
      summa_sdelki: dealData?.total_products_summa,
      postupilo_summa: dealData?.total_receipts_summa,
      otgruzheno_summa: dealData?.total_shipments_summa,
      pribyl: dealData?.accural_profit,
      status: dealData?.status?.[0]
    }
  }, [dealData, dealId]);

  const isLoading = false;

  const [activeTab, setActiveTab] = useState('products');
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [operation, setOperation] = useState(null)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [isModalOpening, setIsModalOpening] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const toggleRowSelection = (guid) => {
    setSelectedRows(prev =>
      prev.includes(guid) ? prev.filter(id => id !== guid) : [...prev, guid]
    )
  }



  // Product/service row action menu state
  const [openRowMenuId, setOpenRowMenuId] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [isCopying, setIsCopying] = useState(false)
  const rowMenuRef = useRef(null)

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

  // Fetch product/service list
  const { data: productServices, isLoading: isLoadingProducts } = useUcodeDefaultApiQuery({
    queryKey: 'product_services_list',
    urlMethod: 'GET',
    urlParams: '/items/product_and_service?from-ofs=true&offset=0&limit=100',
    querySetting: {
      select: data => data?.data?.data?.response
    }
  })

  const { mutateAsync: deleteProductService } = useUcodeDefaultApiMutation({ mutationKey: 'DELETE_PRODUCT_SERVICE' })

  // Transform product services for table display
  const productServicesList = useMemo(() => {
    return productServices?.map(item => {
      const price = Number(item?.tsena_za_ed) || 0;
      const vatStr = item?.nds || '';
      const vatNum = parseFloat(vatStr) || 0;
      const qty = Number(item?.quantity) || 1;
      const discountNum = parseFloat(item?.discount || 0);
      const subtotal = qty * price;
      const afterDiscount = subtotal * (1 - discountNum / 100);
      const total = vatNum > 0 ? afterDiscount * (1 + vatNum / 100) : afterDiscount;
      return {
        guid: item?.guid,
        name: item?.naimenovanie || '—',
        quantity: qty,
        unit: `${item?.units_of_measurement_id_data?.full_name} ${item?.units_of_measurement_id_data?.short_name}` || item?.units_of_measurement_id_data?.abbreviation || '—',
        price,
        discount: item?.discount != null ? `${item.discount}%` : '0%',
        vat: vatStr ? `${vatStr}%` : '0%',
        total: Math.round(total),
        raw: item,
      }
    }) || []
  }, [productServices])



  const allSelected = productServicesList.length > 0 && selectedRows.length === productServicesList.length
  const toggleSelectAll = () => {
    setSelectedRows(allSelected ? [] : productServicesList.map(i => i.guid))
  }

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

  // Deal statuses
  const [dealStatuses, setDealStatuses] = useState([
    { guid: 'new', name: 'new', color: '#F79009' },
    { guid: 'in_progress', name: 'in_progress', color: '#2E90FA' },
    { guid: 'completed', name: 'completed', color: '#12B76A' },
  ]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Set initial status from deal data
  const currentDealStatus = selectedStatus || (
    deal.status ? { guid: deal.status.guid, name: deal.status.name, color: deal.status.color || '#F79009' } : dealStatuses[0]
  );


  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>
      </div>
    );
  }

  const dealAmount = Number(deal.summa_sdelki) || 0;
  const received = Number(deal.postupilo_summa) || 0;
  const shipped = Number(deal.otgruzheno_summa) || 0;
  const profit = Number(deal.pribyl) || 0;
  const receivedPercent = dealAmount > 0 ? Math.round((received / dealAmount) * 100) : 0;
  const shippedPercent = dealAmount > 0 ? Math.round((shipped / dealAmount) * 100) : 0;
  const profitPercent = dealAmount > 0 ? Math.round((profit / dealAmount) * 100) : 0;


  const handleCreateOperation = () => {
    setOperation({ isNew: true })
    setShowOperationModal(true)
    setIsModalClosing(false)
    setIsModalOpening(true)
    setTimeout(() => {
      setIsModalOpening(false)
    }, 50)
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <button onClick={() => router.push('/pages/deals')} className={styles.breadcrumbLink}>
          Сделки по продажам
        </button>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{deal.nazvanie || 'Без названия'}</span>
      </div>
      {/* Header */}
      <div className='flex items-center justify-between '>
        <div className={styles.header}>
          <h1 className={styles.title}>{deal.nazvanie || 'Без названия'}</h1>
        </div>
        <button className={styles.detailsDots}>
          <Ellipsis size={18} className='text-neutral-800' />
        </button>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        {/* Card 1: Deal Amount */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>
              Сделка на сумму /
            </span>
            <DealStatus
              statuses={dealStatuses}
              currentStatus={currentDealStatus}
              onStatusChange={(status) => setSelectedStatus(status)}
              onStatusEdit={(updated) => {
                setDealStatuses(prev => prev.map(s => s.guid === updated.guid ? updated : s))
              }}
              onStatusDelete={(status) => {
                setDealStatuses(prev => prev.filter(s => s.guid !== status.guid))
              }}
              onStatusCreate={(newStatus) => {
                setDealStatuses(prev => [...prev, { ...newStatus, guid: Date.now().toString() }])
              }}
            />
          </div>
          <div className={styles.cardAmount}>{formatAmount(dealAmount)} ₽</div>

          <div className={styles.cardDivider}></div>

          <div className={styles.dealInfoInCard}>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Тип</span>
              <span className={styles.infoValueInCard}>
                <PiDatabaseFill size={16} className='text-neutral-400' />
                Продажа
              </span>
            </div>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Клиент</span>
              <span className={styles.infoValueLinkInCard}>{deal.kontragent?.nazvanie || 'test'}</span>
            </div>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Создана</span>
              <span className={styles.infoValueInCard}>{formatDateFormat(deal.data_nachala)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Receipts */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Поступления</span>
            <button className={styles.addButton}>

              <CirclePlus />
            </button>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.iconBox}>
              <HiOutlineDatabase size={20} className='text-neutral-400' />
            </div>

            <div className={styles.amountSection}>
              <div className={styles.cardAmount}>{formatAmount(received)} ₽</div>
              <div className={styles.cardSubtext}>из {formatAmount(dealAmount)} ₽</div>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${receivedPercent}%` }}></div>
          </div>
          <div className={styles.cardProgress}>Поступило: {receivedPercent}%</div>

          <div className={styles.clientDebt}>
            <span className={styles.clientDebtLabel}>Клиент должен:</span>
            <span className={styles.clientDebtAmount}>{formatAmount(shipped)} ₽</span>
          </div>
        </div>

        {/* Card 3: Shipments */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Отгрузки клиенту</span>
            <button className={styles.addButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#D0D5DD" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8L12 13L4 8M20 8L12 3L4 8M20 8V16L12 21M12 13V21M12 21L4 16V8" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className={styles.amountSection}>
              <div className={styles.cardAmount}>{formatAmount(shipped)} ₽</div>
              <div className={styles.cardSubtext}>из {formatAmount(dealAmount)} ₽</div>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${shippedPercent}%` }}></div>
          </div>
          <div className={styles.cardProgress}>Отгружено: {shippedPercent}%</div>

          <div className={styles.clientDebt}>
            <span className={styles.clientDebtLabel}>Мы должны:</span>
            <span className={styles.clientDebtAmount}>{formatAmount(dealAmount - shipped)} ₽</span>
          </div>
        </div>

        {/* Card 4: Profit */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Прибыль сделки</span>
            <span className={styles.cardBadge}>Учет</span>
          </div>

          <div className={styles.cardAmount}>{formatAmount(profit)} ₽</div>
          <div className={styles.cardSubtext}>Рентабельность {profitPercent}%</div>

          <div className={styles.profitChart}>
            <div className={styles.profitChartBar}>
              <div className={styles.profitChartIncome} style={{ width: `${receivedPercent}%` }}></div>
            </div>
          </div>

          <div className={styles.profitBars}>
            <div className={styles.profitBar}>
              <div className={styles.profitBarDot} style={{ backgroundColor: '#12B76A' }}></div>
              <span className={styles.profitLabel}>Доходы</span>
              <span className={styles.profitValue}>+{formatAmount(received)} ₽</span>
            </div>
            <div className={styles.profitBar}>
              <div className={styles.profitBarDot} style={{ backgroundColor: '#F79009' }}></div>
              <span className={styles.profitLabel}>Расходы</span>
              <span className={styles.profitValue}>-{formatAmount(dealAmount - profit)} ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainContentLayout}>
        {/* Left side - Tabs and content */}
        <div className={styles.leftSection}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Товары и услуги
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'receipts' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('receipts')}
            >
              Поступления
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'expenses' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              Расходы
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'shipments' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('shipments')}
            >
              Отгрузки
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>
                {activeTab === 'products' && 'Выберите товары или услуги для продажи'}
                {activeTab === 'receipts' && 'Платежи от клиентов за проданные товары или оказанные услуги '}
                {activeTab === 'expenses' && 'Понесенные затраты по сделке'}
                {activeTab === 'shipments' && 'Товары и услуги, которые вы отгрузили клиенту '}
              </div>
              <div className={styles.searchContainer}>
                <Input
                  leftIcon={<Search size={18} />}
                  type="text"
                  placeholder="Поиск по названию"
                  className={styles.searchInput}
                />
                <button
                  className='primary-btn'
                  onClick={() => {
                    if (activeTab === 'shipments') {
                      setShowShipmentModal(true);
                    } else if (activeTab === 'receipts' || activeTab === 'expenses') {
                      handleCreateOperation()
                    } else if (activeTab === 'products') {
                      setShowProductModal(true)
                    }
                  }}
                >
                  Добавить
                </button>
              </div>
            </div>
            <div className={styles.contentContainer}>
              {activeTab === 'products' && (
                <div className={styles.productsSection}>
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.checkboxColumn}>
                            <div className='flex items-center justify-center'><OperationCheckbox
                              checked={allSelected}
                              onChange={toggleSelectAll}
                            /></div>
                          </th>
                          <th>Наименование</th>
                          <th className={styles.rightAlign}>Кол-во</th>
                          <th>Единица</th>
                          <th className={styles.rightAlign}>Цена за ед.</th>
                          <th className='text-center'>Скидка</th>
                          <th className='text-center'>НДС</th>
                          <th className={styles.rightAlign}>Сумма</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingProducts ? (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Загрузка...</td>
                          </tr>
                        ) : productServicesList.length === 0 ? (
                            <tr>
                              <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Нет данных</td>
                            </tr>
                          ) : (
                            productServicesList.map((item) => (
                              <tr key={item.guid}>
                                <td className={styles.checkboxColumn}>
                                  <div className='flex items-center justify-center'> <OperationCheckbox
                                    checked={selectedRows.includes(item.guid)}
                                    onChange={() => toggleRowSelection(item.guid)}
                                  /></div>
                                </td>
                                <td>{item.name}</td>
                                <td className={styles.rightAlign}>{item.quantity}</td>
                                <td>{item.unit}</td>
                                <td className={styles.rightAlign}>{item.price ? `${formatAmount(item.price)} ₽` : '—'}</td>
                                <td className='text-center'>{item.discount}</td>
                                <td className='text-center'>{item.vat}</td>
                                <td className={styles.rightAlign}>{item.total ? `${formatAmount(item.total)} ₽` : '—'}</td>
                                <td onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: 40 }}>
                                  <div style={{ position: 'relative' }} ref={openRowMenuId === item.guid ? rowMenuRef : null}>
                                    <button
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: 4 }}
                                      onClick={() => setOpenRowMenuId(openRowMenuId === item.guid ? null : item.guid)}
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                    {openRowMenuId === item.guid && (
                                    <div className='absolute z-50 bg-white rounded-md flex flex-col gap-2 right-4 border border-neutral-100 shadow-lg'>
                                      <button
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#344054' }}
                                        onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(false); setShowProductModal(true); }}
                                      >
                                        <MdOutlineModeEdit size={14} color='#686868' />
                                        Редактировать
                                      </button>
                                      <button
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#344054' }}
                                        onClick={() => { setOpenRowMenuId(null); setItemToEdit(item.raw); setIsCopying(true); setShowProductModal(true); }}
                                      >
                                        <IoCopyOutline size={14} color='#686868' />
                                        Копировать
                                      </button>
                                      <button
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#ef4444' }}
                                        onClick={() => { setOpenRowMenuId(null); setItemToDelete(item); }}
                                      >
                                        <GoTrash size={14} color='#ef4444' />
                                        Удалить
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.tableFooter}>
                    <span className={styles.footerText}>{productServicesList.length} позиций на сумму:</span>
                    <span className={styles.footerAmount}>{formatAmount(productServicesList.reduce((sum, i) => sum + (i.total || 0), 0))} ₽</span>
                  </div>
                </div>
              )}

              {activeTab === 'receipts' && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" rx="24" fill="#F9FAFB" />
                      <path d="M24 18C20 18 18 19.3431 18 21C18 22.6569 20 24 24 24C28 24 30 22.6569 30 21C30 19.3431 28 18 24 18Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18 21V25C18 26.6569 20 28 24 28C28 28 30 26.6569 30 25V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18 25V29C18 30.6569 20 32 24 32C28 32 30 30.6569 30 29V25" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M30 25C30 24 29 23.5001 27 23.0001V28.0001C29 27.5001 30 27.0001 30 26.0001V25Z" fill="white" />
                    </svg>
                  </div>
                  <div className={styles.emptyStateTitle}>Добавьте поступления по сделке</div>
                  <div className={styles.emptyStateSubtext}>Учитывайте поступления клиента, чтобы контролировать выполнение обязательств по сделке</div>
                  <button className="primary-btn" onClick={handleCreateOperation}>
                    Добавить
                  </button>
                </div>
              )}

              {activeTab === 'expenses' && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" rx="24" fill="#F9FAFB" />
                      <path d="M24 18C20 18 18 19.3431 18 21C18 22.6569 20 24 24 24C28 24 30 22.6569 30 21C30 19.3431 28 18 24 18Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18 21V25C18 26.6569 20 28 24 28C28 28 30 26.6569 30 25V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18 25V29C18 30.6569 20 32 24 32C28 32 30 30.6569 30 29V25" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.emptyStateTitle}>Добавьте затраты по сделке</div>
                  <div className={styles.emptyStateSubtext}>Учитывайте затраты по сделке, чтобы контролировать ее прибыльность</div>
                  <button className="primary-btn" onClick={handleCreateOperation}>
                    Добавить
                  </button>
                </div>
              )}

              {activeTab === 'shipments' && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" rx="24" fill="#F2F4F7" />
                      <path d="M24 28V24M24 20H24.01M32 24C32 28.4183 28.4183 32 24 32C19.5817 32 16 28.4183 16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24Z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.emptyStateText}>Нет данных</div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right side - Comments (always visible) */}
        <div className={styles.commentsSection}>
          <h3 className={styles.commentsSectionTitle}>ФАЙЛЫ И КОММЕНТАРИИ</h3>

          <div className={styles.commentsList}>
            <div className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>hello</span>
              </div>
              <div className={styles.commentEmail}>wajdi8845@gmbolu.com</div>
              <div className={styles.commentDate}>08 мар '26 в 22:24</div>
            </div>

            <div className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>wow 3eir</span>
              </div>
              <div className={styles.commentEmail}>wajdi8845@gmbolu.com</div>
              <div className={styles.commentDate}>08 мар '26 в 22:24</div>
              <div className={styles.commentBadge}>Отредактировано</div>
            </div>

            <div className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>wowo</span>
              </div>
              <div className={styles.commentEmail}>wajdi8845@gmbolu.com</div>
              <div className={styles.commentDate}>08 мар '26 в 22:24</div>
              <div className={styles.commentBadge}>Отредактировано</div>

              <div className={styles.attachment}>
                <div className={styles.attachmentIcon}>XLSX</div>
                <div className={styles.attachmentInfo}>
                  <div className={styles.attachmentName}>8dbb489f-3952-40cb-a1ee-e87bb09...</div>
                  <div className={styles.attachmentSize}>.xlsx</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.commentInput}>
            <input
              type="text"
              placeholder="Написать комментарий..."
              className={styles.input}
            />
            <button className={styles.attachButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 10.833v2.5c0 1.4-.7 2.1-2.1 2.1h-10.8c-1.4 0-2.1-.7-2.1-2.1v-6.666c0-1.4.7-2.1 2.1-2.1h10.8c1.4 0 2.1.7 2.1 2.1v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className={styles.sendButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M18.333 1.667L9.167 10.833M18.333 1.667l-5.833 16.666-3.333-7.5-7.5-3.333 16.666-5.833z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Creation Modal */}
      <CreateShipment
        open={showShipmentModal}
        onClose={() => setShowShipmentModal(false)}
        dealName={deal.nazvanie}
        dealGuid={deal.guid}
        kontragentId={deal.kontragentId}
      />

      {/* Operation Modal */}
      {showOperationModal && (
        <OperationModal
          operation={operation}
          isClosing={isModalClosing}
          isOpening={isModalOpening}
          defaultDealGuid={deal.guid}
          onClose={() => {
            setIsModalClosing(true)
            setTimeout(() => {
              setShowOperationModal(false)
              setIsModalClosing(false)
            }, 300)
          }}
          onSuccess={() => setShowOperationModal(false)}
          initialTab={activeTab === 'expenses' ? 'payment' : 'income'}
        />
      )}

      {/* Create Product/Service Modal */}
      <CreateProductService
        open={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setItemToEdit(null);
          setIsCopying(false);
        }}
        dealGuid={deal.guid}
        initialData={itemToEdit}
        isEditing={!!itemToEdit && !isCopying}
      />



      {/* Delete Confirm Modal */}
      <CustomModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)}>
        <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#101828', fontFamily: 'Inter, sans-serif' }}>
          Удалить товар
        </h2>
        <p style={{ margin: '0 0 28px', fontSize: 14, color: '#344054', lineHeight: '20px', fontFamily: 'Inter, sans-serif' }}>
          Вы действительно хотите удалить «<strong>{itemToDelete?.name}</strong>»?<br />Восстановить его будет невозможно.
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
  );
}
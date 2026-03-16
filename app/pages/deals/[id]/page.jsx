'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import styles from './deal-detail.module.scss';
import { useUcodeRequestQuery } from '@/hooks/useDashboard';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import DealStatus from '@/components/deals/details/Status';
import CreateShipment from '@/components/deals/details/CreatingShipment';
import { ChevronDown, ChevronUp, CirclePlus, Ellipsis, Search } from 'lucide-react';
import { HiOutlineDatabase } from "react-icons/hi";
import { PiDatabaseFill } from "react-icons/pi";
import { ShipmentPlusIcon, BoxIcon, ReceiptsEmptyIcon, ExpensesEmptyIcon, ShipmentsEmptyIcon, AttachIcon, SendIcon } from '@/constants/icons';
import Input from '@/components/shared/Input';
import OperationModal from '@/components/operations/OperationModal/OperationModal';
import CreateProductService from '@/components/deals/details/CreateProductService';
import CustomModal from '@/components/shared/CustomModal';
import Loader from '@/components/shared/Loader';
import { formatDateFormat } from '@/utils/formatDate';
import { formatAmount } from '@/utils/helpers';
import operationsDto from '../../../../lib/dtos/operationsDto';
import DealOperationsTable from '../../../../components/deals/details/DealOperationsTable';
import ShipmenTable from '../../../../components/deals/details/ShipmenTable';
import { shipmentsDto } from '../../../../lib/dtos/shipmentsDto';
import ProductServiceTable from '../../../../components/deals/details/ProductServiceTable';
import { productServiceDto } from '../../../../lib/dtos/productServiceDto';
import { LiaShippingFastSolid } from "react-icons/lia";
import CustomRadio from '../../../../components/shared/Radio';


export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id;
  const queryClient = useQueryClient();

  const { data: dealData, isLoading } = useUcodeRequestQuery({
    method: "get_sales_transaction_by_guid",
    data: {
      guid: dealId
    },
    querySetting: {
      select: (response) => response?.data?.data?.data,
      placeholderData: keepPreviousData,
    }
  })

  console.log(dealData)


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

  const dealOperations = useMemo(() => {
    return operationsDto(dealData?.operations)
  }, [dealData])

  const shipmentsList = useMemo(() => {
    return shipmentsDto(dealData?.shipments || [])
  }, [dealData])

  const productServicesList = useMemo(() => {
    return productServiceDto(dealData?.products || [])
  }, [dealData])

  const summeryCards = useMemo(() => {
    return dealData?.summary || null
  }, [dealData])


  const [activeTab, setActiveTab] = useState('products');
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [operation, setOperation] = useState(null)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [isModalOpening, setIsModalOpening] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [accounting, setAccounting] = useState('accrual')
  const [showAccounting, setShowAccounting] = useState(false)


  // Product/service row action menu state
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [itemToEdit, setItemToEdit] = useState(null)
  const [isCopying, setIsCopying] = useState(false)



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
      <div className="w-full h-dvh flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const dealAmount = Number(summeryCards?.total_products_summa) || 0;
  const received = Number(summeryCards?.total_receipts_summa) || 0;
  const shipped = Number(summeryCards?.total_shipment_summa) || 0;

  // Choose cash_profit / cash_profitability vs accrual_profit if needed, here applying cash values 
  const profit = Number(summeryCards?.cash_profit) || 0;
  const expenses = Number(summeryCards?.total_cash_expenses) || 0;

  const receivedPercent = summeryCards?.receipts_progress != null ? Math.round(Number(summeryCards.receipts_progress) * 100) : 0;
  const shippedPercent = summeryCards?.shipments_progress != null ? Math.round(Number(summeryCards.shipments_progress) * 100) : 0;
  const profitPercent = summeryCards?.cash_profitability != null ? Math.round(Number(summeryCards.cash_profitability)) : 0;

  const clientDebt = Number(summeryCards?.debitorka) || 0;
  const ourDebt = Number(summeryCards?.kreditorka) || 0;


  const handleCreateOperation = () => {
    setOperation({ isNew: true })
    setShowOperationModal(true)
    setIsModalClosing(false)
    setIsModalOpening(true)
    setTimeout(() => {
      setIsModalOpening(false)
    }, 50)
  }

  const handleSelectProduct = (item, type) => {
    setShowProductModal(true)
    if (type === 'edit') {
      setItemToEdit(item)
      setIsCopying(false)
    } else if (type === 'copy') {
      setItemToEdit(item)
      setIsCopying(true)
    }
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
            <span className={styles.clientDebtAmount}>{formatAmount(clientDebt)} ₽</span>
          </div>
        </div>

        {/* Card 3: Shipments */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Отгрузки клиенту</span>
            <button className={styles.addButton}>
              <ShipmentPlusIcon />
            </button>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.iconBox}>
              <BoxIcon />
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
            <span className={styles.clientDebtAmount}>{formatAmount(ourDebt)} ₽</span>
          </div>
        </div>

        {/* Card 4: Profit */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Прибыль сделки</span>
            <div className="relative border bg-primary/10 group text-primary px-2 py-1 rounded-full text-xs">
              <div className="flex items-center gap-2">
                <p className="text-xs">Учет</p>
                <ChevronUp size={12} className='group-hover:rotate-180 transition-all duration-300' />
              </div>
              <div className="absolute hidden group-hover:flex top-8 right-0 border border-neutral-100  rounded-md shadow-2xl  flex-col bg-white">
                <label htmlFor="accrual" className="flex  p-2 items-center gap-2">
                  <CustomRadio name="accounting" id="accrual" value="accrual" checked={accounting === 'accrual'} onChange={(e) => setAccounting(e.target.value)} />
                  <span className=' whitespace-nowrap'>Методом начисления</span>
                </label>
                <label htmlFor="cash" className="flex p-2 items-center gap-2">
                  <CustomRadio name="accounting" id="cash" value="cash" checked={accounting === 'cash'} onChange={(e) => setAccounting(e.target.value)} />
                  <span className=' whitespace-nowrap'>Кассовым методом</span>
                </label>
              </div>
            </div>
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
              <span className={styles.profitValue}>-{formatAmount(expenses)} ₽</span>
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
              {activeTab === 'products' && <>

                {productServicesList?.length === 0 ? <>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <p className="text-neutral-600">Нет товаров и услуг</p>
                    </div>
                  </div>
                </> :
                  <ProductServiceTable data={productServicesList} handleSelect={handleSelectProduct} />
                }
              </>}

              {activeTab === 'receipts' && (
                <>
                  {dealOperations?.filter(op => op.tip === 'Поступление').length === 0 && <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                      <ReceiptsEmptyIcon />
                    </div>
                    <div className={styles.emptyStateTitle}>Добавьте поступления по сделке</div>
                    <div className={styles.emptyStateSubtext}>Учитывайте поступления клиента, чтобы контролировать выполнение обязательств по сделке</div>
                    <button className="primary-btn" onClick={handleCreateOperation}>
                      Добавить
                    </button>
                  </div>}
                  <DealOperationsTable
                    data={dealOperations?.filter(op => op.tip === 'Поступление') || []}
                    type='receipts'
                  />
                </>
              )}


              {activeTab === 'expenses' && (
                <>
                  {dealOperations?.filter(op => op.tip === 'Выплата').length === 0 && <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                      <ExpensesEmptyIcon />
                    </div>
                    <div className={styles.emptyStateTitle}>Добавьте затраты по сделке</div>
                    <div className={styles.emptyStateSubtext}>Учитывайте затраты по сделке, чтобы контролировать ее прибыльность</div>
                    <button className="primary-btn" onClick={handleCreateOperation}>
                      Добавить
                    </button>
                  </div>}
                  <DealOperationsTable
                    data={dealOperations?.filter(op => op.tip === 'Выплата') || []}
                    type='expenses'
                  />
                </>
              )}

              {activeTab === 'shipments' && (
                <>
                  {shipmentsList?.length === 0 ? <div className="flex flex-col flex-1 gap-3  items-center justify-center h-full">
                    <div className="flex items-center">
                      <div className="bg-neutral-100 rounded-full p-4">
                        <LiaShippingFastSolid size={40} className='text-neutral-600' />
                      </div>
                    </div>
                    <div className="text-neutral-600 text-center space-y-2">
                      <h1 className="text-neutral-600">Создайте отгрузку</h1>
                      <p className="text-neutral-600">Отслеживайте товары и услуги, которые вы отгрузили своим клиентам</p>
                    </div>
                  </div> : <ShipmenTable data={shipmentsList || []} />}
                </>
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
              <div className={styles.commentDate}>08 мар 26 в 22:24</div>
            </div>

            <div className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>wow 3eir</span>
              </div>
              <div className={styles.commentEmail}>wajdi8845@gmbolu.com</div>
              <div className={styles.commentDate}>08 мар 26 в 22:24</div>
              <div className={styles.commentBadge}>Отредактировано</div>
            </div>

            <div className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>wowo</span>
              </div>
              <div className={styles.commentEmail}>wajdi8845@gmbolu.com</div>
              <div className={styles.commentDate}>08 мар 26 в 22:24</div>
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
              <AttachIcon />
            </button>
            <button className={styles.sendButton}>
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Creation Modal */}
      <CreateShipment
        open={showShipmentModal}
        onClose={() => setShowShipmentModal(false)}
        dealName={deal.nazvanie}
        dealGuid={dealId}
        kontragentId={deal.kontragentId}
      />

      {/* Operation Modal */}
      {showOperationModal && (
        <OperationModal
          operation={operation}
          isClosing={isModalClosing}
          isOpening={isModalOpening}
          defaultDealGuid={dealId}
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
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import styles from './deal-detail.module.scss';
import { useUcodeRequestQuery } from '@/hooks/useDashboard';
import { keepPreviousData } from '@tanstack/react-query';
import DealStatus from '@/components/deals/details/Status';
import CreateShipment from '@/components/deals/details/CreatingShipment';
import { ChevronUp, CirclePlus, Ellipsis, Search } from 'lucide-react';
import { HiOutlineDatabase } from "react-icons/hi";
import { HiOutlineCreditCard } from "react-icons/hi2";
import { PiDatabaseFill } from "react-icons/pi";
import { ShipmentPlusIcon, BoxIcon } from '@/constants/icons';
import Input from '@/components/shared/Input';
import OperationModal from '@/components/operations/OperationModal/OperationModal';
import CreateProductService from '@/components/deals/details/CreateProductService';
import Loader from '@/components/shared/Loader';
import { formatDateFormat } from '@/utils/formatDate';
import { formatAmount } from '@/utils/helpers';
import ShipmenTable from '../../../../components/deals/details/ShipmenTable';
import ProductServiceTable from '../../../../components/deals/details/ProductServiceTable';
import CustomRadio from '../../../../components/shared/Radio';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import CustomProgress from '../../../../components/shared/Progress';
import { observer } from 'mobx-react-lite';
import CommentChat from '../../../../components/deals/details/CommentChat';
import { sealDeal } from '../../../../store/saleDeal.store';
import ExpenseOperationsTable from '../../../../components/deals/details/ExpenseOperationTable';
import IncomeOperationsTable from '../../../../components/deals/details/IncomeOperationsTable';
import { calculatePercent, formatDateRu } from '../../../../utils/helpers';
import { CreateDealModal } from '@/components/deals/CreateDealModal/CreateDealModal';
import { DeleteDealModal } from '@/components/deals/DeleteDealModal/DeleteDealModal';
import { useUcodeDefaultApiMutation } from '@/hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash } from 'lucide-react';


export default observer(function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id;

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

  const summeryCards = useMemo(() => {
    return dealData || null
  }, [dealData])

  const deal = {
    guid: dealId,
    name: summeryCards?.name,
    sale_date: summeryCards?.sale_date,
    counterparties_id: summeryCards?.counterparties_id,
    nds: summeryCards?.nds,
    commentary: summeryCards?.commentary
  }


  const [activeTab, setActiveTab] = useState('products');
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [operation, setOperation] = useState(null)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [isModalOpening, setIsModalOpening] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const accounting = sealDeal.accounting
  const [showAccounting, setShowAccounting] = useState(false)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [dealToEdit, setDealToEdit] = useState(null);

  const queryClient = useQueryClient();
  const { mutate: deleteDeal, isPending: isDeletingDeal } = useUcodeDefaultApiMutation({ mutationKey: 'delete-deal' });

  const confirmDelete = () => {
    if (!dealToDelete) return;

    deleteDeal(
      {
        urlMethod: 'DELETE',
        urlParams: `/items/sales_transactions/${dealToDelete.guid}?from-ofs=true`
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['deals'] });
          router.push('/pages/deals');
        }
      }
    );
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setDealToEdit(null);
  };


  // Product/service row action menu state 
  const [itemToEdit, setItemToEdit] = useState(null)
  const [isCopying, setIsCopying] = useState(false)



  // Deal statuses
  const [dealStatuses, setDealStatuses] = useState([
    { guid: 'Новая', name: 'Новая', color: '#F79009' },
    { guid: 'В процессе', name: 'В процессе', color: '#2E90FA' },
    { guid: 'Завершенная', name: 'Завершенная', color: '#12B76A' },
  ]);
  const [selectedStatus, setSelectedStatus] = useState(dealStatuses[summeryCards?.Status]);

  // Set initial status from deal data
  const currentDealStatus = selectedStatus


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

  const profit = (accounting === 'accrual' ? summeryCards?.accrual_method?.profit : summeryCards?.cash_method?.profit) || 0;
  const expenses = (accounting === 'accrual' ? summeryCards?.accrual_method?.expenses : summeryCards?.cash_method?.expenses) || 0;
  const income = (accounting === 'accrual' ? summeryCards?.accrual_method?.income : summeryCards?.cash_method?.income) || 0;

  const receivedPercent = summeryCards?.receipts_percentage != null ? Math.round(Number(summeryCards.receipts_percentage) * 100) : 0;
  const shippedPercent = summeryCards?.shipments_percentage != null ? Math.round(Number(summeryCards.shipments_percentage)) : 0;


  const profitPercent = Math.round(Number(accounting === 'accrual' ? summeryCards?.accrual_method?.profitability : summeryCards?.cash_method?.profitability)) || 0;

  const clientDebt = Number(summeryCards?.client_debt) || 0;
  const remainingShipment = Number(summeryCards?.remaining_shipment) || 0;


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
        <span className={styles.breadcrumbCurrent}>{deal?.name || 'Без названия'}</span>
      </div>

      {/* Header */}
      <div className='flex items-center justify-between '>
        <div className={styles.header}>
          <h1 className={styles.title}>{deal?.name || 'Без названия'}</h1>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className={styles.detailsDots}>
              <Ellipsis size={18} className='text-neutral-800' />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 rounded-md overflow-hidden p-0 border border-gray-100 bg-white shadow-md mt-1" align="end">
            <div className="flex flex-col">
              <button
                className="flex items-center gap-2 p-2.5 text-sm text-neutral-800 hover:bg-neutral-50 cursor-pointer w-full text-left border-none outline-none bg-transparent"
                onClick={() => {
                  setDealToEdit(deal);
                  setIsCreateModalOpen(true);
                }}
              >
                <Pencil size={16} className="text-neutral-600" />
                <span>Редактировать</span>
              </button>
              <button
                className="flex items-center gap-2 p-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer w-full text-left border-none outline-none bg-transparent"
                onClick={() => setDealToDelete(dealData)}
              >
                <Trash size={16} className="text-red-500" />
                <span>Удалить</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
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

          <div className="grid grid-cols-[100px_1fr] gap-y-2 mt-2 font-sans">
            <span className="text-sm font-normal text-[#8892A3]">Тип</span>
            <div className="flex">
              <span className="flex items-center gap-1.5 bg-[#F2F4F7] rounded-[10px] px-3 py-1 text-sm font-semibold text-neutral-800">
                <PiDatabaseFill size={16} className='text-[#9aa4b3]' />
                Продажа
              </span>
            </div>

            <span className="text-sm font-normal text-[#8892A3]">Клиент</span>
            <div className="flex">
              <span
                className="text-sm font-medium text-neutral-800 border-b border-dotted border-gray-400 pb-0.5 cursor-pointer hover:text-primary transition-colors flex items-center gap-1 group"
                onClick={() => { setDealToEdit(deal); setIsCreateModalOpen(true); }}
              >
                {summeryCards?.counterparties_name || 'test'}
                <Pencil size={12} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </span>
            </div>

            <span className="text-sm font-normal text-[#8892A3]">Создана</span>
            <div className="flex">
              <span
                className="text-sm font-medium text-neutral-800 border-b border-dotted border-gray-400 pb-0.5 cursor-pointer flex items-center gap-1 group"
                onClick={() => { setDealToEdit(deal); setIsCreateModalOpen(true); }}
              >
                {formatDateRu(deal?.sale_date)}
                <Pencil size={12} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Receipts */}
        <div className="bg-white rounded-xl p-6 flex flex-col shadow-[0_8px_18px_rgba(118,164,172,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-base text-gray-ucode-800">Поступления</span>
            <button onClick={() => { handleCreateOperation(); setActiveTab('receipts'); }} className="bg-transparent border-none cursor-pointer p-0 flex items-center justify-center transition-opacity hover:opacity-70">
              <CirclePlus size={20} strokeWidth={1.5} className='text-neutral-300' />
            </button>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <div className="w-[52px] h-[52px] rounded-[10px] bg-[#F2F4F7] flex items-center justify-center shrink-0">
              <HiOutlineDatabase size={20} className='text-neutral-400' />
            </div>

            <div className="flex flex-col gap-0">
              <div className="font-semibold text-lg text-gray-ucode-800">{formatAmount(received)} ₽</div>
              <div className="font-normal text-xs text-gray-ucode-500">из {formatAmount(dealAmount)} ₽</div>
            </div>
          </div>

          <div className="w-full h-2 bg-[#F2F4F7] rounded-md overflow-hidden mb-2">
            <CustomProgress min={0} value={received} max={dealAmount} fillColor="#12B76A" />
          </div>
          <div className="font-normal text-xs text-gray-ucode-500 mt-2 mb-5">Поступило: {calculatePercent(dealAmount, received)}</div>

          <div className="flex text-xs flex-1 items-end  gap-2">
            <span className="font-normal  text-gray-ucode-500">Клиент должен:</span>
            <span className="font-medium  text-[#344054]">{formatAmount(clientDebt)} ₽</span>
          </div>
        </div>

        {/* Card 3: Shipments */}
        <div className="bg-white rounded-xl p-6 flex flex-col shadow-[0_8px_18px_rgba(118,164,172,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-base text-gray-ucode-800">Отгрузки клиенту</span>
            <button onClick={() => setShowShipmentModal(true)} className="bg-transparent border-none cursor-pointer p-0 flex items-center justify-center transition-opacity hover:opacity-70">
              <ShipmentPlusIcon />
            </button>
          </div>

          <div className="flex items-start text-lg gap-3 mb-5">
            <div className="w-[52px] h-[52px] rounded-[10px] bg-[#F2F4F7] flex items-center justify-center shrink-0">
              <BoxIcon />
            </div>

            <div className="flex flex-col gap-0">
              <div className="font-semibold text-lg text-gray-ucode-800">{formatAmount(shipped)} ₽</div>
              <div className="font-normal text-xs text-gray-ucode-500">из {formatAmount(dealAmount)} ₽</div>
            </div>
          </div>

          <div className="w-full h-2 bg-[#F2F4F7] rounded-md overflow-hidden mb-2">
            <CustomProgress min={0} value={shipped} max={dealAmount} fillColor="#12B76A" />
          </div>
          <div className="font-normal text-xs text-gray-ucode-500 mt-2 mb-5">Отгружено: {calculatePercent(dealAmount, shipped)}</div>

          <div className="flex text-xs  gap-2 flex-1 items-end">
            <span className="font-normal  text-gray-ucode-500">Осталось отгрузить:</span>
            <span className="font-medium  text-[#344054]">{formatAmount(remainingShipment)} ₽</span>
          </div>
        </div>

        {/* Card 4: Profit */}
        <div className={styles.infoCard}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-base text-gray-ucode-800">Прибыль сделки</span>
            <Popover open={showAccounting} onOpenChange={setShowAccounting}>
              <PopoverTrigger className="relative bg-primary/10 cursor-pointer text-primary px-2 py-1 rounded-full text-xs border-none outline-none">
                <div className="flex items-center gap-2">
                  <p className="text-xs">Учет</p>
                  <ChevronUp size={12} className={`transition-all duration-300 ${showAccounting ? 'rotate-180' : ''}`} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-md overflow-hidden p-0 border-none" align="end">
                <div className="flex flex-col bg-white">
                  <label htmlFor="accrual" className="flex p-3 items-center gap-2 cursor-pointer hover:bg-neutral-50">
                    <CustomRadio name="accounting" id="accrual" value="accrual" checked={accounting === 'accrual'} onChange={(e) => { sealDeal.setState('accounting', e.target.value); setShowAccounting(false); }} />
                    <span className="whitespace-nowrap text-sm text-neutral-800">Методом начисления</span>
                  </label>
                  <label htmlFor="cash" className="flex p-3 items-center gap-2 cursor-pointer hover:bg-neutral-50">
                    <CustomRadio name="accounting" id="cash" value="cash" checked={accounting === 'cash'} onChange={(e) => { sealDeal.setState('accounting', e.target.value); setShowAccounting(false); }} />
                    <span className="whitespace-nowrap text-sm text-neutral-800">Кассовым методом</span>
                  </label>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <div className="w-[52px] h-[52px] rounded-[10px] bg-[#F2F4F7] flex items-center justify-center shrink-0">
              <HiOutlineCreditCard size={20} className='text-neutral-400' />
            </div>

            <div className="flex flex-col gap-0">
              <div className="font-semibold text-lg text-gray-ucode-800">{formatAmount(profit)} ₽</div>
              <div className="font-normal text-xs text-gray-ucode-500">Рентабельность {profitPercent}%</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 my-2">
            <CustomProgress value={received} fillColor="#12B76A" min={0} max={received} />
            <CustomProgress value={expenses} fillColor="#FFC609" min={0} max={income} />
          </div>

          <div className="flex flex-1 items-end   gap-2">
            <div className="flex flex-col flex-1">
              <div className={styles.profitBarDot} style={{ backgroundColor: '#12B76A' }}></div>
              <span className="font-normal text-xs text-gray-ucode-500">Доходы</span>
              <span className="font-medium text-sm text-gray-ucode-800">+{formatAmount(income)} ₽</span>
            </div>
            <div className="flex flex-col flex-1">
              <div className={styles.profitBarDot} style={{ backgroundColor: '#FFC609' }}></div>
              <span className="font-normal text-xs text-gray-ucode-500">Расходы</span>
              <span className="font-medium text-sm text-gray-ucode-800">-{formatAmount(expenses)} ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainContentLayout}>
        {/* Left side - Tabs and content */}
        <div className={styles.leftSection}>
          {/* Tabs */}
          <div className="flex bg-white border-b border-neutral-200 rounded-t-xl overflow-hidden mb-0">
            <button
              className={`font-semibold text-xs px-5 py-4 cursor-pointer uppercase border-b-2 bg-transparent border-none relative transition-all hover:text-neutral-800 ${activeTab === 'products' ? 'text-neutral-900 border-neutral-900 font-bold' : 'text-neutral-400 border-transparent'
                }`}
              onClick={() => setActiveTab('products')}
            >
              Товары и услуги ({summeryCards?.products_count ?? 0})
            </button>
            <button
              className={`font-semibold text-xs px-5 py-4 cursor-pointer uppercase border-b-2 bg-transparent border-none relative transition-all hover:text-neutral-800 ${activeTab === 'receipts' ? 'text-neutral-900 border-neutral-900 font-bold' : 'text-neutral-400 border-transparent'
                }`}
              onClick={() => setActiveTab('receipts')}
            >
              Поступления ({summeryCards?.receipts_count ?? 0})
            </button>
            <button
              className={`font-semibold text-xs px-5 py-4 cursor-pointer uppercase border-b-2 bg-transparent border-none relative transition-all hover:text-neutral-800 ${activeTab === 'expenses' ? 'text-neutral-900 border-neutral-900 font-bold' : 'text-neutral-400 border-transparent'
                }`}
              onClick={() => setActiveTab('expenses')}
            >
              Расходы ({summeryCards?.expenses_count ?? 0})
            </button>
            <button
              className={`font-semibold text-xs px-5 py-4 cursor-pointer uppercase border-b-2 bg-transparent border-none relative transition-all hover:text-neutral-800 ${activeTab === 'shipments' ? 'text-neutral-900 border-neutral-900 font-bold' : 'text-neutral-400 border-transparent'
                }`}
              onClick={() => setActiveTab('shipments')}
            >
              Отгрузки ({summeryCards?.shipments_count ?? 0})
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
              {activeTab === 'products' && <ProductServiceTable handleSelect={handleSelectProduct} sellingDealId={dealId} onAdd={() => setShowProductModal(true)} />}

              {activeTab === 'receipts' && <IncomeOperationsTable type='Поступление' sellingDealId={dealId} onAdd={handleCreateOperation} />}

              {activeTab === 'expenses' && <ExpenseOperationsTable type='Выплата' sellingDealId={dealId} onAdd={handleCreateOperation} />}

              {activeTab === 'shipments' && <ShipmenTable dealGuid={dealId} dealName={summeryCards?.Nazvanie} onAdd={() => setShowShipmentModal(true)} />}
            </div>
          </div>
        </div>

        {/* Right side - Comments (always visible) */}

        <CommentChat dealGuid={dealId} />

      </div>

      {/* Shipment Creation Modal */}
      <CreateShipment
        open={showShipmentModal}
        onClose={() => setShowShipmentModal(false)}
        dealName={summeryCards?.Nazvanie}
        dealGuid={dealId}
        kontragentId={summeryCards?.counterparty_id}
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
          preselectedCounterparty={summeryCards?.counterparty_id}
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
        dealGuid={dealId}
        initialData={itemToEdit}
        isEditing={!!itemToEdit && !isCopying}
      />

      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        initialData={dealToEdit}
        isEditing={true}
      />

      <DeleteDealModal
        isOpen={!!dealToDelete}
        onClose={() => setDealToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeletingDeal}
        deal={dealToDelete ? {
          name: summeryCards?.Nazvanie,
          client: summeryCards?.counterparty_name,
          amount: formatAmount(summeryCards?.total_products_summa)
        } : null}
      />



      {/* Delete Confirm Modal */}
      {/* <CustomModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)}>
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
      </CustomModal> */}
    </div>
  );
})
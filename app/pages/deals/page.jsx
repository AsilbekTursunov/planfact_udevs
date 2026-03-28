'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import styles from './deals.module.scss';
import { CreateDealModal } from '@/components/deals/CreateDealModal/CreateDealModal';
import { useUcodeDefaultApiMutation, useUcodeRequestQuery } from '../../../hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import Input from '../../../components/shared/Input';
import { ChevronDown, Search } from 'lucide-react';
import { formatDateFormat } from '../../../utils/formatDate';
import { formatAmount } from '../../../utils/helpers';
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox';
import { DeleteDealModal } from '../../../components/deals/DeleteDealModal/DeleteDealModal';
import { MdOutlineModeEdit } from 'react-icons/md';
import { IoCloseOutline, IoCopyOutline } from 'react-icons/io5';
import FilterSidebar from '../../../components/deals/FilterSidebar';
import { observer } from 'mobx-react-lite';
import { sealDeal } from '../../../store/saleDeal.store';
import CreateStudentModal from '../../../components/deals/CreateStudentModal';
import SingleSelect from '../../../components/shared/Selects/SingleSelect';
import ScreenLoader from '../../../components/shared/ScreenLoader';

export default observer(function DealsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const debouncedSetSearch = useMemo(
    () => debounce((val) => setDebouncedSearchQuery(val), 200),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel()
    }
  }, [debouncedSetSearch])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [dealToEdit, setDealToEdit] = useState(null);
  const [dealToCopy, setDealToCopy] = useState(null);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);

  const queryClient = useQueryClient();
  const [selectedDeals, setSelectedDeals] = useState(new Set());
  const filters = sealDeal.filters;
  const dealsMethod = sealDeal.dealsMethod;

  useUcodeRequestQuery({
    method: "get_sales_list",
    object_data: {
      from_date: "",
      limit: 20,
      page: 1,
      search: "",
      to_date: ""
    },
  })


  const dealsFilters = useMemo(() => {
    return {
      page: 1,
      limit: 100,
      search: debouncedSearchQuery || null,
      from_date: filters?.operationDateStart || null,
      to_date: filters?.operationDateEnd || null,
      amount_from: Number(filters?.amountFrom) || null,
      amount_to: Number(filters?.amountTo) || null,
      profit_from: Number(filters?.profitFrom) || null,
      profit_to: Number(filters?.profitTo) || null,
      counterparty_ids: filters?.selectedCounterparties?.length > 0 ? filters.selectedCounterparties : null,
      status: filters?.status || [],
      accounting_method: dealsMethod === 'accrual_method' ? 'Метод начисления' : 'Кассовый метод' || null,
      isCalculation: filters?.isCalculation || false,
    }
  }, [debouncedSearchQuery, filters, dealsMethod])



  const { data: deals, isFetching } = useUcodeRequestQuery({
    method: "get_sales_list_simple",
    data: dealsFilters,
    querySetting: {
      select: (response) => response?.data?.data,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  })

  const summary = useMemo(() => {
    return deals?.summary
  }, [deals])

  const totalProfit = dealsMethod === 'accrual_method' ? summary?.accrual_profit : summary?.cash_profit

  const { mutate: deleteDeal, isPending: isDeletingDeal } = useUcodeDefaultApiMutation({ mutationKey: 'delete-deal' });

  // Process API data into expected table format
  const formattedDeals = useMemo(() => {
    return deals?.data?.map(deal => ({
      ...deal,
      guid: deal.guid,
      data_nachala: deal.Data_sdelki,
      nazvanie: deal.Nazvanie,
      kontragent: { nazvanie: deal.partner_name || '-' },
      status: deal.Status?.[0] || 'Новая',
      summa_sdelki: deal?.total_products_summa || 0,
      postupilo: deal?.receipts_percentage ? `${Math.round(deal.receipts_percentage)}%` : '0%',
      otgruzheno: deal?.shipments_percentage ? `${Math.round(deal.shipments_percentage)}%` : '0%',
      pribyl: deal?.profit,
      comment: deal?.Kommentariy
    }));
  }, [deals]);


  const handleRowClick = (deal, e) => {
    // OperationCheckbox often wraps input in labels or custom divs
    if (e.target.closest('button') || e.target.closest('label') || e.target.closest('input[type="checkbox"]')) {
      return;
    }
    router.push(`/pages/deals/${deal.guid}`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDeals(new Set(formattedDeals.map(d => d.guid)));
    } else {
      setSelectedDeals(new Set());
    }
  };

  const handleSelectOne = (guid, e) => {
    e.stopPropagation();
    setSelectedDeals(prev => {
      const next = new Set(prev);
      if (next.has(guid)) {
        next.delete(guid);
      } else {
        next.add(guid);
      }
      return next;
    });
  };

  const handleDeleteClick = (deal, e) => {
    e.stopPropagation();
    setDealToDelete(deal);
  };

  const confirmDelete = () => {
    if (!dealToDelete) return;

    deleteDeal(
      {
        urlMethod: 'DELETE',
        urlParams: `/items/sales_transactions/${dealToDelete.guid}?from-ofs=true`
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['get_sales_list_simple'] });
          setSelectedDeals(prev => {
            const next = new Set(prev);
            next.delete(dealToDelete.guid);
            return next;
          });
          setDealToDelete(null);
        }
      }
    );
  };

  const handleEditClick = (deal, e) => {
    e.stopPropagation();
    setDealToEdit(deal);
    setIsCreateModalOpen(true);
  };

  const handleCopyClick = (deal, e) => {
    e.stopPropagation();
    setDealToCopy(deal);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setDealToEdit(null);
    setDealToCopy(null);
  };






  return (
    <div className="flex overflow-hidden w-full">
      <FilterSidebar />
      <main className="p-4 flex-1 relative overflow-y-auto scroll-smooth">
        <header className="flex items-center justify-between mb-4 sticky top-[-16px] bg-white z-20 pt-4">
          <div className="flex items-center gap-2 flex-1">
            <h1 className={styles.title}>Сделки по продажам</h1>
            <button className='primary-btn py-1! text-sm px-2! rounded-sm!' onClick={() => setIsCreateModalOpen(true)}>
              Создать
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* filter by method like given image with  singleSelect */}
            <div className="w-44">
              <SingleSelect
                data={[
                  { value: 'accrual_method', label: 'Метод начисления' },
                  { value: 'cash_method', label: 'Кассовый метод' },
                ]}
                withSearch={false}
                value={dealsMethod}
                isClearable={false}
                onChange={(value) => sealDeal.setState('dealsMethod', value)}
                className='bg-white'
              />
            </div>
            <div className="w-72">
              <Input
                type="text"
                placeholder="Поиск по краткому названию"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  debouncedSetSearch(e.target.value)
                }}
                leftIcon={<Search size={18} />}
              />
            </div>
          </div>
        </header>

        <div className="relative">

          <table className="w-full text-xs">
            <thead className='sticky top-0'>
              <tr className='bg-neutral-100 text-neutral-500  text-xs'>
                <th className="w-10">
                  <div className="flex items-center justify-center">
                    <OperationCheckbox
                      checked={formattedDeals?.length > 0 && selectedDeals.size === formattedDeals?.length}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className='text-start p-0!'>
                  <button className="flex items-center gap-2 p-2">
                    Дата
                    <ChevronDown size={14} />
                  </button>
                </th>
                <th className='px-2 text-start'>Название</th>
                <th className='px-2 text-start'>Клиент</th>
                <th className='px-2 text-start'>Статус</th>
                <th className='px-2 text-start'>Сумма сделки</th>
                <th className='px-2 text-start'>Поступило</th>
                <th className='px-2 text-start'>Отгружено</th>
                <th className='px-2  text-end w-44'>Прибыль</th>
              </tr>
            </thead>
            <tbody>
              {formattedDeals?.map(deal => {
                const price = dealsMethod === 'accrual_method' ? deal?.accrual_method?.profit : deal?.cash_method?.profit
                return (
                  <tr key={deal.guid} onClick={(e) => handleRowClick(deal, e)} className='hover:bg-neutral-50 h-12 border-b border-neutral-100 group cursor-pointer'>
                    <td className="w-10" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <OperationCheckbox
                          checked={selectedDeals.has(deal.guid)}
                          onChange={(e) => handleSelectOne(deal.guid, e)}
                        />
                      </div>
                    </td>
                    <td className='p-0!'>
                      <div className="text-start p-2">
                        <div>{formatDateFormat(deal.Data_sdelki)}</div>
                        {/* {deal.data_okonchaniya && <div className={styles.dateEnd}>{formatDateFormat(deal.data_okonchaniya)}</div>} */}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <p>{deal.nazvanie}</p>
                        <p className='text-xs text-neutral-400'>{deal.comment}</p>
                      </div>
                    </td>
                    <td>{deal?.partner_name || '-'}</td>
                    <td>
                      <span className={`${styles.status} ${styles[`status_${deal.status}`]}`}>
                        {deal?.status || '-'}
                      </span>
                    </td>
                    <td>{formatAmount(deal.summa_sdelki)}</td>
                    <td>{deal.postupilo || '0%'}</td>
                    <td>{deal.otgruzheno || '0%'}</td>
                    <td className='relative  text-end'>
                      <div className='group-hover:hidden'>
                        <p className={`${price < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatAmount(price)}
                        </p>
                      </div>
                      <div className='hidden group-hover:flex justify-end'>
                        <div className="flex items-center ">
                          <button className="hover:bg-neutral-100 rounded-full p-2 cursor-pointer" title="Редактировать" onClick={(e) => handleEditClick(deal, e)}>
                            <MdOutlineModeEdit size={14} color='#686868' />
                          </button>
                          <button className="hover:bg-neutral-100 rounded-full p-2 cursor-pointer" title="Скопировать" onClick={(e) => handleCopyClick(deal, e)}>
                            <IoCopyOutline size={14} color='#686868' />
                          </button>
                          <button className="hover:bg-neutral-100 rounded-full p-2 cursor-pointer" title="Удалить" onClick={(e) => handleDeleteClick(deal, e)}>
                            <IoCloseOutline size={14} color='#686868' />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <footer className={[styles.footer]}>
          <div className={styles.footerContent}>
            <span className={styles.footerItem}>
              <span className={styles.footerLabel}>{deals?.summary?.count || 0} сделок на сумму:</span>
              <span className={styles.footerAmount}>{formatAmount(deals?.summary?.total_deals_sum || 0)}</span>
            </span>
            <span className={styles.footerItem}>
              <span className={styles.footerLabel}>Общая прибыль:</span>
              <span className={styles.footerProfit}>{formatAmount(totalProfit)}</span>
            </span>
          </div>
        </footer>
        {isFetching && <ScreenLoader className={'left-0!'} />}
      </main>


      <CreateStudentModal
        isOpen={showCreateStudentModal}
        onClose={() => setShowCreateStudentModal(false)}
      />
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        initialData={dealToEdit || dealToCopy}
        isEditing={!!dealToEdit}
      />

      <DeleteDealModal
        isOpen={!!dealToDelete}
        onClose={() => setDealToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeletingDeal}
        deal={dealToDelete ? {
          name: dealToDelete.nazvanie || dealToDelete.guid?.substring(0, 8),
          client: dealToDelete.kontragent?.nazvanie,
          amount: formatAmount(dealToDelete.summa_sdelki)
        } : null}
      />
    </div>
  );
})
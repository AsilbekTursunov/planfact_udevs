'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styles from './deals.module.scss';
import { CreateDealModal } from '@/components/deals/CreateDealModal/CreateDealModal';
import { useUcodeDefaultApiQuery, useUcodeDefaultApiMutation, useUcodeRequestQuery } from '../../../hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import Input from '../../../components/shared/Input';
import { Search } from 'lucide-react';
import { formatDateFormat } from '../../../utils/formatDate';
import { formatAmount } from '../../../utils/helpers';
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox';
import { DeleteDealModal } from '../../../components/deals/DeleteDealModal/DeleteDealModal';
import { MdOutlineModeEdit } from 'react-icons/md';
import { IoCloseOutline, IoCopyOutline } from 'react-icons/io5';
import FilterSidebar from '../../../components/deals/FilterSidebar';

export default function DealsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [dealToEdit, setDealToEdit] = useState(null);
  const [dealToCopy, setDealToCopy] = useState(null);

  const queryClient = useQueryClient();
  const [selectedDeals, setSelectedDeals] = useState(new Set());

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


  const { data: dealsData } = useUcodeDefaultApiQuery({
    queryKey: 'deals',
    urlMethod: 'GET',
    urlParams: '/items/sales_transactions?from-ofs=true&offset=0&limit=20'
  });



  const { mutate: deleteDeal, isPending: isDeletingDeal } = useUcodeDefaultApiMutation({ mutationKey: 'delete-deal' });

  // Process API data into expected table format
  const formattedDeals = useMemo(() => {
    const items = dealsData?.data?.data?.response || [];
    return items.map(deal => ({
      ...deal,
      guid: deal.guid,
      data_nachala: deal.sale_date,
      nazvanie: deal.name,
      kontragent: { nazvanie: deal.counterparties_id_data?.nazvanie },
      status: deal.status?.[0] || 'New',
      // Provide defaults or pick from counterparties_id_data if available
      summa_sdelki: deal.counterparties_id_data?.receivables || 0,
      postupilo: '0%',
      otgruzheno: '0%',
      pribyl: deal.counterparties_id_data?.profit || 0
    }));
  }, [dealsData]);


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
          queryClient.invalidateQueries({ queryKey: ['deals'] });
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


  const getStatusColor = (status) => {
    const statusMap = {
      'Новая': 'orange',
      'New': 'orange',
      'В_работе': 'blue',
      'in_work': 'blue',
      'InProgress': 'blue',
      'Завершена': 'green',
      'Completed': 'green',
      'Cancelled': 'gray'
    }
    return statusMap[status] || 'gray'
  }

  return (
    <div className="flex min-h-dvh">
      <FilterSidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Сделки по продажам</h1>
            <button className='primary-btn' onClick={() => setIsCreateModalOpen(true)}>
              Создать
            </button>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.searchWrapper}>
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
        </header>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <OperationCheckbox
                    checked={formattedDeals.length > 0 && selectedDeals.size === formattedDeals.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>
                  <button className={styles.headerButton}>
                    Дата
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                </th>
                <th>Название</th>
                <th>Клиент</th>
                <th>Статус</th>
                <th>Сумма сделки</th>
                <th>Поступило</th>
                <th>Отгружено</th>
                <th>Прибыль</th>
                <th className={styles.actionsCell}></th>
              </tr>
            </thead>
            <tbody>
              {formattedDeals.map(deal => (
                <tr key={deal.guid} onClick={(e) => handleRowClick(deal, e)} style={{ cursor: 'pointer' }}>
                  <td className={styles.checkboxCell} onClick={(e) => e.stopPropagation()}>
                    <OperationCheckbox
                      checked={selectedDeals.has(deal.guid)}
                      onChange={(e) => handleSelectOne(deal.guid, e)}
                    />
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <div>{formatDateFormat(deal.data_nachala)}</div>
                      {deal.data_okonchaniya && <div className={styles.dateEnd}>{formatDateFormat(deal.data_okonchaniya)}</div>}
                    </div>
                  </td>
                  <td>{deal.nazvanie || '-'}</td>
                  <td>{deal.kontragent?.nazvanie || '-'}</td>
                  <td>
                    <span className={`${styles.status} ${styles[`status_${deal.status}`]}`}>
                      {deal?.status || '-'}
                    </span>
                  </td>
                  <td>{formatAmount(deal.summa_sdelki)}</td>
                  <td>{deal.postupilo || '0%'}</td>
                  <td>{deal.otgruzheno || '0%'}</td>
                  <td>{formatAmount(deal.pribyl)}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
                      <button className={styles.actionButton} title="Редактировать" onClick={(e) => handleEditClick(deal, e)}>
                        <MdOutlineModeEdit size={14} color='#686868' />
                      </button>
                      <button className={styles.actionButton} title="Скопировать" onClick={(e) => handleCopyClick(deal, e)}>
                        <IoCopyOutline size={14} color='#686868' />
                      </button>
                      <button className={styles.actionButton} title="Удалить" onClick={(e) => handleDeleteClick(deal, e)}>
                        <IoCloseOutline size={14} color='#686868' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <span className={styles.footerItem}>
              <span className={styles.footerLabel}>{formattedDeals.length} продажа на сумму:</span>
              <span className={styles.footerAmount}>{formatAmount(formattedDeals.reduce((sum, d) => sum + (Number(d.summa_sdelki) || 0), 0))}</span>
            </span>
            <span className={styles.footerItem}>
              <span className={styles.footerLabel}>Общая прибыль:</span>
              <span className={styles.footerProfit}>{formatAmount(formattedDeals.reduce((sum, d) => sum + (Number(d.pribyl) || 0), 0))}</span>
            </span>
          </div>
        </footer> */}
      </main>
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
}
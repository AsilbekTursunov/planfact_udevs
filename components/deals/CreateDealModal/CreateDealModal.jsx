'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './CreateDealModal.module.scss';
import CustomDatePicker from '@/components/shared/DatePicker';
import Input from '@/components/shared/Input';
import TextArea from '../../shared/TextArea';
import Select from '@/components/common/Select';
import { TreeSelect } from '@/components/common/TreeSelect/TreeSelect';
import { useCounterpartiesGroupsPlanFact } from '@/hooks/useDashboard';
import { X } from 'lucide-react';
import { useUcodeDefaultApiMutation } from '../../../hooks/useDashboard';
import { useQueryClient } from '@tanstack/react-query';
import Loader from '../../shared/Loader';
import { formatDate } from '../../../utils/formatDate';

const ndsOptions = [
  { value: 'true', label: 'С учетом НДС' },
  { value: 'false', label: 'Без учета НДС' }
];

export function CreateDealModal({ isOpen, onClose, initialData, isEditing }) {
  const [dealName, setDealName] = useState('');
  const [dealDate, setDealDate] = useState();
  const [client, setClient] = useState('');
  const [nds, setNds] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  // const router = useRouter();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && initialData) {
      // eslint-disable-next-line
      setDealName(initialData.Nazvanie || initialData.name || '');
      const dateVal = initialData.Data_sdelki || initialData.sale_date;
      setDealDate(dateVal ? formatDate(dateVal) : '');
      setClient(initialData.partners_id || initialData.counterparties_id || '');
      const ndsVal = initialData.NDS !== undefined ? initialData.NDS : initialData.nds;
      setNds(ndsVal ? 'true' : 'false');
      setComment(initialData.Kommentariy || initialData.commentary || '');
    } else if (isOpen && !initialData) {
      setDealName('');
      setDealDate('');
      setClient('');
      setNds('');
      setComment('');
    }
  }, [isOpen, initialData]);

  const { mutateAsync: createDeal, isPending: isCreatingDeal } = useUcodeDefaultApiMutation({ mutationKey: 'create-deal' })

  const { data: counterpartiesGroupsData, isLoading: isLoadingGroups } = useCounterpartiesGroupsPlanFact({
    page: 1,
    limit: 100,
  });

  const counterAgentsTree = useMemo(() => {
    const groups = counterpartiesGroupsData?.data?.data?.data || [];

    if (groups.length === 0) return [];

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
        };
      }

      return {
        value: item.guid,
        title: item.nazvanie_gruppy || item.nazvanie || 'Без названия',
        selectable: true,
      };
    };

    return groups.map(buildTree);
  }, [counterpartiesGroupsData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!dealName.trim()) {
      newErrors.dealName = 'Название сделки обязательно';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const today = new Date()
    let formattedDate = dealDate || formatDate(today);

    const payload = {
      sale_date: formattedDate,
      name: dealName,
      counterparties_id: client || null,
      nds: nds === 'true',
      commentary: comment,
      status: ["Новая"]
    };

    if (isEditing && initialData?.guid) {
      payload.guid = initialData.guid;
    }

    try {
      await createDeal({
        urlMethod: isEditing ? 'PUT' : 'POST',
        urlParams: '/items/sales_transactions?from-ofs=true',
        data: payload
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['get_sales_list_simple'] });
      queryClient.invalidateQueries({ queryKey: ['get_sales_transaction_by_guid'] });
      onClose();

      // Navigate to the Deal detail page
      // if (response?.data?.data?.guid) {
      //   router.push(`/pages/deals/${response.data.data.guid}`);
      // } else if (isEditing && initialData?.guid) {
      //   // Fallback for edit if response lacks guid
      //   router.push(`/pages/deals/${initialData.guid}`);
      // }
    } catch (error) {
      console.error('Error creating/updating deal:', error);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? 'Редактирование продажи' : 'Новая продажа'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X />
          </button>
        </div>

        <form id="create-deal-form" className="space-y-3 p-5 text-sm font-normal" onSubmit={handleSubmit}>
          <div className="grid grid-cols-7">
            <label className=" col-span-2 flex items-center">Название сделки</label>
            <div className=" col-span-5">
              <Input
                type="text"
                placeholder="Например, разработка сайта"
                value={dealName}
                onChange={(e) => {
                  setDealName(e.target.value);
                  if (errors.dealName) setErrors(prev => ({ ...prev, dealName: '' }));
                }}
                error={!!errors.dealName}
              />
              {errors.dealName && (
                <p className="text-red-500 text-xs mt-1">{errors.dealName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7">
            <label className=" col-span-2 flex items-center">Дата сделки</label>
            <div className=" col-span-5">
              <CustomDatePicker
                value={dealDate}
                onChange={(val) => setDealDate(val)}
                placeholder="Выберите дату"
                format="YYYY-MM-DD"
                className={styles.datePicker}
              />
            </div>
          </div>

          <div className="grid grid-cols-7">
            <label className=" col-span-2 flex items-center">Клиент</label>
            <div className=" col-span-5">
              <TreeSelect
                data={counterAgentsTree}
                value={client}
                onChange={value => setClient(value)}
                placeholder="Укажите кому падаете товар или услугу"
                loading={isLoadingGroups}
              />
            </div>
          </div>

          <div className="grid grid-cols-7">
            <label className=" col-span-2 flex items-center"> НДС </label>
            <div className=" col-span-5">
              <Select
                instanceId="create-deal-nds-select"
                options={ndsOptions}
                value={ndsOptions.find(opt => opt.value === nds) || ''}
                onChange={(selected) => setNds(selected ? selected.value : '')}
                placeholder="Выберите опцию"
              />
            </div>
          </div>

          <div className="grid grid-cols-7">
            <label className=" col-span-2 flex items-center"> Комментарий </label>
            <div className=" col-span-5">
              <TextArea value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
          </div>
        </form>

        <div className={styles.footer}>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Отменить
          </button>
          <button type="submit" form="create-deal-form" className="primary-btn">
            {isCreatingDeal ? <Loader /> : (isEditing ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>
    </div>
  );
}

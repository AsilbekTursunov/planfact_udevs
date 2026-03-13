'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './CreateDealModal.module.scss';
import CustomDatePicker from '@/components/shared/DatePicker';
import Input from '@/components/shared/Input';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const queryClient = useQueryClient();

  console.log(initialData)

  useEffect(() => {
    if (isOpen && initialData) {
      // eslint-disable-next-line
      setDealName(initialData.name || '');
      setDealDate(initialData.sale_date ? formatDate(initialData.sale_date) : '');
      setClient(initialData.counterparties_id || '');
      setNds(initialData.nds ? 'true' : 'false');
      setComment(initialData.commentary || '');
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

    const today = new Date()
    let formattedDate = dealDate || formatDate(today);

    const payload = {
      sale_date: formattedDate,
      name: dealName,
      counterparties_id: client,
      nds: nds === 'true',
      commentary: comment,
      status: ["new"]
    };

    if (isEditing && initialData?.guid) {
      payload.guid = initialData.guid;
    }

    try {
      const response = await createDeal({
        urlMethod: isEditing ? 'PUT' : 'POST',
        urlParams: '/items/sales_transactions?from-ofs=true',
        data: payload
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onClose();

      // Navigate to the Deal detail page
      if (response?.data?.data?.guid) {
        router.push(`/pages/deals/${response.data.data.guid}`);
      } else if (isEditing && initialData?.guid) {
        // Fallback for edit if response lacks guid
        router.push(`/pages/deals/${initialData.guid}`);
      }
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

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Название сделки</label>
            <div className={styles.formElement}>
              <Input
                type="text"
                className={styles.input}
                placeholder="Например, разработка сайта"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Дата сделки</label>
            <div className={styles.formElement}>
              <CustomDatePicker
                value={dealDate}
                onChange={(val) => setDealDate(val)}
                placeholder="Выберите дату"
                format="YYYY-MM-DD"
                className={styles.datePicker}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Клиент</label>
            <div className={styles.formElement}>
              <TreeSelect
                data={counterAgentsTree}
                value={client}
                onChange={value => setClient(value)}
                placeholder="Укажите кому падаете товар или услугу"
                loading={isLoadingGroups}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              НДС
            </label>
            <div className="w-full">
              <Select
                instanceId="create-deal-nds-select"
                options={ndsOptions}
                value={ndsOptions.find(opt => opt.value === nds) || ''}
                onChange={(selected) => setNds(selected ? selected.value : '')}
                placeholder="Выберите опцию"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Комментарий
            </label>
            <TextArea className={styles.label} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </form>

        <div className={styles.footer}>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Отменить
          </button>
          <button type="submit" className="primary-btn" onClick={handleSubmit}>
            {isCreatingDeal ? <Loader /> : (isEditing ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </div>
    </div>
  );
}

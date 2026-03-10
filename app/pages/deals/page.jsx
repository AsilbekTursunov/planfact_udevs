'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './deals.module.scss';

export default function DealsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data with English status values
  const mockDeals = [
    {
      guid: '1',
      data_nachala: '2026-02-13',
      data_okonchaniya: '2026-02-12',
      nazvanie: 'UACADEMY',
      kontragent: { nazvanie: 'UCODE' },
      status: 'Completed',
      summa_sdelki: 0,
      postupilo: '0%',
      otgruzheno: '0%',
      pribyl: 0
    },
    {
      guid: '2',
      data_nachala: '2026-02-13',
      nazvanie: 'icecity',
      kontragent: { nazvanie: 'abdg' },
      status: 'New',
      summa_sdelki: 0,
      postupilo: '100%',
      otgruzheno: '0%',
      pribyl: 0
    }
  ];

  const handleRowClick = (deal, e) => {
    if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) {
      return;
    }
    router.push(`/pages/deals/${deal.guid}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('ru-RU');
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'New': 'green',
      'InProgress': 'blue', 
      'Completed': 'red',
      'Cancelled': 'gray'
    };
    return statusMap[status] || 'gray';
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Сделки по продажам</h1>
            <button className={styles.createButton}>
              Создать
            </button>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.searchWrapper}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Поиск по названию и контрагенту"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input type="checkbox" />
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
              {mockDeals.map(deal => (
                <tr key={deal.guid} onClick={(e) => handleRowClick(deal, e)} style={{ cursor: 'pointer' }}>
                  <td className={styles.checkboxCell}>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <div>{formatDate(deal.data_nachala)}</div>
                      {deal.data_okonchaniya && <div className={styles.dateEnd}>{formatDate(deal.data_okonchaniya)}</div>}
                    </div>
                  </td>
                  <td>{deal.nazvanie || '-'}</td>
                  <td>{deal.kontragent?.nazvanie || '-'}</td>
                  <td>
                    <span className={`${styles.status} ${styles[`status${getStatusColor(deal.status)?.charAt(0).toUpperCase() + getStatusColor(deal.status)?.slice(1)}`]}`}>
                      {deal.status || 'New'}
                    </span>
                  </td>
                  <td>{formatAmount(deal.summa_sdelki)}</td>
                  <td>{deal.postupilo || '0%'}</td>
                  <td>{deal.otgruzheno || '0%'}</td>
                  <td>{formatAmount(deal.pribyl)}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actions}>
                      <button className={styles.actionButton} title="Скачать">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.16675 12.5C3.39018 12.5 3.00189 12.5 2.69561 12.3731C2.28723 12.2039 1.96277 11.8795 1.79362 11.4711C1.66675 11.1648 1.66675 10.7765 1.66675 9.99996V4.33329C1.66675 3.39987 1.66675 2.93316 1.8484 2.57664C2.00819 2.26304 2.26316 2.00807 2.57676 1.84828C2.93328 1.66663 3.39999 1.66663 4.33341 1.66663H10.0001C10.7767 1.66663 11.1649 1.66663 11.4712 1.79349C11.8796 1.96265 12.2041 2.28711 12.3732 2.69549C12.5001 3.00177 12.5001 3.39006 12.5001 4.16663M10.1667 18.3333H15.6667C16.6002 18.3333 17.0669 18.3333 17.4234 18.1516C17.737 17.9918 17.992 17.7369 18.1518 17.4233C18.3334 17.0668 18.3334 16.6 18.3334 15.6666V10.1666C18.3334 9.2332 18.3334 8.76649 18.1518 8.40998C17.992 8.09637 17.737 7.8414 17.4234 7.68162C17.0669 7.49996 16.6002 7.49996 15.6667 7.49996H10.1667C9.23333 7.49996 8.76662 7.49996 8.4101 7.68162C8.09649 7.8414 7.84153 8.09637 7.68174 8.40998C7.50008 8.76649 7.50008 9.2332 7.50008 10.1666V15.6666C7.50008 16.6 7.50008 17.0668 7.68174 17.4233C7.84153 17.7369 8.09649 17.9918 8.4101 18.1516C8.76662 18.3333 9.23333 18.3333 10.1667 18.3333Z" stroke="#475467" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button className={styles.actionButton} title="Удалить">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3333 4.99996V4.33329C13.3333 3.39987 13.3333 2.93316 13.1517 2.57664C12.9919 2.26304 12.7369 2.00807 12.4233 1.84828C12.0668 1.66663 11.6001 1.66663 10.6667 1.66663H9.33333C8.39991 1.66663 7.9332 1.66663 7.57668 1.84828C7.26308 2.00807 7.00811 2.26304 6.84832 2.57664C6.66667 2.93316 6.66667 3.39987 6.66667 4.33329V4.99996M8.33333 9.58329V13.75M11.6667 9.58329V13.75M2.5 4.99996H17.5M15.8333 4.99996V14.3333C15.8333 15.7334 15.8333 16.4335 15.5608 16.9683C15.3212 17.4387 14.9387 17.8211 14.4683 18.0608C13.9335 18.3333 13.2335 18.3333 11.8333 18.3333H8.16667C6.76654 18.3333 6.06647 18.3333 5.53169 18.0608C5.06129 17.8211 4.67883 17.4387 4.43915 16.9683C4.16667 16.4335 4.16667 15.7334 4.16667 14.3333V4.99996" stroke="#475467" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button className={styles.actionButton} title="Редактировать">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.39662 15.0964C2.43491 14.7518 2.45405 14.5795 2.50618 14.4185C2.55243 14.2756 2.61778 14.1397 2.70045 14.0143C2.79363 13.873 2.91621 13.7504 3.16136 13.5053L14.1666 2.50005C15.0871 1.57957 16.5795 1.57957 17.4999 2.50005C18.4204 3.42052 18.4204 4.91291 17.4999 5.83338L6.49469 16.8386C6.24954 17.0838 6.12696 17.2063 5.98566 17.2995C5.86029 17.3822 5.72433 17.4475 5.58146 17.4938C5.42042 17.5459 5.24813 17.5651 4.90356 17.6033L2.08325 17.9167L2.39662 15.0964Z" stroke="#475467" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <span className={styles.footerItem}>
              <span className={styles.footerLabel}>{mockDeals.length} продажа на сумму:</span> 
              <span className={styles.footerAmount}>{formatAmount(mockDeals.reduce((sum, d) => sum + (Number(d.summa_sdelki) || 0), 0))}</span>
            </span>
            <span className={styles.footerItem}>
              <span className={styles.footerLabel}>Общая прибыль:</span> 
              <span className={styles.footerProfit}>{formatAmount(mockDeals.reduce((sum, d) => sum + (Number(d.pribyl) || 0), 0))}</span>
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
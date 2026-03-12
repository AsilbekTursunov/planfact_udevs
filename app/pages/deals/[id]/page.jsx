'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import styles from './deal-detail.module.scss';
import { useUcodeRequestQuery } from '../../../../hooks/useDashboard'; 

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id;

  const { data: dealData } = useUcodeRequestQuery({
    method: "get_sales_transaction_by_guid",
    data: {
      guid: dealId
    },
    querySetting: {
      select: (response) => response?.data?.data?.data
    }
  })

  console.log('dealdata', dealData)


  // Mock data
  const deal = useMemo(() => {
    return {
      guid: dealId,
      nazvanie: dealData?.Nazvanie,
      kontragent: { nazvanie: 'test' },
      data_nachala: '2026-05-26',
      summa_sdelki: 63000000,
      postupilo_summa: 3000000,
      otgruzheno_summa: 17000000,
      pribyl: 16000000,
      status: dealData?.status?.[0]
    }
  }, [dealData, dealId]);

  const isLoading = false;

  const [activeTab, setActiveTab] = useState('products');

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('ru-RU');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`;
  };

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
  const clientOwes = dealAmount - received;

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
      <div className={styles.header}>
        <h1 className={styles.title}>{deal.nazvanie || 'Без названия'}</h1>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        {/* Card 1: Deal Amount */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>
              Сделка на сумму /
            </span>
            <span className={styles.cardStatus}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="3" fill="#12B76A" />
              </svg>
              Завершена
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <div className={styles.cardAmount}>{formatAmount(dealAmount)} ₽</div>

          <div className={styles.cardDivider}></div>

          <div className={styles.dealInfoInCard}>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Тип</span>
              <span className={styles.infoValueInCard}>
                <svg className={styles.infoIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.66668 3.33333C8.66668 4.06971 7.02505 4.66667 5.00001 4.66667C2.97497 4.66667 1.33334 4.06971 1.33334 3.33333M8.66668 3.33333C8.66668 2.59695 7.02505 2 5.00001 2C2.97497 2 1.33334 2.59695 1.33334 3.33333M8.66668 3.33333V4.33333M1.33334 3.33333V11.3333C1.33334 12.0697 2.97497 12.6667 5.00001 12.6667M5.00001 7.33333C4.88765 7.33333 4.77646 7.3315 4.66668 7.3279C2.79784 7.26666 1.33334 6.69552 1.33334 6M5.00001 10C2.97497 10 1.33334 9.40305 1.33334 8.66667M14.6667 7.66667C14.6667 8.40305 13.0251 9 11 9C8.97497 9 7.33334 8.40305 7.33334 7.66667M14.6667 7.66667C14.6667 6.93029 13.0251 6.33333 11 6.33333C8.97497 6.33333 7.33334 6.93029 7.33334 7.66667M14.6667 7.66667V12.6667C14.6667 13.403 13.0251 14 11 14C8.97497 14 7.33334 13.403 7.33334 12.6667V7.66667M14.6667 10.1667C14.6667 10.903 13.0251 11.5 11 11.5C8.97497 11.5 7.33334 10.903 7.33334 10.1667" stroke="#98A2B3" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Продажа
              </span>
            </div>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Клиент</span>
              <span className={styles.infoValueLinkInCard}>{deal.kontragent?.nazvanie || 'test'}</span>
            </div>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Создана</span>
              <span className={styles.infoValueInCard}>{formatDate(deal.data_nachala)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Receipts */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Поступления</span>
            <button className={styles.addButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#D0D5DD" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17C12 19.7614 14.2386 22 17 22C19.7614 22 22 19.7614 22 17C22 14.2386 19.7614 12 17 12C14.2386 12 12 14.2386 12 17ZM12 17C12 15.8742 12.3721 14.8353 13 13.9995V5M12 17C12 17.8254 12.2 18.604 12.5541 19.2901C11.7117 20.0018 9.76584 20.5 7.5 20.5C4.46243 20.5 2 19.6046 2 18.5V5M13 5C13 6.10457 10.5376 7 7.5 7C4.46243 7 2 6.10457 2 5M13 5C13 3.89543 10.5376 3 7.5 3C4.46243 3 2 3.89543 2 5M2 14C2 15.1046 4.46243 16 7.5 16C9.689 16 11.5793 15.535 12.4646 14.8618M13 9.5C13 10.6046 10.5376 11.5 7.5 11.5C4.46243 11.5 2 10.6046 2 9.5" stroke="#98A2B3" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
            <span className={styles.clientDebtAmount}>{formatAmount(clientOwes)} ₽</span>
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
            <button
              className={`${styles.tab} ${activeTab === 'invoices' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              Счета
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'products' && (
              <div className={styles.productsSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>Выберите товары или услуги для продажи</div>
                  <div className={styles.searchContainer}>
                    <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Поиск по названию"
                      className={styles.searchInput}
                    />
                  </div>
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.checkboxColumn}>
                          <input type="checkbox" className={styles.checkbox} />
                        </th>
                        <th>Наименование</th>
                        <th className={styles.rightAlign}>Кол-во</th>
                        <th>Единица</th>
                        <th className={styles.rightAlign}>Цена за ед.</th>
                        <th>Скидка</th>
                        <th>НДС</th>
                        <th className={styles.rightAlign}>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={styles.checkboxColumn}>
                          <input type="checkbox" className={styles.checkbox} />
                        </td>
                        <td className={styles.nameColumn}>Hodim farzandi</td>
                        <td className={styles.rightAlign}>10</td>
                        <td>мес.</td>
                        <td className={styles.rightAlign}>2 800 000 ₽</td>
                        <td>0 %</td>
                        <td>0 %</td>
                        <td className={`${styles.amountColumn} ${styles.rightAlign}`}>28 000 000 ₽</td>
                      </tr>
                      <tr>
                        <td className={styles.checkboxColumn}>
                          <input type="checkbox" className={styles.checkbox} />
                        </td>
                        <td className={styles.nameColumn}>standart</td>
                        <td className={styles.rightAlign}>10</td>
                        <td>мес.</td>
                        <td className={styles.rightAlign}>3 500 000 ₽</td>
                        <td>0 %</td>
                        <td>0 %</td>
                        <td className={`${styles.amountColumn} ${styles.rightAlign}`}>35 000 000 ₽</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className={styles.tableFooter}>
                  <span className={styles.footerText}>2 позиции на сумму:</span>
                  <span className={styles.footerAmount}>63 000 000 ₽</span>
                </div>
              </div>
            )}

            {activeTab === 'receipts' && (
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

            {activeTab === 'expenses' && (
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

            {activeTab === 'invoices' && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="48" rx="24" fill="#F2F4F7" />
                    <path d="M20 18H28M20 22H28M20 26H24M16 30H32C33.1046 30 34 29.1046 34 28V20C34 18.8954 33.1046 18 32 18H16C14.8954 18 14 18.8954 14 20V28C14 29.1046 14.8954 30 16 30Z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.emptyStateTitle}>Выставляйте счета своим клиентам</div>
                <div className={styles.emptyStateSubtext}>Отправляйте счета на оплату своим контрагентам прямо из ПланФакта</div>
              </div>
            )}
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
    </div>
  );
}
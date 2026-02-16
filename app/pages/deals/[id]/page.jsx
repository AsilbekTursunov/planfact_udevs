'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './deal-detail.module.scss';

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id;

  // Mock data - replace with actual API call
  const deal = {
    id: dealId,
    name: 'icecity',
    client: 'UCODE',
    type: 'Продажа',
    created: '01 фев 2026',
    amount: '10 001 000',
    received: '10 001 000',
    shipped: '10 001 000',
    profit: '10 001 000',
    profitPercent: '88%',
    receivedPercent: '100%',
    shippedPercent: '100%',
    status: 'Новая'
  };

  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <button onClick={() => router.push('/pages/deals')} className={styles.breadcrumbLink}>
          Сделки по продажам
        </button>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{deal.name}</span>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{deal.name}</h1>
      </div>

      {/* Info Cards */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>
              Сделка на сумму
              <svg className={styles.cardLabelIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.00001 10.6666V7.99998M8.00001 5.33331H8.00668M14.6667 7.99998C14.6667 11.6819 11.6819 14.6666 8.00001 14.6666C4.31811 14.6666 1.33334 11.6819 1.33334 7.99998C1.33334 4.31808 4.31811 1.33331 8.00001 1.33331C11.6819 1.33331 14.6667 4.31808 14.6667 7.99998Z" stroke="#D0D5DD" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className={styles.cardStatus}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="3" fill="#F79009"/>
              </svg>
              {deal.status}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
          <div className={styles.cardAmount}>{deal.amount} ₽</div>
          
          <div className={styles.cardDivider}></div>
          
          <div className={styles.dealInfoInCard}>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Тип</span>
              <span className={styles.infoValueInCard}>
                <svg className={styles.infoIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.66668 3.33333C8.66668 4.06971 7.02505 4.66667 5.00001 4.66667C2.97497 4.66667 1.33334 4.06971 1.33334 3.33333M8.66668 3.33333C8.66668 2.59695 7.02505 2 5.00001 2C2.97497 2 1.33334 2.59695 1.33334 3.33333M8.66668 3.33333V4.33333M1.33334 3.33333V11.3333C1.33334 12.0697 2.97497 12.6667 5.00001 12.6667M5.00001 7.33333C4.88765 7.33333 4.77646 7.3315 4.66668 7.3279C2.79784 7.26666 1.33334 6.69552 1.33334 6M5.00001 10C2.97497 10 1.33334 9.40305 1.33334 8.66667M14.6667 7.66667C14.6667 8.40305 13.0251 9 11 9C8.97497 9 7.33334 8.40305 7.33334 7.66667M14.6667 7.66667C14.6667 6.93029 13.0251 6.33333 11 6.33333C8.97497 6.33333 7.33334 6.93029 7.33334 7.66667M14.6667 7.66667V12.6667C14.6667 13.403 13.0251 14 11 14C8.97497 14 7.33334 13.403 7.33334 12.6667V7.66667M14.6667 10.1667C14.6667 10.903 13.0251 11.5 11 11.5C8.97497 11.5 7.33334 10.903 7.33334 10.1667" stroke="#98A2B3" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {deal.type}
              </span>
            </div>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Клиент</span>
              <span className={styles.infoValueLinkInCard}>{deal.client}</span>
            </div>
            <div className={styles.infoRowInCard}>
              <span className={styles.infoLabelInCard}>Создана</span>
              <span className={styles.infoValueInCard}>{deal.created}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Поступления</span>
            <button className={styles.addButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#D0D5DD" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.iconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17C12 19.7614 14.2386 22 17 22C19.7614 22 22 19.7614 22 17C22 14.2386 19.7614 12 17 12C14.2386 12 12 14.2386 12 17ZM12 17C12 15.8742 12.3721 14.8353 13 13.9995V5M12 17C12 17.8254 12.2 18.604 12.5541 19.2901C11.7117 20.0018 9.76584 20.5 7.5 20.5C4.46243 20.5 2 19.6046 2 18.5V5M13 5C13 6.10457 10.5376 7 7.5 7C4.46243 7 2 6.10457 2 5M13 5C13 3.89543 10.5376 3 7.5 3C4.46243 3 2 3.89543 2 5M2 14C2 15.1046 4.46243 16 7.5 16C9.689 16 11.5793 15.535 12.4646 14.8618M13 9.5C13 10.6046 10.5376 11.5 7.5 11.5C4.46243 11.5 2 10.6046 2 9.5" stroke="#98A2B3" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className={styles.amountSection}>
              <div className={styles.cardAmount}>0 ₽</div>
              <div className={styles.cardSubtext}>из {deal.amount} ₽</div>
            </div>
          </div>
          
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '0%' }}></div>
          </div>
          <div className={styles.cardProgress}>Нет поступлений</div>
          
          <div className={styles.clientDebt}>
            <span className={styles.clientDebtLabel}>Клиент должен:</span>
            <span className={styles.clientDebtAmount}>{deal.amount} ₽</span>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Отгрузки клиенту</span>
          </div>
          <div className={styles.cardAmount}>{deal.shipped} ₽</div>
          <div className={styles.cardSubtext}>из {deal.amount} ₽</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: deal.shippedPercent }}></div>
          </div>
          <div className={styles.cardProgress}>Отгружено: {deal.shippedPercent}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Прибыль сделки</span>
            <span className={styles.cardBadge}>Учет</span>
          </div>
          <div className={styles.cardAmount}>{deal.profit} ₽</div>
          <div className={styles.cardSubtext}>Рентабельность {deal.profitPercent}</div>
          <div className={styles.profitBars}>
            <div className={styles.profitBar}>
              <span className={styles.profitLabel}>Доходы</span>
              <span className={styles.profitValue}>+{deal.received} ₽</span>
            </div>
            <div className={styles.profitBar}>
              <span className={styles.profitLabel}>Расходы</span>
              <span className={styles.profitValue}>-{deal.shipped} ₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Товары и услуги
          <span className={styles.tabBadge}>1</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'receipts' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          Поступления
          <span className={styles.tabBadge}>0</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'expenses' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Расходы
          <span className={styles.tabBadge}>0</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'shipments' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('shipments')}
        >
          Отгрузки
          <span className={styles.tabBadge}>1</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'invoices' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Счета
          <span className={styles.tabBadge}>0</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'products' && (
          <div className={styles.productsSection}>
            <div className={styles.sectionHeader}>
              <input 
                type="text" 
                placeholder="Поиск по названию"
                className={styles.searchInput}
              />
              <button className={styles.addButton}>Добавить</button>
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Кол-во</th>
                  <th>Единица</th>
                  <th>Цена за ед.</th>
                  <th>Скидка</th>
                  <th>НДС</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div>13 фев 2026</div>
                    <div className={styles.tableSubtext}>13 фев 2026</div>
                  </td>
                  <td>1</td>
                  <td>ч</td>
                  <td>10 001 000 ₽</td>
                  <td>0%</td>
                  <td>0%</td>
                  <td>0</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className={styles.commentsSection}>
        <h3 className={styles.commentsTitle}>Файлы и комментарии</h3>
        
        <div className={styles.comment}>
          <div className={styles.commentHeader}>
            <span className={styles.commentAuthor}>qwewrerg</span>
          </div>
          <div className={styles.commentMeta}>
            <span className={styles.commentEmail}>fr.ibrokhimov@gmail.com</span>
            <span className={styles.commentAmount}>10 001 000 ₽</span>
          </div>
          <div className={styles.commentDate}>11 фев 2026 в 09:10</div>
          
          <div className={styles.attachment}>
            <div className={styles.attachmentIcon}>DOC</div>
            <div className={styles.attachmentInfo}>
              <div className={styles.attachmentName}>Отчёт.DOC</div>
              <div className={styles.attachmentSize}>13 МБ</div>
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
              <path d="M17.5 10.833v2.5c0 1.4-.7 2.1-2.1 2.1h-10.8c-1.4 0-2.1-.7-2.1-2.1v-6.666c0-1.4.7-2.1 2.1-2.1h10.8c1.4 0 2.1.7 2.1 2.1v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className={styles.sendButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18.333 1.667L9.167 10.833M18.333 1.667l-5.833 16.666-3.333-7.5-7.5-3.333 16.666-5.833z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

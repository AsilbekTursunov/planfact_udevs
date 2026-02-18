'use client';

import { useState } from 'react';
import styles from './balance.module.scss';
import { balanceMockData } from './mockData';
import { ExpendClose, ExpendOpen } from '../../../../constants/icons';

export default function BalancePage() {
  const [selectedDate, setSelectedDate] = useState('10.02.2026');
  const [selectedEntity, setSelectedEntity] = useState('Юрлица');
  const [selectedCurrency, setSelectedCurrency] = useState('RUB');

  // Initialize all sections as expanded
  const [expandedSections, setExpandedSections] = useState(() => {
    const initialState = {};
    const initializeSections = (sections) => {
      sections.forEach(section => {
        initialState[section.id] = true;
        if (section.children) {
          initializeSections(section.children);
        }
      });
    };
    initializeSections(balanceMockData.assets);
    initializeSections(balanceMockData.liabilities);
    initializeSections(balanceMockData.equity);
    return initialState;
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderBalanceSection = (section, level = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections[section.id] === true;
    const isParent = level === 0 && hasChildren;

    return (
      <div key={section.id} className={styles.sectionWrapper}>
        <div
          className={`${styles.row} ${styles[`level${level}`]} ${section.isTotal ? styles.totalRow : ''} ${section.isSubtotal ? styles.subtotalRow : ''}`}
          onClick={() => hasChildren && toggleSection(section.id)}
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
        >
          <div className={styles.nameCell}>
            {hasChildren && (
              <button className={styles.expandButton}>
                {isExpanded ? <ExpendClose /> : <ExpendOpen />}
              </button>
            )}
            {!hasChildren && level > 0 && <span className={styles.indent} />}
            <span className={section.isTotal ? styles.totalText : section.isSubtotal ? styles.subtotalText : ''}>{section.name}</span>
          </div>
          <div className={styles.valueCell}>
            <span className={`${section.isTotal ? styles.totalValue : section.isSubtotal ? styles.subtotalValue : styles.normalValue} ${isParent ? styles.parentValue : ''}`}>
              {section.value.toLocaleString('ru-RU')}
            </span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.children}>
            {section.children.map(child => renderBalanceSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Балансовый отчет</h1>
              <button className={styles.infoButton}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_57_8715)">
                    <path d="M6.06001 6.00004C6.21675 5.55449 6.52611 5.17878 6.93331 4.93946C7.34052 4.70015 7.81927 4.61267 8.28479 4.69252C8.75032 4.77236 9.17255 5.01439 9.47673 5.37573C9.7809 5.73706 9.94738 6.19439 9.94668 6.66671C9.94668 8.00004 7.94668 8.66671 7.94668 8.66671M8.00001 11.3334H8.00668M14.6667 8.00004C14.6667 11.6819 11.6819 14.6667 8.00001 14.6667C4.31811 14.6667 1.33334 11.6819 1.33334 8.00004C1.33334 4.31814 4.31811 1.33337 8.00001 1.33337C11.6819 1.33337 14.6667 4.31814 14.6667 8.00004Z" stroke="#D0D5DD" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_57_8715">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>

            <div className={styles.controls}>
              <button className={styles.currencyButton}>
                {selectedCurrency}
              </button>

              <button className={styles.dateButton}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.5 8.33329H2.5M13.3333 1.66663V4.99996M6.66667 1.66663V4.99996M6.5 18.3333H13.5C14.9001 18.3333 15.6002 18.3333 16.135 18.0608C16.6054 17.8211 16.9878 17.4387 17.2275 16.9683C17.5 16.4335 17.5 15.7334 17.5 14.3333V7.33329C17.5 5.93316 17.5 5.2331 17.2275 4.69832C16.9878 4.22791 16.6054 3.84546 16.135 3.60578C15.6002 3.33329 14.9001 3.33329 13.5 3.33329H6.5C5.09987 3.33329 4.3998 3.33329 3.86502 3.60578C3.39462 3.84546 3.01217 4.22791 2.77248 4.69832C2.5 5.2331 2.5 5.93316 2.5 7.33329V14.3333C2.5 15.7334 2.5 16.4335 2.77248 16.9683C3.01217 17.4387 3.39462 17.8211 3.86502 18.0608C4.3998 18.3333 5.09987 18.3333 6.5 18.3333Z" stroke="#667085" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.dateText}>{selectedDate}</span>
              </button>

              <button className={styles.entityButton}>
                <span className={styles.entityText}>{selectedEntity}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.reportContent}>
          <div className={styles.balanceEquation}>
            Активы = Обязательства + Капитал
          </div>

          {/* Assets Section */}
          <div className={styles.balanceSection}>
            <div className={styles.columnHeader}>
              <span>Итого активы</span>
              <span className={styles.headerValue}>16 266</span>
            </div>
            <div className={styles.columnContent}>
              {balanceMockData.assets.map(section => renderBalanceSection(section))}
            </div>
            <div className={`${styles.columnFooter} ${styles.columnFooterAssets}`}>
              <span className={styles.footerLabel}>Итого активы</span>
              <span className={styles.footerValue}>16 266</span>
            </div>
          </div>

          {/* Liabilities Section */}
          <div className={styles.balanceSection}>
            <div className={styles.columnHeader}>
              <span>Итого обязательства</span>
              <span className={styles.headerValue}>16 266</span>
            </div>
            <div className={styles.columnContent}>
              {balanceMockData.liabilities.map(section => renderBalanceSection(section))}
            </div>
            <div className={`${styles.columnFooter} ${styles.columnFooterLiabilities}`}>
              <span className={styles.footerLabel}>Итого обязательства</span>
              <span className={styles.footerValue}>0</span>
            </div>
          </div>

          {/* Equity Section */}
          <div className={styles.balanceSection}>
            <div className={styles.columnHeader}>
              <span>Обязательства + Капитал</span>
              <span className={styles.headerValue}>16 266</span>
            </div>
            <div className={styles.columnContent}>
              {balanceMockData.equity.map(section => renderBalanceSection(section))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

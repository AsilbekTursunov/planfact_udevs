'use client';

import { useState } from 'react';
import styles from '../CreateDealModal/CreateDealModal.module.scss';

export function EditDealModal({ isOpen, onClose, deal }) {
  const [prevDealGuid, setPrevDealGuid] = useState(deal?.guid);
  const [dealName, setDealName] = useState(deal?.name || '');
  const [dealDate, setDealDate] = useState(deal?.date || deal?.sale_date || '');
  const [client, setClient] = useState(deal?.client || deal?.counterparties_id || '');
  const [nds, setNds] = useState('');
  const [comment, setComment] = useState('');

  if (deal?.guid !== prevDealGuid) {
    setPrevDealGuid(deal?.guid);
    setDealName(deal?.name || '');
    setDealDate(deal?.date || deal?.sale_date || '');
    setClient(deal?.client || deal?.counterparties_id || '');
    setNds('');
    setComment('');
  }

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ dealName, dealDate, client, nds, comment });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Редактировать продажу</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Название сделки</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Например, разработка сайта"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Дата сделки</label>
            <input
              type="text"
              className={styles.input}
              placeholder="11.02.2024"
              value={dealDate}
              onChange={(e) => setDealDate(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Клиент</label>
            <select
              className={styles.select}
              value={client}
              onChange={(e) => setClient(e.target.value)}
            >
              <option value="">Укажите кому падаете товар или услугу</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              НДС
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.helpIcon}>
                <circle cx="8" cy="8" r="7" stroke="#98A2B3" strokeWidth="1.5"/>
                <path d="M8 11.5V8M8 5.5H8.005" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </label>
            <select
              className={styles.select}
              value={nds}
              onChange={(e) => setNds(e.target.value)}
            >
              <option value="">С учетом НДС</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Комментарий</label>
            <textarea
              className={styles.textarea}
              placeholder="Ваш комментарий или пояснение к этой сделке"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </form>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Отменить
          </button>
          <button type="submit" className={styles.submitButton} onClick={handleSubmit}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  User,
  Shield,
  DollarSign,
  Clock,
  Trash2,
  ChevronDown,
  GitBranch,
  MoreVertical,
  Pencil,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import styles from './settings.module.scss'
import OperationCheckbox from '../../../components/shared/Checkbox/operationCheckbox'
import Input from '@/components/shared/Input'

/* ─── sidebar nav items ───────────────────────────────── */
const sidebarItems = [
  { id: 'general', label: 'Общие настройки', icon: SettingsIcon },
  { id: 'branches', label: 'Филиалы', icon: GitBranch },
  // { id: 'profile', label: 'Мой профиль', icon: User },
  // { id: 'security', label: 'Безопасность', icon: Shield },
  // { id: 'currency', label: 'Курсы валют', icon: DollarSign },
  // { id: 'history', label: 'История действий', icon: Clock },
  // { id: 'delete', label: 'Удаление данных', icon: Trash2 },
]

/* ─── currency options ────────────────────────────────── */
const currencies = [
  { value: 'RUB', label: 'RUB (Российский рубль)' },
  { value: 'USD', label: 'USD (Доллар США)' },
  { value: 'EUR', label: 'EUR (Евро)' },
  { value: 'UZS', label: 'UZS (Узбекский сум)' },
]


/* ─── validation helpers ──────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HAS_UPPER = /[A-Z]/
const HAS_LOWER = /[a-z]/
const HAS_DIGIT = /[0-9]/

function formatPhone998(raw) {
  let digits = raw.replace(/\D/g, '')
  if (!digits.startsWith('998')) digits = '998' + digits.replace(/^998/, '')
  digits = digits.slice(0, 12)
  let result = '+998'
  const rest = digits.slice(3)
  if (rest.length > 0) result += ' ' + rest.slice(0, 2)
  if (rest.length > 2) result += ' ' + rest.slice(2, 5)
  if (rest.length > 5) result += ' ' + rest.slice(5, 7)
  if (rest.length > 7) result += ' ' + rest.slice(7, 9)
  return result
}

/* ═══════════════════════════════════════════════════════ */
/*  DeleteBranchModal                                     */
/* ═══════════════════════════════════════════════════════ */

function DeleteBranchModal({ open, onClose, onConfirm, branch }) {
  console.log('DeleteBranchModal render:', { open, branch })
  
  if (!open || typeof window === 'undefined') return null

  return createPortal(
    <>
      <div 
        className={styles.deleteModalOverlay} 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      <div 
        className={styles.deleteModal}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          background: '#fff',
          borderRadius: '14px',
          padding: 0,
          width: '480px',
          maxWidth: '95vw',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
        }}
      >
        <div className={styles.deleteModalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 className={styles.deleteModalTitle} style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Подтверждение удаления</h3>
          <button className={styles.deleteModalClose} onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
        <div className={styles.deleteModalBody} style={{ padding: '24px 28px' }}>
          <p className={styles.deleteModalText} style={{ fontSize: '15px', color: '#334155', margin: '0 0 20px', lineHeight: 1.5 }}>
            Вы уверены, что хотите удалить филиал?
          </p>
          {branch && (
            <div className={styles.deleteModalInfo} style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className={styles.deleteModalInfoItem} style={{ display: 'flex', gap: '8px', fontSize: '13.5px' }}>
                <span className={styles.deleteModalInfoLabel} style={{ color: '#64748b', minWidth: '120px', fontWeight: 500 }}>Название:</span>
                <span className={styles.deleteModalInfoValue} style={{ color: '#0f172a', fontWeight: 500 }}>{branch.branchName || '—'}</span>
              </div>
              <div className={styles.deleteModalInfoItem} style={{ display: 'flex', gap: '8px', fontSize: '13.5px' }}>
                <span className={styles.deleteModalInfoLabel} style={{ color: '#64748b', minWidth: '120px', fontWeight: 500 }}>Email:</span>
                <span className={styles.deleteModalInfoValue} style={{ color: '#0f172a', fontWeight: 500 }}>{branch.email || '—'}</span>
              </div>
              <div className={styles.deleteModalInfoItem} style={{ display: 'flex', gap: '8px', fontSize: '13.5px' }}>
                <span className={styles.deleteModalInfoLabel} style={{ color: '#64748b', minWidth: '120px', fontWeight: 500 }}>Пользователь:</span>
                <span className={styles.deleteModalInfoValue} style={{ color: '#0f172a', fontWeight: 500 }}>{branch.name || '—'}</span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.deleteModalFooter} style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 28px 24px' }}>
          <button className={styles.deleteModalButtonCancel} onClick={onClose} style={{ padding: '9px 22px', background: '#fff', color: '#475569', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' }}>
            Отмена
          </button>
          <button className={styles.deleteModalButtonConfirm} onClick={onConfirm} style={{ padding: '9px 22px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
            Удалить
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  BranchModal                                          */
/* ═══════════════════════════════════════════════════════ */

function BranchModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '+998',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.branchName || initial.name || '',
        username: initial.username || initial.name || '',
        email: initial.email || '',
        password: '',
        phone: initial.phone || '+998',
      })
    } else {
      setForm({ name: '', username: '', email: '', password: '', phone: '+998' })
    }
    setErrors({})
  }, [initial, open])

  if (!open) return null

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function handlePhoneChange(e) {
    handleChange('phone', formatPhone998(e.target.value))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Введите название филиала'
    if (!form.username.trim()) errs.username = 'Введите имя пользователя'
    if (!form.email.trim()) {
      errs.email = 'Введите email'
    } else if (!EMAIL_RE.test(form.email)) {
      errs.email = 'Неверный формат email'
    }
    if (!initial) {
      if (!form.password) {
        errs.password = 'Введите пароль'
      } else if (form.password.length < 8) {
        errs.password = 'Минимум 8 символов'
      } else if (!HAS_UPPER.test(form.password)) {
        errs.password = 'Нужна заглавная буква (A-Z)'
      } else if (!HAS_LOWER.test(form.password)) {
        errs.password = 'Нужна строчная буква (a-z)'
      } else if (!HAS_DIGIT.test(form.password)) {
        errs.password = 'Нужна цифра (0-9)'
      }
    }
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 12) {
      errs.phone = 'Введите полный номер (+998 XX XXX XX XX)'
    }
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSubmit(form)
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          <X size={18} />
        </button>
        <h2 className={styles.modalTitle}>{initial ? 'Редактировать филиал' : 'Добавить филиал'}</h2>

        <div className={styles.modalForm}>
          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Название филиала</label>
            <Input placeholder='Название филиала' value={form.name} onChange={e => handleChange('name', e.target.value)} error={!!errors.name} />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Имя пользователя филиала</label>
            <Input placeholder='Имя пользователя' value={form.username} onChange={e => handleChange('username', e.target.value)} error={!!errors.username} />
            {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
          </div>

          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Электронная почта</label>
            <Input type='email' placeholder='example@mail.com' value={form.email} onChange={e => handleChange('email', e.target.value)} error={!!errors.email} />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.modalFieldRow}>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Пароль</label>
              <div className={styles.passwordWrap}>
                <Input type={showPassword ? 'text' : 'password'} placeholder='Пароль' value={form.password} onChange={e => handleChange('password', e.target.value)} error={!!errors.password} />
                <button type='button' className={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Телефон</label>
              <Input type='tel' placeholder='+998 XX XXX XX XX' value={form.phone} onChange={handlePhoneChange} error={!!errors.phone} />
              {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.modalCancelBtn} onClick={onClose}>Отменить</button>
          <button className={styles.modalSubmitBtn} onClick={handleSubmit}>
            {initial ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { createPortal } from 'react-dom'

function RowDropdown({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const menuRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    function handler(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.right - 200 })
    }
    setOpen(prev => !prev)
  }

  return (
    <>
      <button className={styles.dotsBtn} ref={btnRef} onClick={handleToggle}>
        <MoreVertical size={18} />
      </button>
      {open && createPortal(
        <ul
          className={styles.dropdownMenu}
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
        >
          <li className={styles.dropdownItem} onClick={() => { onEdit(); setOpen(false) }}>
            <Pencil size={15} />
            <span>Редактировать</span>
          </li>
          <li className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => { onDelete(); setOpen(false) }}>
            <Trash2 size={15} />
            <span>Удалить</span>
          </li>
        </ul>,
        document.body
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════ */
/*  SettingsPage                                         */
/* ═══════════════════════════════════════════════════════ */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')

  /* ── general form state ──────────────────────────── */
  const [currency, setCurrency] = useState('RUB')
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const [insertDateOnCopy, setInsertDateOnCopy] = useState(false)
  const [purposeOptional, setPurposeOptional] = useState(false)

  /* ── branches state ──────────────────────────────── */
  const [branches, setBranches] = useState([
    {
      id: 1,
      email: 'branch1@example.com',
      role: 'Администратор',
      name: 'Иван Иванов',
      position: 'Менеджер',
      status: 'Активный',
      lastLogin: '15.01.2024, 14:30',
      createdAt: '10.01.2024, 10:00',
      branchName: 'Филиал №1',
      phone: '+998 90 123 45 67',
    },
    {
      id: 2,
      email: 'branch2@example.com',
      role: 'Администратор',
      name: 'Петр Петров',
      position: 'Директор',
      status: 'Активный',
      lastLogin: '14.01.2024, 16:45',
      createdAt: '08.01.2024, 09:15',
      branchName: 'Филиал №2',
      phone: '+998 91 234 56 78',
    },
    {
      id: 3,
      email: 'branch3@example.com',
      role: 'Администратор',
      name: 'Сергей Сергеев',
      position: '—',
      status: 'Приглашен',
      lastLogin: '—',
      createdAt: '12.01.2024, 11:20',
      branchName: 'Филиал №3',
      phone: '+998 93 345 67 89',
    },
  ])
  const [branchModalOpen, setBranchModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState(null)

  /* ── branch handlers ─────────────────────────────── */

  function handleAddBranch(form) {
    const newBranch = {
      id: Date.now(),
      email: form.email,
      role: 'Администратор',
      name: form.username,
      position: '—',
      status: 'Приглашен',
      lastLogin: '—',
      createdAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      branchName: form.name,
      phone: form.phone,
    }
    setBranches(prev => [...prev, newBranch])
  }

  function handleEditBranch(form) {
    setBranches(prev =>
      prev.map(b =>
        b.id === editingBranch.id
          ? { ...b, branchName: form.name, name: form.username, email: form.email, phone: form.phone }
          : b
      )
    )
    setEditingBranch(null)
  }

  function handleDeleteBranch(branch) {
    console.log('handleDeleteBranch called with:', branch)
    setBranchToDelete(branch)
    setDeleteModalOpen(true)
  }

  function confirmDeleteBranch() {
    console.log('confirmDeleteBranch called')
    if (branchToDelete) {
      setBranches(prev => prev.filter(b => b.id !== branchToDelete.id))
      setDeleteModalOpen(false)
      setBranchToDelete(null)
    }
  }

  function cancelDeleteBranch() {
    console.log('cancelDeleteBranch called')
    setDeleteModalOpen(false)
    setBranchToDelete(null)
  }


  /* ── render general section ──────────────────────── */

  function renderGeneral() {
    const selected = currencies.find(c => c.value === currency)

    return (
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Общие настройки</h1>

        {/* ── Настройки аккаунта ─────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Настройки аккаунта</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Основная валюта</label>
            <div className={styles.selectWrap}>
              <button
                className={styles.select}
                onClick={() => setCurrencyOpen(prev => !prev)}
                type='button'
              >
                <span>{selected?.label}</span>
                <ChevronDown size={16} className={currencyOpen ? styles.chevronOpen : ''} />
              </button>
              {currencyOpen && (
                <ul className={styles.selectDropdown}>
                  {currencies.map(c => (
                    <li
                      key={c.value}
                      className={`${styles.selectOption} ${c.value === currency ? styles.selectOptionActive : ''}`}
                      onClick={() => { setCurrency(c.value); setCurrencyOpen(false) }}
                    >
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ── Настройки учета ────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Настройки учета</h2>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Создание и редактирование операций</h2>
            <OperationCheckbox checked={insertDateOnCopy} onChange={() => setInsertDateOnCopy(v => !v)} label='Подставлять текущую дату при копировании операции' />
            <OperationCheckbox checked={purposeOptional} onChange={() => setPurposeOptional(v => !v)} label='Сделать поле «Назначение платежа» необязательным' />
          </section>
        </section>
      </div>
    )
  }

  /* ── render branches section ─────────────────────── */

  function renderBranches() {
    return (
      <div className={styles.mainContent}>
        <div className={styles.branchesHeader}>
          <h1 className={styles.pageTitle}>Филиалы</h1>
          <button
            className={styles.addBranchBtn}
            onClick={() => { setEditingBranch(null); setBranchModalOpen(true) }}
          >
            Добавить
          </button>
        </div>

        {branches.length > 0 ? (
          <div className={styles.branchesTableWrap}>
            <table className={styles.branchesTable}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>ФИО / Должность</th>
                  <th>Последний вход</th>
                  <th>Дата создания</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => (
                  <tr key={branch.id}>
                    <td>{branch.email}</td>
                    <td>{branch.role}</td>
                    <td>
                      <div>{branch.name}</div>
                      <div className={styles.cellSub}>{branch.position}</div>
                    </td>
                    <td>{branch.lastLogin}</td>
                    <td>{branch.createdAt}</td>
                    <td>
                      <RowDropdown
                        onEdit={() => {
                          setEditingBranch(branch)
                          setBranchModalOpen(true)
                        }}
                        onDelete={() => handleDeleteBranch(branch)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyStateBranches}>
            <h2 className={styles.emptyTitle}>Создайте филиал</h2>
            <p className={styles.emptyDescription}>
              Филиалы помогают сравнивать прибыль и рентабельность разных частей бизнеса. 
              Например, заказов, направлений или каналов продаж.
            </p>
            <p className={styles.emptyHint}>
              Для удобства филиалы можно объединять в группы.<br />
              Как ими пользоваться, <a href="#">посмотрите видео</a> или <a href="#">почитайте статью</a>.
            </p>
            <button 
              className={styles.addButtonLarge}
              onClick={() => { setEditingBranch(null); setBranchModalOpen(true) }}
              aria-label="Создать филиал"
            >
              <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="55" cy="55" r="53" stroke="currentColor" strokeWidth="4"></circle>
                <rect x="53" y="31" width="4" height="48" fill="currentColor"></rect>
                <rect x="79" y="53" width="4" height="48" transform="rotate(90 79 53)" fill="currentColor"></rect>
              </svg>
            </button>
          </div>
        )}

        <BranchModal
          open={branchModalOpen}
          onClose={() => { setBranchModalOpen(false); setEditingBranch(null) }}
          onSubmit={editingBranch ? handleEditBranch : handleAddBranch}
          initial={editingBranch}
        />

        <DeleteBranchModal
          open={deleteModalOpen}
          onClose={cancelDeleteBranch}
          onConfirm={confirmDeleteBranch}
          branch={branchToDelete}
        />
      </div>
    )
  }

/* ── placeholder for other sections ──────────────── */

  function renderPlaceholder(title) {
    return (
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.placeholder}>Раздел в разработке</p>
      </div>
    )
  }

  function renderContent() {
    if (activeSection === 'general') return renderGeneral()
    if (activeSection === 'branches') return renderBranches()
    const item = sidebarItems.find(i => i.id === activeSection)
    return renderPlaceholder(item?.label || '')
  }

  /* ── layout ──────────────────────────────────────── */

  return (
    <div className={styles.container}>
      {/* Left sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Настройки</h2>
        <nav className={styles.sidebarNav}>
          {sidebarItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`${styles.sidebarItem} ${activeSection === item.id ? styles.sidebarItemActive : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      {renderContent()}
    </div>
  )
}
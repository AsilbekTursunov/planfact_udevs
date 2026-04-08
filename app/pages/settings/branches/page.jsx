'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useUcodeRequestMutation, useUcodeRequestQuery } from '@/hooks/useDashboard'
import {
  Trash2,
  MoreVertical,
  Pencil,
  X,
  Eye,
  EyeOff,
  Loader,
} from 'lucide-react'
import styles from '../settings.module.scss'
import Input from '@/components/shared/Input'
import { formatDateTime } from '../../../../utils/formatDate'

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

function DeleteBranchModal({ open, onClose, onConfirm, branch, loading }) {

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
                <span className={styles.deleteModalInfoValue} style={{ color: '#0f172a', fontWeight: 500 }}>{branch.branch_user?.branch_id_data?.name || '—'}</span>
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
          <button className={styles.deleteModalButtonConfirm} onClick={onConfirm} disabled={loading} style={{ padding: '9px 22px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? <Loader size={18} /> : 'Удалить'}
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
  const [form, setForm] = useState(() => ({
    name: initial?.branchName || initial?.name || '',
    username: initial?.username || initial?.name || '',
    email: initial?.email || '',
    password: '',
    phone: initial?.phone || '+998',
  }))
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const { mutateAsync: createBranchUser, isPending: isCreating } = useUcodeRequestMutation()

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

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    if (!initial) {
      // Create new branch via API
      await createBranchUser({
        method: 'create_branch_user',
        data: {
          branch_name: form.name,
          email: form.email,
          password: form.password,
          branch_user_name: form.username,
          branch_user_phone: form.phone,
        },
      })
    } else {
      await createBranchUser({
        method: 'update_branch_user',
        data: {
          branch_user_id: initial.branch_user_id,
          branch_user_name: form.username,
          branch_user_phone: form.phone,
          default_branch_id: initial.defaultBranchId,
          allowed_branch_ids: initial.id
        }
      })
    }

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
          <button className={styles.modalCancelBtn} onClick={onClose} disabled={isCreating}>Отменить</button>
          <button className={styles.modalSubmitBtn} onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Создание...' : initial ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  )
}

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

export default function BranchesPage() {
  const { data: branchesData, isLoading: branchesLoading, refetch: refetchBranches } = useUcodeRequestQuery({
    method: 'get_branch_users',
    data: { page: 1, limit: 50, search: '', include_owner: true },
  })
  const branches = branchesData?.data?.data ?? []

  const [branchModalOpen, setBranchModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState(null)

  const { mutateAsync: mutateBranch, isPending: mutateLoading } = useUcodeRequestMutation()

  function handleAddBranch() {
    refetchBranches()
  }

  function handleEditBranch() {
    setEditingBranch(null)
    refetchBranches()
  }

  function handleDeleteBranch(branch) {
    setBranchToDelete(branch)
    setDeleteModalOpen(true)
  }

  async function confirmDeleteBranch() {
    if (branchToDelete) {
      const id = typeof branchToDelete === 'object' ? branchToDelete.branch_user_id : branchToDelete
      await mutateBranch({
        method: 'delete_branch_user',
        data: {
          branch_user_id: id
        }
      })
      setDeleteModalOpen(false)
      setBranchToDelete(null)
      refetchBranches()
    }
  }

  function cancelDeleteBranch() {
    setDeleteModalOpen(false)
    setBranchToDelete(null)
  }




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

      {branchesLoading ? (
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
              {[1, 2, 3].map(i => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <td key={j}><span style={{ opacity: 0.3 }}>—</span></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : branches?.data?.length > 0 ? (
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
              {branches?.data?.map(branch => (
                <tr key={branch?.guid}>
                  <td>{branch?.email}</td>
                  <td>{branch?.branch_user?.role_id_data?.name ?? 'Администратор'}</td>
                  <td>
                    <div>{branch?.branch_user_name ?? branch?.name ?? '—'}</div>
                    <div className={styles.cellSub}>{branch?.branch_name ?? '—'}</div>
                  </td>
                  <td>{formatDateTime(branch?.branch_user?.updated_at) ?? '—'}</td>
                  <td>{formatDateTime(branch?.branch_user?.created_at) ?? '—'}</td>
                  <td>
                    <RowDropdown
                      onEdit={() => {
                        setEditingBranch({
                          id: branch?.allowed_branch_ids,
                          branch_user_id: branch?.branch_user_id,
                          branchName: branch?.branch_user?.branch_id_data?.name,
                          username: branch?.branch_user_name ?? branch?.name,
                          email: branch?.email,
                          defaultBranchId: branch?.default_branch_id,
                          phone: branch?.branch_user_phone ?? branch?.phone,
                        })
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
        key={`${branchModalOpen}-${editingBranch?.id ?? 'new'}`}
        open={branchModalOpen}
        onClose={() => { setBranchModalOpen(false); setEditingBranch(null) }}
        onSubmit={editingBranch ? handleEditBranch : handleAddBranch}
        initial={editingBranch}
      />

      <DeleteBranchModal
        open={deleteModalOpen}
        onClose={cancelDeleteBranch}
        onConfirm={confirmDeleteBranch}
        loading={mutateLoading}
        branch={branchToDelete}
      />
    </div>
  )
}
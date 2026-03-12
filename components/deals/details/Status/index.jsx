import React, { useState, useRef, useEffect } from 'react'
import { ChevronUp, GripVertical, Check, Pencil, Trash2 } from 'lucide-react'
import styles from './style.module.scss'

const DEFAULT_COLORS = [
  '#F79009', // orange
  '#2E90FA', // blue  
  '#12B76A', // green
  '#F04438', // red
  '#7A5AF8', // purple
  '#EE46BC', // pink
  '#667085', // gray
  '#15B79E', // teal
]

export default function DealStatus({ 
  statuses = [], 
  currentStatus = null, 
  onStatusChange, 
  onStatusEdit, 
  onStatusDelete,
  onStatusCreate 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { index, x, y }
  const [editingStatus, setEditingStatus] = useState(null) // { index, name, color }
  const [newStatusName, setNewStatusName] = useState('')
  const [newStatusColor, setNewStatusColor] = useState(DEFAULT_COLORS[0])
  const [showNewForm, setShowNewForm] = useState(false)
  const dropdownRef = useRef(null)
  const contextRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setContextMenu(null)
        setEditingStatus(null)
        setShowNewForm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close context menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContextMenu(null)
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu])

  const activeStatus = currentStatus || statuses[0]
  const activeColor = activeStatus?.color || '#F79009'
  const activeName = activeStatus?.name || 'Новая'

  const handleSelect = (status) => {
    onStatusChange?.(status)
    setIsOpen(false)
    setContextMenu(null)
  }

  const handleContextMenu = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ index })
  }

  const handleEdit = (status, index) => {
    setEditingStatus({ index, name: status.name, color: status.color })
    setContextMenu(null)
  }

  const handleDelete = (status) => {
    onStatusDelete?.(status)
    setContextMenu(null)
  }

  const handleSaveEdit = () => {
    if (editingStatus) {
      onStatusEdit?.({
        ...statuses[editingStatus.index],
        name: editingStatus.name,
        color: editingStatus.color,
      })
      setEditingStatus(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingStatus(null)
  }

  const handleSaveNew = () => {
    if (newStatusName.trim()) {
      onStatusCreate?.({ name: newStatusName.trim(), color: newStatusColor })
      setNewStatusName('')
      setNewStatusColor(DEFAULT_COLORS[0])
      setShowNewForm(false)
    }
  }

  const handleCancelNew = () => {
    setNewStatusName('')
    setNewStatusColor(DEFAULT_COLORS[0])
    setShowNewForm(false)
  }

  return (
    <div className={styles.statusWrapper} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        className={styles.statusTrigger}
        style={{ backgroundColor: `${activeColor}15`, color: activeColor }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.statusDot} style={{ backgroundColor: activeColor }} />
        <span className={styles.statusName}>{activeName}</span>
        <ChevronUp
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.statusList}>
            {statuses.map((status, index) => {
              const isActive = status.guid === activeStatus?.guid || status.name === activeName
              const isEditing = editingStatus?.index === index

              if (isEditing) {
                return (
                  <div key={status.guid || index} className={styles.editRow}>
                    <input
                      className={styles.editInput}
                      value={editingStatus.name}
                      onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })}
                      autoFocus
                    />
                    <div className={styles.colorPicker}>
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`${styles.colorOption} ${editingStatus.color === color ? styles.colorActive : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditingStatus({ ...editingStatus, color })}
                        />
                      ))}
                    </div>
                    <div className={styles.editActions}>
                      <button className={styles.cancelBtn} onClick={handleCancelEdit}>Отменить</button>
                      <button className={styles.saveBtn} onClick={handleSaveEdit}>Сохранить</button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={status.guid || index} className={styles.statusItem}>
                  <div className={styles.statusItemLeft} onClick={() => handleSelect(status)}>
                    <GripVertical size={14} className={styles.gripIcon} />
                    <span className={styles.statusDot} style={{ backgroundColor: status.color || '#667085' }} />
                    <span className={styles.statusItemName}>{status.name}</span>
                  </div>
                  <div className={styles.statusItemRight}>
                    {isActive && <Check size={16} className={styles.checkIcon} />}
                    <button
                      className={styles.moreBtn}
                      onClick={(e) => handleContextMenu(e, index)}
                    >
                      ⋯
                    </button>
                  </div>

                  {/* Context Menu */}
                  {contextMenu?.index === index && (
                    <div className={styles.contextMenu} ref={contextRef}>
                      <button className={styles.contextItem} onClick={() => handleEdit(status, index)}>
                        <Pencil size={14} />
                        <span>Редактировать</span>
                      </button>
                      <button className={`${styles.contextItem} ${styles.contextDelete}`} onClick={() => handleDelete(status)}>
                        <Trash2 size={14} />
                        <span>Удалить</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* New Status Form */}
          {showNewForm ? (
            <div className={styles.newStatusForm}>
              <input
                className={styles.editInput}
                placeholder="Название статуса"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                autoFocus
              />
              <div className={styles.colorPicker}>
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`${styles.colorOption} ${newStatusColor === color ? styles.colorActive : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewStatusColor(color)}
                  />
                ))}
              </div>
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={handleCancelNew}>Отменить</button>
                <button className={styles.saveBtn} onClick={handleSaveNew}>Сохранить</button>
              </div>
            </div>
          ) : (
            <button className={styles.addStatusBtn} onClick={() => setShowNewForm(true)}>
              + Добавить статус
            </button>
          )}
        </div>
      )}
    </div>
  )
}

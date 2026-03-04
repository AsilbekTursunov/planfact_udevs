"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/app/lib/utils'
import styles from './OperationsTable.module.scss'

export function OperationMenu({ operation, onEdit, onDelete, onCopy }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const justOpenedRef = useRef(false)
  const buttonClickedRef = useRef(false)

  useEffect(() => {
    if (!isOpen) return

    // Calculate position for dropdown
    const calculatePosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const dropdownHeight = 160 // approximate height of 3-item menu
        const spaceBelow = viewportHeight - buttonRect.bottom
        const openUp = spaceBelow < dropdownHeight + 8

        setPosition({
          top: openUp ? undefined : buttonRect.bottom + 4,
          bottom: openUp ? viewportHeight - buttonRect.top + 4 : undefined,
          left: buttonRect.right,
          openUp,
        })
      }
    }

    // Calculate position with double RAF to ensure button is rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        calculatePosition()
      })
    })

    function handleClickOutside(event) {
      const target = event.target
      
      if (buttonClickedRef.current) {
        return
      }
      
      if (buttonRef.current && (
        buttonRef.current === target ||
        buttonRef.current.contains(target)
      )) {
        return
      }

      if (
        (menuRef.current && menuRef.current.contains(target)) ||
        (dropdownRef.current && dropdownRef.current.contains(target))
      ) {
        return
      }

      if (justOpenedRef.current) {
        return
      }

      setIsOpen(false)
    }

    justOpenedRef.current = true
    
    let timeoutId = null
    
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = setTimeout(() => {
          document.addEventListener('click', handleClickOutside, true)
          setTimeout(() => {
            justOpenedRef.current = false
          }, 400)
        }, 200)
      })
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (timeoutId) clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside, true)
      justOpenedRef.current = false
    }
  }, [isOpen])

  const handleEdit = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    onEdit(operation)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    onDelete(operation)
  }

  const handleCopy = (e) => {
    e.stopPropagation()
    setIsOpen(false)
    if (onCopy) onCopy(operation)
  }

  const handleButtonClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    buttonClickedRef.current = true
    setIsOpen(prev => !prev)
    setTimeout(() => {
      buttonClickedRef.current = false
    }, 100)
  }

  return (
    <div 
      ref={menuRef}
      className={styles.menuContainer}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={buttonRef}
        className={styles.menuButton}
        onClick={handleButtonClick}
        type="button"
      >
        <svg className={styles.menuIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className={styles.menuDropdown}
          style={{
            position: 'fixed',
            ...(position.openUp
              ? { bottom: `${position.bottom}px` }
              : { top: `${position.top}px` }
            ),
            left: `${position.left}px`,
            transform: 'translateX(-100%)',
            zIndex: 99999
          }}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <button
            className={styles.menuItem}
            onClick={handleEdit}
          >
            <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Редактировать</span>
          </button>

          <button
            className={styles.menuItem}
            onClick={handleCopy}
          >
            <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Копировать</span>
          </button>

          <button
            className={cn(styles.menuItem, styles.menuItemDanger)}
            onClick={handleDelete}
          >
            <svg className={styles.menuItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Удалить</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

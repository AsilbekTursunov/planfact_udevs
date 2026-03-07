'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './style.module.scss'
import { DesignCalenderIcon } from '../../../constants/icons'
import CustomCalendar from '../../shared/Calendar'
import { formatDate } from '../../../utils/formatDate'
import { CgClose } from 'react-icons/cg'

const getPresetRange = (key) => {

  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()
  const dow = (today.getDay() + 6) % 7 // Mon=0

  switch (key) {
    case 'today':
      return [today, today]
    case 'yesterday': {
      const yd = new Date(y, m, d - 1)
      return [yd, yd]
    }
    case 'prev_week': {
      const start = new Date(y, m, d - dow - 7)
      const end = new Date(y, m, d - dow - 1)
      return [start, end]
    }
    case 'week': {
      const start = new Date(y, m, d - dow)
      return [start, today]
    }
    case 'prev_month': {
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 0)
      return [start, end]
    }
    case 'month':
      return [new Date(y, m, 1), today]
    case 'prev_quarter': {
      const qStart = new Date(y, Math.floor(m / 3) * 3 - 3, 1)
      const qEnd = new Date(y, Math.floor(m / 3) * 3 - 1, 0)
      return [qStart, qEnd]
    }
    case 'quarter': {
      const qStart = new Date(y, Math.floor(m / 3) * 3, 1)
      return [qStart, today]
    }
    case 'prev_year': {
      const start = new Date(y - 1, 0, 1)
      const end = new Date(y - 1, 11, 31)
      return [start, end]
    }
    case 'year':
      return [new Date(y, 0, 1), today]
    default:
      return [null, null]
  }
}

const PRESETS = {
  day: [{ key: 'yesterday', label: 'Вчера' },
  { key: 'today', label: 'Сегодня' },],
  week: [{ key: 'prev_week', label: 'Прошлая неделя' },
  { key: 'week', label: 'Текущая неделя' },],
  month: [{ key: 'prev_month', label: 'Прошлый месяц' },
  { key: 'month', label: 'Текущий месяц' },],
  quarter: [{ key: 'prev_quarter', label: 'Прошлый квартал' },
  { key: 'quarter', label: 'Текущий квартал' },],
  year: [{ key: 'prev_year', label: 'Прошлый год' },
  { key: 'year', label: 'Текущий год' },]
}

export default function NewDateRangeComponent({ value, onChange }) {
  const [startDate, setStartDate] = useState(value?.start || null)
  const [endDate, setEndDate] = useState(value?.end || null)
  const [activePreset, setActivePreset] = useState(null)
  const [focused, setFocused] = useState(null)
  const [dateType, setDateType] = useState()
  const wrapperRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setFocused(false)
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  const handlePreset = (key) => {
    const [s, e] = getPresetRange(key)
    setStartDate(s)
    setEndDate(e)
    setActivePreset(key)
  }

  const handleReset = () => {
    setStartDate(null)
    setEndDate(null)
    setDateType(null)
    setFocused(false)
    setActivePreset(null)
    onChange?.({ start: null, end: null })
  }

  const handleApply = () => {
    onChange?.({ start: startDate, end: endDate })
    setOpen(false)
    setFocused(false)
  }

  const handleDateType = (type) => {
    setDateType(type)
    setFocused(!!type)
  }


  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <DesignCalenderIcon />
        <input
          type="text"
          value={`${startDate ? formatDate(startDate) + ' ~' : 'Укажите '} ${endDate ? formatDate(endDate) : 'период'}`}
          onClick={() => setFocused(true)}
          className={styles.input}
          placeholder="Укажите период"
          readOnly
          onFocus={() => setOpen(true)}
        />
        {(startDate || endDate) && <CgClose onClick={() => handleReset()} className={styles.closeIcon} />}
      </div>
      {/* Quick presets */}
      <div style={{ display: open ? 'block' : 'none' }} className={`${styles.modalContent} ${focused ? styles.focused : ''}`}>
        <div className={styles.presets}>
          {Object.entries(PRESETS).map(([key, label]) => (
            <div key={key} className={styles.presetGroup}>
              {label.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`${styles.presetBtn} ${activePreset === item.key ? styles.presetActive : ''}`}
                  onClick={() => handlePreset(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Date pickers row */}
        <div className={styles.pickers}>
          <div className={styles.inputWrapper}>
            <DesignCalenderIcon />
            <input type="text" value={startDate ? formatDate(startDate) : 'Начало периода'} onClick={() => handleDateType('startDate')} readOnly className={styles.input} placeholder="Выберите период" />
          </div>
          <div className={styles.inputWrapper}>
            <DesignCalenderIcon />
            <input type="text" value={endDate ? formatDate(endDate) : 'Конец периода'} onClick={() => handleDateType('endDate')} readOnly className={styles.input} placeholder="Выберите период" />
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            Сбросить
          </button>
          <button type="button" className={styles.applyBtn} onClick={handleApply}>
            Применить
          </button>
        </div>
        <div className={styles.calendarWrapper} style={{ display: dateType ? 'block' : 'none' }}>
          {dateType === 'startDate' && <CustomCalendar maxDate={endDate} format="DD MMM, YYYY" value={startDate} onChange={(value) => {
            setStartDate(value)
            setDateType('endDate')
          }} />}
          {dateType === 'endDate' && <CustomCalendar minDate={startDate} format="DD MMM, YYYY" value={endDate} onChange={(value) => {
            setEndDate(value)
            setDateType('')
          }} />}
        </div>
      </div>

    </div>
  )
}

import { useEffect, useState } from 'react'
import './style.scss'
import MultipleSelect from '../../../shared/MultipleSelect'
import { CalendarCellIcon, CalendarIcon, CreditIcon, MergeArrowsIcon, SortArrow } from '../../../../constants/icons'
import { formatAmount, formatDateRu } from '../../../../utils/helpers'
import CustomCalendar from '../../../shared/Calendar'
import OperationCheckbox from '../../../shared/Checkbox/operationCheckbox'
import { GroupedSelect } from '../../../common/GroupedSelect/GroupedSelect'
import { TreeSelect } from '../../../common/TreeSelect/TreeSelect'




import { SplitAmountCancelModal } from './SplitAmountCancelModal'

// ── Main component ──────────────────────────────────────────
const SplitAmount = ({ amount, counterAgents,
  chartOfAccountsOptions, onChange, rows,
  dispatch, selectedSplits, setSelectedSplits }) => {
  const [open, setOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const [openCalendarIdx, setOpenCalendarIdx] = useState(null)

  const has = (label) => selectedSplits.some(s => s.value === label)
  const showDate = has('Начисление')
  const showAgent = has('Контрагент')
  const showStatya = has('Статья')

  const totalPercent = rows.reduce((s, r) => s + (parseFloat(r.percent) || 0), 0)

  useEffect(() => {
    if (onChange) {
      onChange(open ? rows.filter((r) => r.value) : [])
    }
  }, [rows, open, onChange])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openCalendarIdx !== null && !event.target.closest('.date-cell-wrapper')) {
        setOpenCalendarIdx(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openCalendarIdx])

  const handleToggleSplit = () => {
    if (open) {
      setIsCancelModalOpen(true)
    } else {
      setOpen(true)
    }
  }

  const handleConfirmCancel = () => {
    dispatch({ type: 'CLEAR' })
    setOpen(false)
    setIsCancelModalOpen(false)
  }

  return (
    <div className="split-wrapper">
      <SplitAmountCancelModal
        isOpen={isCancelModalOpen}
        onCancel={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />

      <button
        type="button"
        className="split-title"
        onClick={handleToggleSplit}
      >
        {open ? 'Отменить разбиение' : 'Разбить сумму'}
      </button>

      {open && (
        <>
          <div className="split-select-wrap">
            <MultipleSelect value={selectedSplits} onChange={setSelectedSplits} />
          </div>

          {selectedSplits?.length > 0 && <div className="split-table-wrap">
            <table className="split-table">
              <thead className='split-thead'>
                <tr>
                  {showDate && (
                    <>
                      <th className="split-th col-date">
                        <span className="th-icon"><CalendarIcon /></span>
                        <strong>Дата начисления</strong>
                      </th>
                      <th className="split-th col-confirm">
                        <strong>Подтвердить</strong>
                      </th>
                    </>
                  )}
                  {showAgent && (
                    <th className="split-th col-agent">
                      <strong>Контрагент</strong>
                    </th>
                  )}
                  {showStatya && (
                    <th className="split-th col-statya">
                      <strong>Статья</strong>
                    </th>
                  )}
                  <th className="split-th col-value">
                    <span className="th-icon" onClick={() => dispatch({ type: 'DIVIDE_EQUAL', amount })} style={{ cursor: 'pointer' }}><MergeArrowsIcon /></span>
                    <strong>Сумма <span className="sort-arrow"><SortArrow /></span></strong>
                  </th>
                  <th className="split-th col-percent">
                    <span className="th-icon" onClick={() => dispatch({ type: 'DIVIDE_EQUAL', amount })} style={{ cursor: 'pointer' }}><MergeArrowsIcon /></span>
                    <strong>Доля</strong>
                  </th>
                  <th className="split-th col-remove" />
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="split-tr">
                    {showDate && (
                      <>
                        {/* Date cell */}
                        <td className="split-td col-date">
                          <div className="date-cell-wrapper">
                            <div className="date-cell" onClick={() => setOpenCalendarIdx(openCalendarIdx === i ? null : i)}>
                              <CalendarCellIcon />
                              <span className="date-value">{formatDateRu(row.calculationDate)}</span>
                            </div>
                            {openCalendarIdx === i && (
                              <div className="date-calendar-popover">
                                <CustomCalendar
                                  value={new Date(row.calculationDate)}
                                  onChange={(dateObj) => {
                                    let iso = ''
                                    if (dateObj?.format) {
                                      iso = dateObj.format("YYYY-MM-DD")
                                    } else {
                                      const d = dateObj?.toDate?.() ?? dateObj
                                      const offset = d.getTimezoneOffset()
                                      const adjusted = new Date(d.getTime() - (offset * 60 * 1000))
                                      iso = adjusted.toISOString().split('T')[0]
                                    }
                                    dispatch({ type: 'UPDATE', index: i, field: 'calculationDate', value: iso })
                                    setOpenCalendarIdx(null)
                                  }}
                                  format="DD MMM, YYYY"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        {/* Confirm checkbox */}
                        <td className="split-td col-confirm">
                          <OperationCheckbox
                            checked={row.isCalculationCommitted}
                            onChange={e => dispatch({ type: 'UPDATE', index: i, field: 'isCalculationCommitted', value: e.target.checked })}
                          />
                        </td>
                      </>
                    )}

                    {showAgent && (
                      <td className="split-td col-agent">
                        <div className="borderless-select" style={{ maxWidth: '180px' }}>
                          <GroupedSelect
                            data={counterAgents || []}
                            value={row.contrAgentId}
                            onChange={(value) => dispatch({ type: 'UPDATE', index: i, field: 'contrAgentId', value: value || '' })}
                            placeholder="Не выбран"
                            groupBy={true}
                            groupKey="group"
                            labelKey="label"
                            valueKey="guid"
                            className="grouped-select"
                          />
                        </div>
                      </td>
                    )}

                    {/* Статья */}
                    {showStatya && (
                      <td className="split-td col-statya">
                        <div className="borderless-select" style={{ maxWidth: '180px' }}>
                          <TreeSelect
                            data={chartOfAccountsOptions || []}
                            alwaysExpanded={true}
                            value={row.operationCategoryId}
                            onChange={value => dispatch({ type: 'UPDATE', index: i, field: 'operationCategoryId', value })}
                            placeholder='Выберите статью...'
                            className="TreeSelect"
                          />
                        </div>
                      </td>
                    )}

                    {/* Сумма */}
                    <td className="split-td col-value">
                      <div className="value-cell-wrapper">
                        {!row.isCalculationCommitted && <CreditIcon />}

                        <input
                          type="number"
                          className="value-input"
                          placeholder="0"
                          value={row.value}
                          onChange={e => {
                            const val = e.target.value;
                            dispatch({ type: 'UPDATE', index: i, field: 'value', value: val });
                            const numAmount = Number(String(amount).replace(/\s/g, ''));
                            if (numAmount > 0) {
                              const perc = ((Number(val) / numAmount) * 100).toFixed(2);
                              dispatch({ type: 'UPDATE', index: i, field: 'percent', value: String(perc) });
                            }
                          }}
                        />
                      </div>
                    </td>

                    {/* Доля */}
                    <td className="split-td col-percent">
                      <div className="percent-cell">
                        <input
                          type="number"
                          className="percent-input"
                          placeholder="0"
                          maxLength={5}
                          value={row.percent}
                          onChange={e => {
                            const perc = e.target.value;
                            dispatch({ type: 'UPDATE', index: i, field: 'percent', value: perc });
                            const numAmount = Number(String(amount).replace(/\s/g, ''));
                            if (numAmount > 0) {
                              const val = ((Number(perc) / 100) * numAmount).toFixed(2);
                              dispatch({ type: 'UPDATE', index: i, field: 'value', value: String(val) });
                            }
                          }}
                        />
                        <span className="percent-symbol">%</span>
                      </div>
                    </td>

                    {/* Remove row */}
                    <td className="split-td col-remove">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          className="remove-row-btn"
                          onClick={() => dispatch({ type: 'REMOVE', index: i })}
                          title="Удалить строку"
                        >×</button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Footer row */}
                <tr className="split-footer-row">
                  <td
                    colSpan={(showDate ? 2 : 0) + (showAgent ? 1 : 0) + (showStatya ? 1 : 0)}
                  >
                    <button
                      type="button"
                      className="add-row-btn"
                      onClick={() => dispatch({ type: 'ADD' })}
                    >
                      Добавить строку
                    </button>
                  </td>
                  <td className="footer-total">
                    <span className="total-label">Итого:</span>
                    <span className="total-value">{formatAmount(String(amount)) || '0'}</span>
                  </td>
                  <td className="footer-percent">
                    {totalPercent} %
                  </td>
                  {/* <td /> */}
                </tr>
              </tbody>
            </table>
          </div>}
        </>
      )}
    </div>
  )
}

export default SplitAmount
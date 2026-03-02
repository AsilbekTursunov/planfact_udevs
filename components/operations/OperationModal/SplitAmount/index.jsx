import React, { useReducer, useState } from 'react'
import './style.scss'
import MultipleSelect from '../../../shared/MultipleSelect'
import { CalendarCellIcon, CalendarIcon, MergeArrowsIcon, SelectArrow, SortArrow } from '../../../../constants/icons'
import { CheckIcon } from 'lucide-react'
import { formatAmount, formatDateRu } from '../../../../utils/helpers'

const today = new Date().toISOString().split('T')[0]

const emptyRow = () => ({
  calculationDate: today,
  isCommitted: true,
  contrAgentId: '',
  operationCategoryId: '',
  value: '',
  percent: '',
})

function rowsReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, emptyRow()]
    case 'REMOVE':
      return state.filter((_, i) => i !== action.index)
    case 'UPDATE':
      return state.map((row, i) =>
        i === action.index ? { ...row, [action.field]: action.value } : row
      )
    default:
      return state
  }
}





// ── Main component ──────────────────────────────────────────
const SplitAmount = ({ amount, counterAgents,
  chartOfAccountsOptions }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([
    { value: 'Начисление', label: 'Начисление' },
    { value: 'Контрагент', label: 'Контрагент' },
    { value: 'Статья', label: 'Статья' },
  ])
  const [rows, dispatch] = useReducer(rowsReducer, [emptyRow(), emptyRow()])

  const has = (label) => selected.some(s => s.value === label)
  const showDate = has('Начисление')
  const showAgent = has('Контрагент')
  const showStatya = has('Статья')

  const totalValue = rows.reduce((s, r) => s + (parseFloat(r.value) || 0), 0)
  const totalPercent = rows.reduce((s, r) => s + (parseFloat(r.percent) || 0), 0)

  // console.log('splitamount', counterAgents)
  console.log('splitamount', chartOfAccountsOptions)

  const groupedOptions = counterAgents?.reduce((acc, item) => {
    const group = item.group || 'Без группы'
    if (acc.filter(item => item.label === group).length === 0) {
      acc.push({ label: group, options: [] })
    }
    acc.filter(item => item.label === group)[0].options.push({ value: item.guid, label: item.label })
    return acc
  }, [])

  console.log('groupedOptions', groupedOptions)


  return (
    <div className="split-wrapper">
      <button
        type="button"
        className="split-title"
        onClick={() => setOpen(p => !p)}
      >
        {open ? 'Отменить разбиение' : 'Разбить сумму'}
      </button>

      {open && (
        <>
          <div className="split-select-wrap">
            <MultipleSelect value={selected} onChange={setSelected} />
          </div>

          <div className="split-table-wrap">
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
                    <span className="th-icon"><MergeArrowsIcon /></span>
                    <strong>Сумма <span className="sort-arrow"><SortArrow /></span></strong>
                  </th>
                  <th className="split-th col-percent">
                    <span className="th-icon"><MergeArrowsIcon /></span>
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
                          <label className="date-cell">
                            <CalendarCellIcon />
                            <span className="date-value">{formatDateRu(row.calculationDate)}</span>
                            <input
                              type="date"
                              className="date-hidden"
                              value={row.calculationDate}
                              onChange={e => dispatch({ type: 'UPDATE', index: i, field: 'calculationDate', value: e.target.value })}
                            />
                          </label>
                        </td>
                        {/* Confirm checkbox */}
                        <td className="split-td col-confirm">
                          <label className="checkbox-cell">
                            <input
                              type="checkbox"
                              className="checkbox-hidden"
                              checked={row.isCommitted}
                              onChange={e => dispatch({ type: 'UPDATE', index: i, field: 'isCommitted', value: e.target.checked })}
                            />
                            <span className={`checkbox-box ${row.isCommitted ? 'checked' : ''}`}>
                              {row.isCommitted && <CheckIcon />}
                            </span>
                          </label>
                        </td>
                      </>
                    )}

                    {/* Контрагент */}
                    {showAgent && (
                      <td className="split-td col-agent">
                        <div className="borderless-select">
                          <select
                            value={row.contrAgentId}
                            onChange={e => dispatch({ type: 'UPDATE', index: i, field: 'contrAgentId', value: e.target.value })}
                            className="select-input"
                          >
                            <option value="">Не выбран</option>
                          </select>
                          <span className="select-arrow"><SelectArrow /></span>
                        </div>
                      </td>
                    )}

                    {/* Статья */}
                    {showStatya && (
                      <td className="split-td col-statya">
                        <div className="borderless-select">
                          <select
                            value={row.operationCategoryId}
                            onChange={e => dispatch({ type: 'UPDATE', index: i, field: 'operationCategoryId', value: e.target.value })}
                            className="select-input"
                          >
                            <option value="">Нераспределенный доход</option>
                          </select>
                          <span className="select-arrow"><SelectArrow /></span>
                        </div>
                      </td>
                    )}

                    {/* Сумма */}
                    <td className="split-td col-value">
                      <input
                        type="text"
                        className="value-input"
                        placeholder="0"
                        value={row.value}
                        onChange={e => dispatch({ type: 'UPDATE', index: i, field: 'value', value: e.target.value })}
                      />
                    </td>

                    {/* Доля */}
                    <td className="split-td col-percent">
                      <div className="percent-cell">
                        <input
                          type="text"
                          className="percent-input"
                          placeholder="0"
                          maxLength={5}
                          value={row.percent}
                          onChange={e => dispatch({ type: 'UPDATE', index: i, field: 'percent', value: e.target.value })}
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
                    colSpan={1 + (showDate ? 1 : 0) + (showAgent ? 1 : 0) + (showStatya ? 1 : 0)}
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
                    <span className="total-value">{formatAmount(String(totalValue)) || '0'}</span>
                  </td>
                  <td className="footer-percent">
                    {totalPercent} %
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default SplitAmount
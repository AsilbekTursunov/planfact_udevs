import React from 'react'
import ReactSelect from 'react-select'

const PRIMARY_DARK = '#0F51B9'

const defaultOptions = [
  { value: 'Начисление', label: 'Начисление' },
  { value: 'Контрагент', label: 'Контрагент' },
  { value: 'Статья', label: 'Статья' }, 
]

// Custom Option with checkmark on the right
const Option = (props) => {
  const { data, isSelected, innerRef, innerProps } = props
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        cursor: 'pointer',
        fontSize: 14,
        color: '#0f172a',
        backgroundColor: props.isFocused ? '#f0f4f8' : 'white',
        transition: 'background 0.15s',
      }}
    >
      <span>{data.label}</span>
      {isSelected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8L6.5 11.5L13 5"
            stroke={PRIMARY_DARK}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}

// Custom MultiValue chip
const MultiValue = ({ data, removeProps }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#f1f5f9',
      border: '1px solid #e2e8f0',
      borderRadius: 6,
      padding: '2px 4px 2px 8px',
      fontSize: 13,
      color: '#334155',
      margin: '2px 3px',
    }}
  >
    <span>{data.label}</span>
    <button
      {...removeProps}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 2px',
        color: '#94a3b8',
        lineHeight: 1,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      ×
    </button>
  </div>
)

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isFocused ? PRIMARY_DARK : '#e2e8f0',
    boxShadow: state.isFocused ? `0 0 0 1px ${PRIMARY_DARK}` : 'none',
    '&:hover': { borderColor: PRIMARY_DARK },
    flexWrap: 'wrap',
    cursor: 'pointer',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
    zIndex: 100,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px 0',
  }),
  option: () => ({}), // handled by custom Option component
  multiValue: () => ({}),       // handled by custom MultiValue
  multiValueLabel: () => ({}),
  multiValueRemove: () => ({}),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: '#94a3b8',
    transition: 'transform 0.2s',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0)',
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#94a3b8',
    cursor: 'pointer',
    '&:hover': { color: '#64748b' },
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: 14,
    color: '#94a3b8',
  }),
}

const MultipleSelect = ({
  options = defaultOptions,
  value,
  onChange,
  placeholder = 'Выберите...',
  defaultValue,
}) => {
  // If no controlled value provided, pre-select first 3
  const [internal, setInternal] = React.useState(
    defaultValue ?? options.slice(0, 3)
  )

  const isControlled = value !== undefined
  const selected = isControlled ? value : internal

  const handleChange = (newValue) => {
    if (!isControlled) setInternal(newValue ?? [])
    onChange?.(newValue ?? [])
  }

  return (
    <ReactSelect
      isMulti
      options={options}
      value={selected}
      onChange={handleChange}
      placeholder={placeholder}
      styles={customStyles}
      components={{ Option, MultiValue }}
      hideSelectedOptions={false}
      closeMenuOnSelect={false}
      isClearable
    />
  )
}

export default MultipleSelect
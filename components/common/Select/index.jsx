import ReactSelect from 'react-select'

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    height: '36px',
    borderRadius: '8px',
    border: `1px solid ${state.isFocused ? '#d0d5dd' : '#e5e7eb'}`,
    backgroundColor: 'white',
    padding: '0 12px',
    boxShadow: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#9ca3af',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: 0,
    height: '36px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    fontSize: '13px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '36px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0 0 0 4px',
    color: '#9ca3af',
    '&:hover': {
      color: '#6b7280',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0 4px',
    color: '#9ca3af',
    '&:hover': {
      color: '#6b7280',
    },
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '13px',
    margin: 0,
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: '13px',
    color: '#0f172a',
    margin: 0,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    zIndex: 50,
    marginTop: '4px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '200px',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '13px',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#307FE2'
      : state.isFocused
        ? '#f3f4f6'
        : 'transparent',
    color: state.isSelected ? 'white' : '#0f172a',
    '&:active': {
      backgroundColor: state.isSelected ? '#307FE2' : '#e5e7eb',
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: '13px',
    color: '#9ca3af',
  }),
}

const Select = ({ styles: userStyles, instanceId, ...props }) => {
  return (
    <ReactSelect
      instanceId={instanceId}
      styles={{ ...customStyles, ...userStyles }}
      {...props}
    />
  )
}

export default Select
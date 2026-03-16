const CustomRadio = ({ checked, ...props }) => {
  return (
    <div>
      <input
        type="radio"
        checked={checked}
        className='hidden'
        {...props}
      />
      <div className={`w-4 h-4 rounded-full flex items-center justify-center border border-gray-300 ${checked ? 'border-primary' : ''}`}>
        {checked && <div className='w-2 h-2 rounded-full bg-primary'></div>}
      </div>
    </div>
  )
}

export default CustomRadio
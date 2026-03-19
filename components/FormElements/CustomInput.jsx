import React from 'react'

const CustomInput = ({ leftIcon, rightIcon, wrapperClassName, inputClassName, leftIconClick, rightIconClick, ...props }) => {
  return (
    <div className={`flex items-center text-sm bg-white h-12 border pl-2 rounded-md border-gray-500/30 w-full max-w-md ${wrapperClassName}`}>
      {leftIcon && <div className="left-icon" onClick={leftIconClick}>{leftIcon}</div>}
      <input {...props} className={`w-full h-full outline-none ${inputClassName}`} />
      {rightIcon && <div className="right-icon" onClick={rightIconClick}>{rightIcon}</div>}
    </div>
  )
}

export default CustomInput
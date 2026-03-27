import React, { forwardRef } from 'react'
import { cn } from '@/app/lib/utils'

const Input = forwardRef(({
  className,
  error,
  type = 'text',
  action = 'default',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className="relative flex items-center w-full">
      {leftIcon && (
        <span className="absolute left-3 flex items-center justify-center text-gray-400 pointer-events-none z-10">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full px-3 py-1.5 text-[13px] text-slate-900 border border-gray-200 rounded-md bg-white h-9 transition-all cursor-text",
          "placeholder:text-gray-400 placeholder:opacity-100",
          "focus:outline-none focus:border-gray-400",
          "disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
          error && "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500",
          action === 'filter' && "bg-slate-50",
          leftIcon && "pl-9",
          rightIcon && "pr-9",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 flex items-center justify-center text-gray-400 pointer-events-none z-10">
          {rightIcon}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input

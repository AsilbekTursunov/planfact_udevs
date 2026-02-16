import React, { forwardRef } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'

const Input = forwardRef(({ 
  className, 
  error, 
  type = 'text',
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        styles.input,
        error && styles.error,
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input

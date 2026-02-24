import React, { forwardRef } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'

const Input = forwardRef(({
  className,
  error,
  type = 'text',
  action = 'default',
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        styles.input,
        error && styles.error,
        action === 'filter' && styles.filter,
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input

import React, { forwardRef } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'

const Input = forwardRef(({
  className,
  error,
  type = 'text',
  action = 'default',
  leftIcon,
  ...props
}, ref) => {
  return (
    <>
      <span className={styles.leftIcon}>{leftIcon}</span>
      <input
        ref={ref}
        type={type}
        className={cn(
          styles.input,
          error && styles.error,
          action === 'filter' && styles.filter,
          leftIcon && styles.icon,
          className
        )}
        {...props}
      />
    </>
  )
})

Input.displayName = 'Input'

export default Input

import React, { forwardRef } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'

const TextArea = forwardRef(({ 
  className, 
  error, 
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        styles.textarea,
        error && styles.error,
        className
      )}
      {...props}
    />
  )
})

TextArea.displayName = 'TextArea'

export default TextArea
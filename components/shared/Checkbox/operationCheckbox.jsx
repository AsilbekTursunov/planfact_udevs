import React from 'react'
import { cn } from '@/app/lib/utils'
import styles from './operationCheckbox.module.scss'
import { LuCheck } from 'react-icons/lu'

const OperationCheckbox = ({ checked, onChange, className, ...props }) => {
  return (
    <label className={cn(styles.checkboxContainer, className)}>
      <input
        type='checkbox'
        className={styles.hiddenInput}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <div className={styles.customCheckbox}>
        {checked && <LuCheck className={styles.checkmark} strokeWidth={2} />}
      </div>
      {props.label && <span className={styles.label}>{props.label}</span>}
    </label>
  )
}

export default OperationCheckbox

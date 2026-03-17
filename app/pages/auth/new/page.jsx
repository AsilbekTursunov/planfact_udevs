// "use client"
// import React, { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { cn } from '@/app/lib/utils'
// import { Eye, EyeOff } from 'lucide-react'
// import { AuthLogo } from '@/constants/icons'
// import styles from '../styles.module.scss'
// import Input from '@/components/shared/Input'
// import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
// import Loader from '@/components/shared/Loader'

// export default function LoginPage() {
//   const router = useRouter()
//   const [fromType, setFromType] = useState('login')



//   return (
//     <div className={styles.loginPage}>
//       <div className={styles.logoContainer}>
//         <AuthLogo color="#ffffff" width="114" height="27" />
//       </div>
//       {/* Login Card */}
//       <div className={styles.cardWrapper}>
//         <div className={styles.card}>

//           {/* Logo/Title */}
//           <div className={styles.cardLogo}>
//             <AuthLogo color="#000000" width="150" height="36" />
//           </div>

//           <h1 className={styles.cardTitle}>
//             {fromType === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
//           </h1>

//           {/* Form */}
//           <form className={styles.form}>
//             {fromType === 'register' && (
//               <>

//               </>
//             )}

//             {/* Email (Only on login) */}
//             {fromType === 'login' && (
//               <>

//               </>
//             )}

//             {/* Branch Selector (Only on login) */}
//             {/* {fromType === 'login' && (
//               <div className={styles.inputGroup}>
//                 <div className={styles.selectWrapper} ref={branchDropdownRef}>
//                   <div
//                     className={cn(
//                       styles.inputField,
//                       styles.selectField,
//                       branchDropdownOpen && styles.focused,
//                       fieldErrors.branch && styles.error
//                     )}
//                     onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
//                   >
//                     <span className={selectedBranch ? styles.selectedText : styles.placeholderText}>
//                       {selectedBranch
//                         ? mockBranches.find(b => b.id === selectedBranch)?.name
//                         : 'Выберите филиал'}
//                     </span>
//                     <div className={styles.selectIcons}>
//                       {selectedBranch && (
//                         <button
//                           type="button"
//                           className={styles.clearButton}
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             setSelectedBranch('')
//                             setFieldErrors({ ...fieldErrors, branch: '' })
//                           }}
//                         >
//                           <X size={16} />
//                         </button>
//                       )}
//                       <ChevronDown
//                         size={16}
//                         className={cn(styles.chevronIcon, branchDropdownOpen && styles.chevronOpen)}
//                       />
//                     </div>
//                   </div>
//                   {branchDropdownOpen && (
//                     <ul className={styles.selectDropdown}>
//                       {mockBranches.map(branch => (
//                         <li
//                           key={branch.id}
//                           className={cn(
//                             styles.selectOption,
//                             selectedBranch === branch.id && styles.selectOptionActive
//                           )}
//                           onClick={() => {
//                             setSelectedBranch(branch.id)
//                             setBranchDropdownOpen(false)
//                             setFieldErrors({ ...fieldErrors, branch: '' })
//                           }}
//                         >
//                           {branch.name}
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </div>
//                 {fieldErrors.branch && (
//                   <div className={styles.fieldError}>{fieldErrors.branch}</div>
//                 )}
//               </div>
//             )} */}

//             {/* Confirm Password (Only on register) */}
//             {fromType === 'register' && (
//               <div className={styles.inputGroup}>
//                 <div className={styles.inputWrapper}>
//                   <Input
//                     type={showConfirmPassword ? "text" : "password"}
//                     value={confirmPassword}
//                     onChange={(e) => handlePasswordChange(e, 'confirmPassword')}
//                     onFocus={() => setFocusedField('confirmPassword')}
//                     onBlur={() => setFocusedField(null)}
//                     className={cn(
//                       styles.inputField,
//                       styles.passwordField,
//                       focusedField === 'confirmPassword' && styles.focused,
//                       fieldErrors.confirmPassword && styles.error
//                     )}
//                     placeholder="Подтвердить пароль"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className={styles.eyeButton}
//                   >
//                     {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {fieldErrors.confirmPassword && (
//                   <div className={styles.fieldError}>{fieldErrors.confirmPassword}</div>
//                 )}
//               </div>
//             )}

//             {/* Checkbox (Only on register) */}
//             {fromType === 'register' && (
//               <div className={styles.checkboxGroup}>
//                 <OperationCheckbox
//                   id="terms"
//                   checked={formData.checked}
//                   onChange={() => {
//                     setFormData({ ...formData, checked: !formData.checked })
//                     setFieldErrors({ ...fieldErrors, terms: '' })
//                   }}
//                 />
//                 <label htmlFor="terms" className={styles.checkboxLabel}>
//                   Я <span className={styles.highlight}>соглашаюсь</span> на получение информационных и справочных материалов
//                 </label>
//               </div>
//             )}
//             {fieldErrors.terms && (
//               <div className={styles.fieldError}>{fieldErrors.terms}</div>
//             )}

//             {/* Error Message */}
//             {error && (
//               <div className={styles.errorMessage}>
//                 {error}
//               </div>
//             )}

//             {/* Action Links */}
//             <div className={styles.actionLinks}>
//               <span>
//                 {fromType === 'login' ? 'Нет учётной записи? ' : 'Есть учётная запись? '}
//                 <span
//                   onClick={toggleFormType}
//                   className={styles.actionToggle}
//                 >
//                   {fromType === 'login' ? 'Зарегистрироваться' : 'Войти'}
//                 </span>
//               </span>
//             </div>

//             {/* Submit Button */}
//             <div className={styles.submitWrapper}>
//               <button
//                 type="submit"
//                 disabled={fromType === 'login' ? loginMutation.isPending : isRegistering}
//                 className={cn(
//                   styles.submitButton,
//                   fromType === 'login' && styles.loginButton
//                 )}
//               >
//                 {fromType === 'login'
//                   ? (loginMutation.isPending ? (<Loader />) : 'Войти')
//                   : (isRegistering ? (<Loader />) : 'Зарегистрироваться')}
//               </button>
//             </div>

//             <div className={styles.termsText}>
//               Нажав кнопку «{fromType === 'login' ? 'Войти' : 'Зарегистрироваться'}», вы подтверждаете{' '}
//               <a href="#">Политика конфеденциальности</a>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

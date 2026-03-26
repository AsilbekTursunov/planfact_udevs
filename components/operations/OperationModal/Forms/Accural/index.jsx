'use client'
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import Input from '@/components/shared/Input'
import TextArea from '@/components/shared/TextArea'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import SelectMyAccounts from '../../../../ReadyComponents/SelectMyAccounts'
import SinglSelectStatiya from '../../../../ReadyComponents/SingleSelectStatiya'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/app/lib/utils'

const AccuralForm = ({ onCancel, onSuccess }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      accuralDate: formatDate(new Date()),
      confirmAccrual: true,
      legalEntity: null,
      chartOfAccountWriteOff: null,
      summa: 0,
      canAllowOpiu: false,
      chartOfAccountEnrollment: null,
      comment: ''
    }
  })

  const onSubmit = (data) => {
    console.log('Accrual Form Data:', data)
    onSuccess?.(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col h-full overflow-hidden text-slate-900">
      <div className="flex-1 overflow-y-auto px-1 py-6 flex flex-col gap-5">
        {/* SECTION: ОТКУДА */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase whitespace-nowrap tracking-wider">ОТКУДА</h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Дата начисления */}
          <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Дата начисления</label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="accuralDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Выберите дату"
                    className={cn("w-[230px]", errors.accuralDate && "border-red-500")}
                  />
                )}
              />
            </div>
          </div>

          {/* Подтвердить начисление */}
          <div className="flex items-center gap-4">
            <div className="w-[150px]"></div>
            <Controller
              name="confirmAccrual"
              control={control}
              render={({ field }) => (
                <OperationCheckbox
                  checked={field.value}
                  label="Подтвердить начисление"
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>

          {/* Юрлицо */}
          <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Юрлицо <span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="legalEntity"
                control={control}
                rules={{ required: 'Выберите юрлицо' }}
                render={({ field }) => (
                  <SelectMyAccounts
                    value={field.value ? [field.value] : []}
                    onChange={(val) => field.onChange(val)}
                    multi={false}
                    type="show"
                    placeholder="Выберите юрлицо..."
                    className="bg-white border rounded-md"
                  />
                )}
              />
              {errors.legalEntity && <span className="text-xs text-red-500">{errors.legalEntity.message}</span>}
            </div>
          </div>

          {/* Статья списания */}
          <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Статья списания <span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="chartOfAccountWriteOff"
                control={control}
                rules={{ required: 'Выберите статью списания' }}
                render={({ field }) => (
                  <SinglSelectStatiya
                    selectedValue={field.value}
                    setSelectedValue={field.onChange}
                    placeholder="Выберите статью списания..."
                    className="flex-1 bg-white border rounded-md"
                    type="Расходы"
                  />
                )}
              />
              {errors.chartOfAccountWriteOff && <span className="text-xs text-red-500">{errors.chartOfAccountWriteOff.message}</span>}
            </div>
          </div>

          {/* Сумма */}
          <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Сумма</label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <div className="flex items-center gap-3">
                <Controller
                  name="summa"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="0"
                      className={cn("w-[230px]", errors.summa && "border-red-500")}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Учитывать в ОПиУ кассовым методом */}
          <div className="flex items-center gap-4">
            <div className="w-[150px]"></div>
            <Controller
              name="canAllowOpiu"
              control={control}
              render={({ field }) => (
                <OperationCheckbox
                  checked={field.value}
                  label="Учитывать в ОПиУ кассовым методом"
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>
        </div>

        {/* SECTION: КУДА */}
        <div className="flex flex-col gap-5 mt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase whitespace-nowrap tracking-wider">КУДА</h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Статья зачисления */}
          <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Статья зачисления <span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="chartOfAccountEnrollment"
                control={control}
                rules={{ required: 'Выберите статью зачисления' }}
                render={({ field }) => (
                  <SinglSelectStatiya
                    selectedValue={field.value}
                    setSelectedValue={field.onChange}
                    placeholder="Выберите статью зачисления..."
                    className="flex-1 bg-white border rounded-md"
                    type="Доходы"
                  />
                )}
              />
              {errors.chartOfAccountEnrollment && <span className="text-xs text-red-500">{errors.chartOfAccountEnrollment.message}</span>}
            </div>
          </div>

          {/* Назначение */}
          <div className="flex items-start gap-4">
            <label className="w-[150px] text-[13px] pt-2">Назначение <span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="comment"
                control={control}
                rules={{ required: 'Введите назначение' }}
                render={({ field }) => (
                  <TextArea
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Назначение платежа"
                    rows={3}
                    className={cn("border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F51B9] focus:border-[#0F51B9]", errors.comment && "border-red-500")}
                  />
                )}
              />
              {errors.comment && <span className="text-xs text-red-500">{errors.comment.message}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex border-t justify-end gap-2 p-4 pt-4 mt-auto bg-white">
        <button type="button" onClick={onCancel} className="px-5 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded transition-colors">Отмена</button>
        <button type="submit" className="px-5 py-2 text-[13px] font-medium text-white bg-[#0F51B9] hover:bg-[#0d47a1] rounded transition-colors shadow-sm">Сохранить</button>
      </div>
    </form>
  )
}

export default AccuralForm
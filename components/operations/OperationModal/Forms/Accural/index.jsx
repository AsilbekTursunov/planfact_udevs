'use client'
import { useForm, Controller, } from 'react-hook-form'
import { DatePicker } from '@/components/common/DatePicker/DatePicker'
import Input from '@/components/shared/Input'
import TextArea from '@/components/shared/TextArea'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import SelectMyAccounts from '../../../../ReadyComponents/SelectMyAccounts'
import SinglSelectStatiya from '../../../../ReadyComponents/SingleSelectStatiya'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/app/lib/utils'
import { useState } from 'react'
import SingleZdelka from '../../../../ReadyComponents/SingleZdelka'
import { useUcodeRequestMutation } from '../../../../../hooks/useDashboard'

const AccuralForm = ({ onCancel, onSuccess }) => {
  const [isFromRasxodChild, setIsFromRasxodChild] = useState(false)
  const [isToRasxodChild, setIsToRasxodChild] = useState(false)
  const { getValues, control, handleSubmit, formState: { errors, } } = useForm({
    defaultValues: {
      accuralDate: formatDate(new Date()),
      confirmAccrual: true,
      legalEntity: '',
      chartOfAccountWriteOff: null,
      summa: 0,
      canAllowOpiu: true,
      chartOfAccountEnrollment: null,
      sellingDealId: '',
      comment: ''
    }
  })

  const { mutateAsync: createAccural, isPending } = useUcodeRequestMutation({
    mutationSetting: {}
  })

  // tip = Начисление

  const onSubmit = async (data) => {
    const requestData = {
      tip: ['Начисление'],
      data_operatsii: data.accuralDate,
      payment_confirm: data.confirmAccrual,
      my_accounts_id: data.legalEntity,
      chartOfAccountWriteOff: data.chartOfAccountWriteOff,
      summa: data.summa,
      canAllowOpiu: data.canAllowOpiu,
      chartOfAccountEnrollment: data.chartOfAccountEnrollment,
      sellingDealId: data.sellingDealId,
      opisanie: data.comment
    }
    try {
      await createAccural(requestData)
      onSuccess?.(data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col h-full overflow-hidden text-slate-900">
      <div className="flex-1 overflow-y-auto  p-4 flex flex-col gap-5">
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
            <div className="flex-1 flex  gap-1 max-w-[600px]">
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
              {/* Подтвердить начисление */}
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
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    multi={false}
                    type="show"
                    placeholder="Выберите юрлицо..."
                    className="bg-white border rounded-md"
                    hasError={errors.legalEntity}
                  />
                )}
              />
              {errors.legalEntity && <span className="text-xs text-red-500">{errors.legalEntity.message}</span>}
            </div>
          </div>

          {/* Статья списания */}
          <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Статья по дебету <span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="chartOfAccountWriteOff"
                control={control}
                rules={{ required: 'Выберите статью по дебету' }}
                render={({ field }) => (
                  <SinglSelectStatiya
                    selectedValue={field.value}
                    setSelectedValue={field.onChange}
                    placeholder="Выберите статью по дебету..."
                    className="flex-1 bg-white border rounded-md"
                    type="Доходы"
                    parent="Расходы"
                    returnIsChild={setIsFromRasxodChild}
                    hasError={errors.chartOfAccountWriteOff}
                  />
                )}
              />
              {errors.chartOfAccountWriteOff && <span className="text-xs text-red-500">{errors.chartOfAccountWriteOff.message}</span>}
            </div>
          </div>

          {isFromRasxodChild && <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Сделка продажи</label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="sellingDealId"
                control={control}
                render={({ field }) => (
                  <SingleZdelka
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Выберите сделку продажи..."
                    className="flex-1 bg-white border rounded-md"
                    withSearch={false}
                  />
                )}
              />
            </div>
          </div>}

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

        {/* SECTION: ------------- КУДА ---------------- */}
        <div className="flex flex-col gap-5 mt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase whitespace-nowrap tracking-wider">КУДА</h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Статья зачисления */}
          <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Статья по кредиту <span className="text-red-500 ml-0.5">*</span></label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="chartOfAccountEnrollment"
                control={control}
                rules={{ required: 'Выберите статью по кредиту' }}
                render={({ field }) => (
                  <SinglSelectStatiya
                    selectedValue={field.value}
                    setSelectedValue={field.onChange}
                    placeholder="Выберите статью по кредиту..."
                    className="flex-1 bg-white border rounded-md"
                    type=""
                    parent={["Расходы", "Доходы"]}
                    returnIsChild={setIsToRasxodChild}
                    hiddenValue={getValues("chartOfAccountWriteOff")}
                    hasError={errors.chartOfAccountEnrollment}
                  />
                )}
              />
              {errors.chartOfAccountEnrollment && <span className="text-xs text-red-500">{errors.chartOfAccountEnrollment.message}</span>}
            </div>
          </div>
          {isToRasxodChild && <div className="flex items-center gap-4">
            <label className="w-[150px] text-[13px]">Сделка продажи</label>
            <div className="flex-1 flex flex-col gap-1 max-w-[600px]">
              <Controller
                name="sellingDealId"
                control={control}
                render={({ field }) => (
                  <SingleZdelka
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Выберите сделку продажи..."
                    className="flex-1 bg-white border rounded-md"
                    withSearch={false}
                  />
                )}
              />
            </div>
          </div>}

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
                    className={cn("border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0F51B9] focus:border-[#0F51B9]")}
                    hasError={!!errors.comment}
                  />
                )}
              />
              {errors.comment && <span className="text-xs text-red-500">{errors.comment.message}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex border-t justify-end gap-2 p-3 pt-3 mt-auto bg-white">
        <button type="button" onClick={onCancel} className="secondary-btn py-2!">Отмена</button>
        <button type="submit" className="primary-btn py-2!">Сохранить</button>
      </div>
    </form>
  )
}

export default AccuralForm
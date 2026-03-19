'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from '@/components/shared/Input';
import SingleSelect from '@/components/shared/Selects/SingleSelect';
import CustomDatePicker from '@/components/shared/DatePicker';

const CreateStudentModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    contractDate: '',
    guardianName: '',
    branchName: '',
    guardianType: '',
    academicYear: '',
    phone1: '',
    studentName: '',
    phone2: '',
    passport: '',
    pinf: '',
    issuedBy: '',
    tariffName: '',
    birthDate: '',
    validFrom: '',
    gender: '',
    validTo: '',
    className: '',
    clientType: '',
    language: '',
    status: '',
    address: '',
    passiveDate: ''
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={onClose}>
      <div className="bg-white rounded-xl w-11/12 max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-sans">Новая продажа</h2>
          <button className="text-gray-400 hover:text-gray-600 transition-colors" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 p-6 overflow-y-auto w-full">
          <form className="grid grid-cols-3 gap-3">
            
            {/* Row 1 */}
            <div className="flex flex-col gap-1.5 focus-within:text-blue-600">
              <label className="text-xs font-medium text-gray-700">Дата договора</label>
              <CustomDatePicker
                value={formData.contractDate}
                onChange={val => handleChange('contractDate', val)}
                placeholder="Выберите дату"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Ф.И.О. опекуна</label>
              <Input
                placeholder="Введите Ф.И.О. опекуна"
                value={formData.guardianName}
                onChange={e => handleChange('guardianName', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Название филиала</label>
              <SingleSelect
                placeholder="Введите название филиала"
                value={formData.branchName}
                onChange={val => handleChange('branchName', val)}
                data={[]}
                className='bg-white'
                withSearch={false}
              />
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Выберите тип опекуна</label>
              <SingleSelect
                placeholder="Выберите тип опекуна"
                value={formData.guardianType}
                onChange={val => handleChange('guardianType', val)}
                data={[]}
                className='bg-white'
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Выберите учебный год</label>
              <SingleSelect
                placeholder="Выберите учебный год"
                value={formData.academicYear}
                onChange={val => handleChange('academicYear', val)}
                data={[]}
                className='bg-white'
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Телефон 1</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-md font-sans">+998</span>
                <input 
                  type="text" 
                  placeholder="Введите номер"
                  value={formData.phone1}
                  onChange={e => handleChange('phone1', e.target.value)}
                  className="w-full h-[36px] px-3 border border-gray-200 rounded-r-md outline-none text-sm focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Ф.И.О. ученика</label>
              <Input
                placeholder="Введите Ф.И.О. ученика"
                value={formData.studentName}
                onChange={e => handleChange('studentName', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Телефон 2</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm rounded-l-md font-sans">+998</span>
                <input 
                  type="text" 
                  placeholder="Введите номер"
                  value={formData.phone2}
                  onChange={e => handleChange('phone2', e.target.value)}
                  className="w-full h-[36px] px-3 border border-gray-200 rounded-r-md outline-none text-sm focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Серия и номер паспорта</label>
              <Input
                placeholder="Введите серию и номер паспорта"
                value={formData.passport}
                onChange={e => handleChange('passport', e.target.value)}
              />
            </div>

            {/* Row 4 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">ПИНФЛ опекуна</label>
              <Input
                placeholder="Введите ПИНФЛ опекуна"
                value={formData.pinf}
                onChange={e => handleChange('pinf', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Место выдачи</label>
              <Input
                placeholder="Введите место выдачи"
                value={formData.issuedBy}
                onChange={e => handleChange('issuedBy', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Название тарифа</label>
              <Input
                placeholder="Введите название тарифа"
                value={formData.tariffName}
                onChange={e => handleChange('tariffName', e.target.value)}
              />
            </div>

            {/* Row 5 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Дата рождения ученика</label>
              <CustomDatePicker
                value={formData.birthDate}
                onChange={val => handleChange('birthDate', val)}
                placeholder="Выберите дату"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Срок действия договора от</label>
              <CustomDatePicker
                value={formData.validFrom}
                onChange={val => handleChange('validFrom', val)}
                placeholder="Выберите дату"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Выберите пол</label>
              <SingleSelect
                placeholder="Выберите пол"
                value={formData.gender}
                onChange={val => handleChange('gender', val)}
                data={[{ value: 'm', label: 'Мужской' }, { value: 'f', label: 'Женский' }]}
                className='bg-white'
              />
            </div>

            {/* Row 6 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Срок действия договора до</label>
              <CustomDatePicker
                value={formData.validTo}
                onChange={val => handleChange('validTo', val)}
                placeholder="Выберите дату"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Введите класс</label>
              <SingleSelect
                placeholder="Введите класс"
                value={formData.className}
                onChange={val => handleChange('className', val)}
                data={[]}
                className='bg-white'
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Тип клиента</label>
              <SingleSelect
                placeholder="Тип клиента"
                value={formData.clientType}
                onChange={val => handleChange('clientType', val)}
                data={[]}
                className='bg-white'
              />
            </div>

            {/* Row 7 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Выберите язык</label>
              <SingleSelect
                placeholder="Выберите язык"
                value={formData.language}
                onChange={val => handleChange('language', val)}
                data={[]}
                className='bg-white'
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Состояние</label>
              <SingleSelect
                placeholder="Состояние"
                value={formData.status}
                onChange={val => handleChange('status', val)}
                data={[]}
                className='bg-white'
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Адрес</label>
              <Input
                placeholder="Адрес"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>

            {/* Row 8 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-700">Пассивная дата</label>
              <CustomDatePicker
                value={formData.passiveDate}
                onChange={val => handleChange('passiveDate', val)}
                placeholder="Выберите дату"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button type="button" className="px-5 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors" onClick={onClose}>
            Отменить
          </button>
          <button type="button" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentModal;
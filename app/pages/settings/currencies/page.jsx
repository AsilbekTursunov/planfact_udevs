'use client'

import React, { useState } from 'react'
import { data as currencyData } from '../../../../constants/globalCurrency'
import { formatDate } from '../../../../utils/formatDate'
import moment from 'moment/moment'

// Generate stable placeholder rates at the module level.
// This ensures the component remains pure during render.
const STABLE_RATES = currencyData.reduce((acc, curr) => {
  acc[curr.guid] = (Math.random() * 100).toFixed(4)
  return acc
}, {})


const CurrenciesPage = () => {
  const [activeTab, setActiveTab] = useState('fiat') // 'fiat' or 'crypto'

  const currentDate = new Date()



  return (
    <div className="flex-1  bg-gray-50 overflow-y-auto relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 p-6 sticky top-0 z-10 bg-gray-50">
          Курсы валют по ЦБ (обновлено {moment(currentDate).format('DD.MM.YYYY')})
        </h1>

        <div className="flex gap-2 mb-6">
          {/* <button
            onClick={() => setActiveTab('fiat')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
              activeTab === 'fiat'
                ? 'bg-white border-cyan-500 text-cyan-600 shadow-sm'
                : 'bg-white border-transparent text-gray-500 hover:bg-gray-100'
            }`}
          >
            Обычные валюты по ЦБ
          </button>  */}
        </div>

        <div className="bg-gray-50 text-xs overflow-hidden p-6">
          <div className="w-full text-left border-collapse">
            <div className="bg-neutral-100 flex border-b border-gray-200">
              <div className="px-6 py-3 w-64 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Название валюты
              </div>
              <div className="px-6 py-3 w-36 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Обозначение
              </div>
              <div className="px-6 py-3 w-36 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Символ
              </div>
              <div className="px-6 py-3 w-36 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Курс
              </div>
            </div>
            {currencyData.map((currency) => (
              <div key={currency.guid} className="hover:bg-gray-50 bg-white text-gray-900 text-xss! flex border-b cursor-pointer transition-colors">
                <div className="px-6 py-4 w-64 ">
                  {currency.nazvanie}
                </div>
                <div className="px-6 py-4 w-36 ">
                  {currency.kod}
                </div>
                <div className="px-6 py-4 w-36  ">
                  {currency.icon}
                </div>
                <div className="px-6 py-4 w-36  tabular-nums">
                  {STABLE_RATES[currency.guid]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrenciesPage
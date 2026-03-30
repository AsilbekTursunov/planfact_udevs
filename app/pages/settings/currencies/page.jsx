'use client'

import React, { useState } from 'react'
import { data as currencyData } from '../../../../constants/globalCurrency'
import { formatDate } from '../../../../utils/formatDate'

// Generate stable placeholder rates at the module level.
// This ensures the component remains pure during render.
const STABLE_RATES = currencyData.reduce((acc, curr) => {
  acc[curr.guid] = (Math.random() * 100).toFixed(4)
  return acc
}, {})


const CurrenciesPage = () => {
  const [activeTab, setActiveTab] = useState('fiat') // 'fiat' or 'crypto'

  const currentDate = formatDate(new Date())



  return (
    <div className="flex-1 p-6 bg-gray-50 overflow-y-auto relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Курсы валют по ЦБ (обновлено {currentDate})
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('fiat')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
              activeTab === 'fiat'
                ? 'bg-white border-cyan-500 text-cyan-600 shadow-sm'
                : 'bg-white border-transparent text-gray-500 hover:bg-gray-100'
            }`}
          >
            Обычные валюты по ЦБ РФ
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all border ${
              activeTab === 'crypto'
                ? 'bg-white border-cyan-500 text-cyan-600 shadow-sm'
                : 'bg-white border-transparent text-gray-500 hover:bg-gray-100'
            }`}
          >
            Криптовалюты
          </button>
        </div>

        <div className="bg-white  overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Название валюты
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Обозначение
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Символ
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Курс
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeTab === 'fiat' ? (
                currencyData.map((currency) => (
                  <tr key={currency.guid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {currency.nazvanie}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {currency.kod}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-serif">
                      {currency.icon}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                      {/* Placeholder value as in image, since data doesn't have rates */}
                      {STABLE_RATES[currency.guid]}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                    Данные по криптовалютам отсутствуют
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CurrenciesPage
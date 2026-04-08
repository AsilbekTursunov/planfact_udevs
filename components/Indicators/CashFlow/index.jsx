"use client"

import React, { useMemo, useState, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import CustomMonthSlider from '../shared/CustomMonthSlider'

// Static Mock Data for CashFlow
const months = ['янв', 'фев', 'мар', 'апр', 'апр\n(план)', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const receiptsData = [25000, 30000, 28000, 35000, 55000, 40000, 42000, 45000, 43000, 48000, 50000, 55000, 58000]
const paymentsData = [18000, 22000, 20000, 25000, 5000, 28000, 30000, 32000, 31000, 34000, 36000, 38000, 40000]
const differenceData = receiptsData.map((val, idx) => val - paymentsData[idx])

const CashFlow = () => {
  const chartRef = useRef(null)
  const [zoomRange, setZoomRange] = useState([0, 50])
  const [activeTab, setActiveTab] = useState('Общий')

  const tabs = ['Общий', 'Операционный', 'Инвестиционный', 'Финансовый']

  const options = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#111827', fontSize: 12 },
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowBlur: 10,
      formatter: (params) => {
        let res = `<div class="p-1 font-semibold border-b border-gray-100 mb-1">${params[0].name}</div>`
        params.forEach(item => {
          res += `<div class="flex items-center justify-between gap-4 py-0.5">
                    <div class="flex items-center gap-2 text-gray-500">
                      <span class="w-2 h-2 rounded-full" style="background-color: ${item.color}"></span>
                      ${item.seriesName}
                    </div>
                    <div class="font-medium text-slate-900">${item.value.toLocaleString('ru-RU')} $</div>
                  </div>`
        })
        return res
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 14,
      textStyle: { color: '#6b7280', fontSize: 12 },
      data: ['Поступления', 'Выплаты', 'Разница']
    },
    dataZoom: [{
      type: 'slider',
      show: false,
      start: zoomRange[0],
      end: zoomRange[1],
    }],
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11, interval: 0 }
    },
    yAxis: {
      type: 'value',
      max: 60000,
      interval: 10000,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        formatter: (value) => value === 0 ? '0' : `${value / 1000} тыс`
      }
    },
    series: [
      {
        name: 'Поступления',
        type: 'bar',
        data: receiptsData,
        barWidth: 20,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#3b82f6'
        },
        markArea: {
          data: [[{
            xAxis: 'апр\n(план)',
            itemStyle: { color: 'rgba(59, 130, 246, 0.1)' }
          }, {
            xAxis: 'апр\n(план)'
          }]]
        }
      },
      {
        name: 'Выплаты',
        type: 'bar',
        data: paymentsData,
        barWidth: 20,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#fb923c'
        }
      },
      {
        name: 'Разница',
        type: 'line',
        data: differenceData,
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        lineStyle: { width: 3, color: '#10b981', type: 'dashed' },
        itemStyle: { color: '#10b981', borderWidth: 2, borderColor: '#fff' }
      }
    ]
  }), [zoomRange])

  const stats = [
    { label: 'Поступления', value: '100', plan: '50 793', color: 'text-slate-900', planColor: 'text-blue-500' },
    { label: 'Выплаты', value: '40', plan: '180', color: 'text-slate-900', planColor: 'text-blue-500' },
    { label: 'Разница', value: '60', plan: '50 613', color: 'text-slate-900', planColor: 'text-blue-500' },
  ]

  return (
    <div className="w-full bg-white p-6 mt-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-[22px] font-bold text-[#111827]">Денежный поток, $</h2>
          <div className="flex items-center justify-center size-5 bg-neutral-100 rounded-full cursor-help">
            <HelpCircle className="size-3 text-neutral-400" />
          </div>
        </div>
        <div className="flex flex-wrap bg-[#f3f4f624] border border-neutral-200 rounded-md p-1">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-all rounded whitespace-nowrap",
                activeTab === tab 
                  ? "bg-white text-[#38bdf8] shadow-sm border border-neutral-200" 
                  : "text-neutral-500 hover:text-slate-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Statistics panel */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-7 pr-4 mt-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <span className="text-[14px] font-medium text-neutral-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                {stat.label}
              </span>
              <div className="flex flex-col items-end">
                <span className={cn("text-[28px] font-bold leading-none mb-1", stat.color)}>
                  {stat.value}
                </span>
                <div className="flex items-center gap-1.5 text-xss">
                  <span className={cn("font-semibold", stat.planColor)}>{stat.plan}</span>
                  <span className="text-neutral-400">— по плану</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart container */}
        <div className="flex-1 ">
          <div className="mb-4 pt-4 px-2">
            <CustomMonthSlider 
              value={zoomRange} 
              onChange={setZoomRange}
            />
          </div>
          <div className="h-[450px] w-full">
            <ReactECharts
              ref={chartRef}
              option={options}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashFlow
export const balanceMockData = {
  assets: [
    {
      id: 'asset-1',
      name: 'UAcademy',
      value: 16377,
      children: [
        {
          id: 'asset-1-1',
          name: 'Дебиторская задолженность',
          value: 0,
          children: [
            { id: 'asset-1-1-1', name: 'Денежные средства', value: 0 },
            { id: 'asset-1-1-2', name: 'Недвижные средства', value: 0 }
          ]
        },
        {
          id: 'asset-1-2',
          name: 'Денежные средства',
          value: 16037,
          children: [
            {
              id: 'asset-1-2-1',
              name: 'Наличные счета',
              value: 0,
              children: [
                { id: 'asset-1-2-1-1', name: 'bb', value: 0 },
                { id: 'asset-1-2-1-2', name: 'UAcademy', value: 0 },
                { id: 'asset-1-2-1-3', name: 'Безналичные счета', value: 0 },
                { id: 'asset-1-2-1-4', name: 'Карты физлиц', value: 0 },
                { id: 'asset-1-2-1-5', name: 'Электронные счета', value: 0 }
              ]
            },
            { id: 'asset-1-2-2', name: 'Запасы', value: 16037, isSubtotal: true },
            {
              id: 'asset-1-2-3',
              name: 'Другие оборотные',
              value: 16037,
              children: [
                { id: 'asset-1-2-3-1', name: 'Отправленные платежи (перемещения)', value: 0 }
              ]
            },
            { id: 'asset-1-2-4', name: 'Переводы в пути', value: 16037 }
          ]
        }
      ]
    },
    {
      id: 'asset-2',
      name: 'Внеоборотные активы',
      value: -111,
      children: [
        {
          id: 'asset-2-1',
          name: 'Основные средства',
          value: 0,
          children: [
            { id: 'asset-2-1-1', name: 'Строительная техника и оборудование', value: 0 },
            { id: 'asset-2-1-2', name: 'Транспорт', value: -111 },
            { id: 'asset-2-1-3', name: 'Производственные помещения и склады', value: 0 },
            { id: 'asset-2-1-4', name: 'Офисная техника', value: 0 }
          ]
        },
        { id: 'asset-2-2', name: 'Другие внеоборотные', value: 0 }
      ]
    }
  ],
  
  liabilities: [
    {
      id: 'liability-1',
      name: 'Краткосрочные обязательства',
      value: 16377,
      children: [
        {
          id: 'liability-1-1',
          name: 'Кредиторская задолженность',
          value: 0,
          children: [
            { id: 'liability-1-1-1', name: 'Денежные средства', value: 0 },
            { id: 'liability-1-1-2', name: 'Недвижные средства', value: 0 }
          ]
        },
        {
          id: 'liability-1-2',
          name: 'Другие краткосрочные',
          value: 16037,
          children: [
            { id: 'liability-1-2-1', name: 'Платежи третьим лицам', value: 0 },
            { id: 'liability-1-2-2', name: 'Полученные платежи (перемещения)', value: 0 }
          ]
        }
      ]
    },
    {
      id: 'liability-2',
      name: 'Долгосрочные обязательства',
      value: -111,
      children: [
        { id: 'liability-2-1', name: 'Кредиты', value: 0 },
        { id: 'liability-2-2', name: 'Другие долгосрочные', value: 16037 }
      ]
    }
  ],
  
  equity: [
    {
      id: 'equity-1',
      name: 'Капитал',
      value: 10016266,
      children: [
        { id: 'equity-1-1', name: 'Вложения учредителей', value: 16037 },
        {
          id: 'equity-1-2',
          name: 'Нераспределенная прибыль',
          value: 0,
          children: [
            { id: 'equity-1-2-1', name: 'Текущий год', value: 0 },
            { id: 'equity-1-2-2', name: 'Прошлый период', value: 0 }
          ]
        },
        { id: 'equity-1-3', name: 'Другие внеоборотные', value: 0 }
      ]
    }
  ]
};

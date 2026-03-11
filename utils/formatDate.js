export const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (date) => {
  const year = new Date(date)?.getFullYear()
  const month = String(new Date(date)?.getMonth() + 1).padStart(2, '0')
  const day = String(new Date(date)?.getDate()).padStart(2, '0')
  const hours = String(new Date(date)?.getHours()).padStart(2, '0')
  const minutes = String(new Date(date)?.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} | ${hours}:${minutes}`
}

export const formatedToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


export const formatDateFormat = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};




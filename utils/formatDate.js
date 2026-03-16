export const formatDate = (date) => {
  // Handle null/undefined
  if (!date) return ''

  // Convert to Date object if it's a string
  const dateObj = date instanceof Date ? date : new Date(date)

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return ''

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateTime = (date) => {
  if (!date) return ''

  const dateObj = new Date(date)

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) return ''

  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
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

  // Check if the date is valid
  if (isNaN(date.getTime())) return '';

  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};



export const todayDate = new Date().getDate()

export const isToday = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}




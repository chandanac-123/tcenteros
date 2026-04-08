import { format } from 'date-fns'

export const hexToRgb = hex => {
  const h = hex?.replace('#', '')
  let rgbColor = `${parseInt(h.substring(0, 2), 16)} ${parseInt(
    h.substring(2, 4),
    16
  )} ${parseInt(h.substring(4, 6), 16)}`
  return rgbColor
}

export const applyTheme = theme => {
  const root = document.documentElement
  root.style.setProperty('--primary', hexToRgb(theme.primary_color))
  root.style.setProperty('--secondary', hexToRgb(theme.secondary_color))
}

// const { data } = await getThemeConfig()
// applyTheme(data)

//"14:30" to "02:30 PM"
export const convertTo12Hour = time => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  let hour = parseInt(hours, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${hour.toString().padStart(2, '0')}:${minutes} ${period}`
}

//2026-02-20T12:31:15.504485 to "02:31 PM"
export const formatTo12Hour = isoString => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export const convert12To24WithSeconds = time => {
  if (!time) return null

  const [timePart, period] = time.split(' ')
  const [hours, minutes] = timePart.split(':')

  let hour = parseInt(hours, 10)

  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0

  return `${hour.toString().padStart(2, '0')}:${minutes}:00`
}

export const formatRange = range => ({
  from: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
  to: range?.to ? format(range.to, 'yyyy-MM-dd') : null
})

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

//2026-03-10T11:34:14.147497 to 2026-03-10
export const formatDate = date => {
  if (!date) return null
  return format(new Date(date), 'yyyy-MM-dd')
}

export const formatToDDMMYYYY = date => {
  if (!date) return ''
  const parts = date.split('-')
  // If already in YYYY-MM-DD
  if (parts[0]?.length === 4) {
    const [year, month, day] = parts
    return `${day}-${month}-${year}`
  }

  return date // already correct format
}

export const hasPermission = (permissions, key) => {
  if (permissions === null) return true
  if (!permissions || !key) return false

  return key in permissions
}

export const formatIndianCurrency  = (value = 0) => {
  return new Intl.NumberFormat('en-IN').format(value);
};
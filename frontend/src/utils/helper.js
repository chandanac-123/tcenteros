export const hexToRgb = hex => {
  const h = hex.replace('#', '')
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

export const convertTo12Hour = time => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  let hour = parseInt(hours, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${hour.toString().padStart(2, '0')}:${minutes} ${period}`
}

export const convert12To24WithSeconds = (time) => {
  if (!time) return null

  const [timePart, period] = time.split(' ')
  const [hours, minutes] = timePart.split(':')

  let hour = parseInt(hours, 10)

  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0

  return `${hour.toString().padStart(2, '0')}:${minutes}:00`
}
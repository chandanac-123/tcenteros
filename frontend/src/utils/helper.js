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
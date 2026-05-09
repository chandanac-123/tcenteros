import { format } from "date-fns";

export const hexToRgb = (hex) => {
  const h = hex?.replace("#", "");
  let rgbColor = `${parseInt(h.substring(0, 2), 16)} ${parseInt(
    h.substring(2, 4),
    16,
  )} ${parseInt(h.substring(4, 6), 16)}`;
  return rgbColor;
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToRgb(theme.primary_color));
  root.style.setProperty("--secondary", hexToRgb(theme.secondary_color));
};

// const { data } = await getThemeConfig()
// applyTheme(data)

//"14:30" to "02:30 PM"
export const convertTo12Hour = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, "0")}:${minutes} ${period}`;
};

//2026-02-20T12:31:15.504485 to "02:31 PM"
export const formatTo12Hour = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const convert12To24WithSeconds = (time) => {
  if (!time) return null;
  const [timePart, period] = time.split(" ");
  const [hours, minutes] = timePart.split(":");
  let hour = parseInt(hours, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, "0")}:${minutes}:00`;
};

export const formatRange = (range) => ({
  from: range?.from ? format(range.from, "yyyy-MM-dd") : null,
  to: range?.to ? format(range.to, "yyyy-MM-dd") : null,
});

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

//2026-03-10T11:34:14.147497 to 2026-03-10
export const formatDate = (date) => {
  if (!date) return null;
  return format(new Date(date), "yyyy-MM-dd");
};

export const formatToDDMMYYYY = (date) => {
  if (!date) return "";
  const parts = date.split("-");
  // If already in YYYY-MM-DD
  if (parts[0]?.length === 4) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return date; // already correct format
};

export const sidebarPermission = (permissions, key) => {
  if (permissions === null) return true;
  if (!permissions || !key) return false;
  return key in permissions;
};

export const checkPermission = (permissions, path) => {
  // allow all if null (centeradmin, centeradmin)
  if (permissions === null) return true;
  // only block if undefined
  if (permissions === undefined) return false;
  const keys = path?.split(".");
  let current = permissions;
  for (let key of keys) {
    if (!current[key]) return false;
    current = current[key];
  }
  if (typeof current === "boolean") return current;
  if (typeof current === "object" && "enabled" in current) {
    return current.enabled;
  }
  return false;
};

export const formatIndianCurrency = (value = 0) => {
  return new Intl.NumberFormat("en-IN").format(value);
};

export const getChangedFields = (initial, current) => {
  const changed = {};
  Object.keys(current).forEach((key) => {
    if (current[key] !== initial[key]) {
      changed[key] = current[key];
    }
  });
  return changed;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning 🌞🌻";
  if (hour >= 12 && hour < 17) return "Good Afternoon 🌤️😎";
  if (hour >= 17 && hour < 21) return "Good Evening 🌇💫";
  return "Good Night 🌙⭐";
};

export const getTodayFormattedMonthYear = () => {
  return new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

//2026-03-10T11:34:14.147497 to 22 - Apr - 2026
export const formatTextDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} - ${month} - ${year}`;
};

// Utility function to format numbers as K, L, Cr
export const formatCurrencyCompact = (value) => {
  const num = Number(value || 0);
  if (num >= 10000000) {
    // 1 Crore = 1,00,00,000
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    // 1 Lakh = 1,00,000
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    // 1 Thousand = 1,000
    return `₹${(num / 1000).toFixed(2)} K`;
  }

  return `₹${num.toFixed(0)}`;
};

import { toast } from 'sonner'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

/* ================= SUCCESS ================= */
export const showSuccess = message => {
  toast.success(message, {
    icon: <CheckCircle2 className='text-green-600' size={20} />,
    style: {
      border: '1px solid #34b233',
      background: '#bcf5a6',
      color: '#34b233'
    }
  })
}

/* ================= ERROR ================= */
export const showError = message => {
  toast.error(message, {
    icon: <XCircle className='text-red-600' size={20} />,
    className: 'border border-red-500 bg-red-50 text-red-700'
  })
}

/* ================= WARNING ================= */
export const showWarning = message => {
  toast(message, {
    icon: <AlertTriangle className='text-yellow-600' size={20} />,
    className: 'border border-yellow-500 bg-yellow-50 text-yellow-700'
  })
}

/* ================= INFO ================= */
export const showInfo = message => {
  toast(message, {
    icon: <Info className='text-blue-600' size={20} />,
    className: 'border border-blue-500 bg-blue-50 text-blue-700'
  })
}

/* ================= CUSTOM ================= */
export const showCustomToast = (
  message,
  bgColor = 'bg-purple-50',
  borderColor = 'border-purple-500'
) => {
  toast(message, {
    className: `border ${borderColor} ${bgColor} text-purple-700`
  })
}

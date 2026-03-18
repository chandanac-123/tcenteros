import { toast } from 'sonner'
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'

/* ================= SUCCESS ================= */
export const showSuccess = message => {
  toast.success(message, {
    icon: <CheckCircle2 className="text-green-600" size={20} />,
    style: {
      background: "#FFFFFF",
      borderLeft: "4px solid #34C759",
      color: "#34C759"
    }
  })
}

/* ================= ERROR ================= */
export const showError = message => {
  toast.error(message, {
    icon: <XCircle className="text-red-600" size={20} />,
    style: {
      background: "#FFFFFF",
      borderLeft: "4px solid #EB4824",
      color: "#EB4824"
    }
  })
}

/* ================= WARNING ================= */
export const showWarning = message => {
  toast(message, {
    icon: <AlertTriangle className="text-yellow-600" size={20} />,
    style: {
      background: "#FFFFFF",
      borderLeft: "4px solid #FFCD0F",
      color: "#FFCD0F"
    }
  })
}

/* ================= INFO ================= */
export const showInfo = message => {
  toast(message, {
    icon: <Info className="text-blue-600" size={20} />,
    style: {
      background: "#FFFFFF",
      borderLeft: "4px solid #4581FF",
      color: "#4581FF"
    }
  })
}

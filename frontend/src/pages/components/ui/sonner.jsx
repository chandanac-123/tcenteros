
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: ({ type }) => {
            if (type === 'success') return 'border-green-500 bg-green-50 text-green-800 flex items-center';
            if (type === 'error') return 'border-red-500 bg-red-50 text-red-700 flex items-center';
            if (type === 'warning') return 'border-orange-500 bg-orange-50 text-orange-800 flex items-center';
            if (type === 'info') return 'border-blue-500 bg-blue-50 text-blue-800 flex items-center';
            return 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg';
          },
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          icon: ({ type }) => {
            if (type === 'success') return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
            if (type === 'error') return <XCircle className="w-5 h-5 text-red-500 mr-2" />;
            if (type === 'warning') return <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />;
            if (type === 'info') return <Info className="w-5 h-5 text-blue-500 mr-2" />;
            return null;
          },
        },
      }}
      {...props}
    />
  );
}

export { Toaster }

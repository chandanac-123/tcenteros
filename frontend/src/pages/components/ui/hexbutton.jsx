import { cn } from '@pages/lib/utils'

const hexClip =
  'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'

const HexButton = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-28 h-24 flex items-center justify-center',
        'transition-transform duration-300',
        active ? 'scale-105' : 'hover:scale-105'
      )}
      style={{ clipPath: hexClip }}
    >
      {/* Border Layer */}
      <div
        className={cn(
          'absolute inset-0',
          active
            ? 'bg-secondary'
            : 'bg-[#8B24E242]'
        )}
        style={{ clipPath: hexClip }}
      />

      {/* Inner Layer */}
      <div
        className={cn(
          'absolute inset-[3px] bg-white'
        )}
        style={{ clipPath: hexClip }}
      />

      {/* Text */}
      <span
        className={cn(
          'relative z-10 font-semibold',
          active ? 'text-violet-600' : 'text-gray-700'
        )}
      >
        {label}
      </span>
    </button>
  )
}

export default HexButton

import { cn } from '@pages/lib/utils'

const hexClip =
  'polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)'

const HexButton = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-28 h-24 flex items-center justify-center',
        'transition-all duration-300 ',
        active ? 'scale-105' : 'hover:scale-105'
      )}
      style={{ clipPath: hexClip }}
    >
      {/* BORDER LAYER */}
      <div
        className={cn(
          'absolute inset-0',
          active
            ? 'border-2 border-violet-600'
            : 'border ring border-primary'
        )}
        style={{ clipPath: hexClip }}
      />

      {/* INNER BACKGROUND */}
      <div
        className='absolute inset-[3px] bg-secondary/20'
        style={{ clipPath: hexClip }}
      />

      {/* TEXT */}
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

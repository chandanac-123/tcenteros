import { Check, CircleCheck } from 'lucide-react'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'

const PlanCard = ({
  title,
  price,
  duration,
  membershipId,
  description,
  features,
  colors
}) => {
  console.log('colors: ', colors)

  return (
   <div className='w-76 rounded-2xl border border-gray-300 relative overflow-hidden shadow-sm bg-white flex flex-col'>

  <div
    className={`absolute top-0 left-1/2 -translate-x-1/2 ${colors.bg} text-gray-800 px-6 py-1 rounded-b-xl font-semibold whitespace-nowrap`}
  >
    {title}
  </div>

  <div className='p-6 pt-10 flex-1 flex flex-col'>
    <div className='flex items-baseline gap-2'>
      <span className={`text-3xl font-bold ${colors.text}`}>
        ₹{price} /
      </span>
      <span className='text-base font-semibold text-textblack'>
        {duration}
      </span>
    </div>

    <p className='mt-2 text-sm text-textblack'>
      Membership ID -
      <span className={`${colors.text} font-medium ml-1`}>
        {membershipId}
      </span>
    </p>

    <hr className='my-4 border-textgrey' />

    <p className='text-sm text-grey_text leading-relaxed'>
      {description}
    </p>

    <div className='mt-4 space-y-3'>
      {features?.map((item, index) => (
        <div key={index} className='flex items-center gap-2'>
          <CircleCheck className='w-4' />
          <span className='text-sm text-textblack'>{item}</span>
        </div>
      ))}
    </div>

    {/* Push bottom to end */}
    <div className="mt-auto">
      <hr className='my-5 border-gray-300' />

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='text-primary font-medium'>Activate</span>
          <Switch />
        </div>

        <div className='flex items-center gap-2'>
          <button>
            <img src={edit} alt='edit' />
          </button>
          <button>
            <img src={deleteicon} alt='delete' />
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Footer Accent Always at Bottom */}
  <div className={`h-2 w-full ${colors.footer_bg}`}></div>
</div>

  )
}
export default PlanCard

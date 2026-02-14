import { Progress } from '@pages/components/ui/progress'

const FinancialProgressBar = ({ segments, label, value }) => {
  return (
    <div className='w-full bg-gray-200 rounded-full overflow-hidden flex my-4'>
      <div className='flex justify-between'>
        <span className='text-textgrey text-xs'>{label}</span>
        <span className='text-textgrey text-xs'>100%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}

export default FinancialProgressBar

import { Progress } from '@pages/components/ui/progress'

const FinancialProgressBar = ({ label, value ,progressBg, progressBgLight}) => {
  return (
    <div className='flex w-full flex-col'>
      <div className='flex justify-between items-center'>
        <span className='text-textgrey text-xs flex'>{label}</span>
        <span className='text-textgrey text-xs flex'>100%</span>
      </div>
      <div className='w-full bg-gray-200 rounded-full overflow-hidden flex'>
          <Progress
          value={50}
          trackClassName={progressBgLight}
          indicatorClassName={progressBg}
        />
      </div>
    </div>
  )
}

export default FinancialProgressBar

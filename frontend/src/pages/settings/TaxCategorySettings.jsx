import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'

const TaxCategorySettings = () => {
  return (
    <div className='py-4 gap-4 flex flex-col'>
      <form className='space-y-2'>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Tax Category Name'
              name='full_name'
              placeholder='Enter Your Full Name'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Tax Rate (Percentage)'
              name='email'
              placeholder='Enter Your Email ID'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Tax Type'
              name='full_name'
              placeholder='Enter Your Full Name'
            />
          </div>
          <div className='flex-1'>
            <CustomeSelect
              label='Tax Scope'
              name='email'
              placeholder='Enter Your Email ID'
            />
          </div>
        </div>
      </form>
      <span className='font-semibold'>Existing Tax Categories</span>
    </div>
  )
}

export default TaxCategorySettings

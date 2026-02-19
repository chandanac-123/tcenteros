import profile from '@assets/dummy/profile.png'
import profile_edit from '@assets/form-icons/profile-edit.svg'
import { Button } from '@pages/components/ui/button'

const CenterInformation = () => {
  return (
    <div className='flex flex-col p-2'>
      <span className='text-lg font-semibold mb-4'>Center Information 1</span>

      <div className='border border-tableborder rounded-2xl p-4 relative'>
        {/* Edit Button */}
        <div className='absolute top-6 right-6'>
          <Button
            variant='button_filter'
            rightIcon={profile_edit}
            size='editbutton'
          >
            Edit
          </Button>
        </div>

        {/* Top Section */}
        <div className='flex items-center justify-center gap-6 mb-8'>
          <img
            src={profile}
            alt='Center'
            className='w-20 h-20 rounded-md object-cover'
          />
          <div className='flex  gap-8 w-full'>
            <div>
              <p className='text-pricing_text text-sm'>Center Name</p>
              <p className='text-textblack text-base'>Power Gym</p>
            </div>
            <div>
              <p className='text-pricing_text text-sm'>Center Category</p>
              <p className='text-textblack text-base'>Premium Fitness</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className='grid grid-cols-3 gap-y-4 gap-x-12'>
          <div>
            <p className='text-pricing_text text-sm'>Center Code</p>
            <p className='text-textblack text-base'>GYM001</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>Email address</p>
            <p className='text-textblack text-base'>gym@email.com</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>Phone</p>
            <p className='text-textblack text-base'>+91 9876543210</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>Country</p>
            <p className='text-textblack text-base'>India</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>State</p>
            <p className='text-textblack text-base'>Kerala</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>City</p>
            <p className='text-textblack text-base'>Kochi</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>Pincode</p>
            <p className='text-textblack text-base'>682019</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>Address 1</p>
            <p className='text-textblack text-base'>MG Road,ahgfhasdvfashfn cnsacvashdvscsmnchdvch</p>
          </div>

          <div>
            <p className='text-pricing_text text-sm'>Address 2</p>
            <p className='text-textblack text-base'>Near Metro Statio n asvdhgasghcdghcgfcfghsfghsvcghsvchx hzv</p>
          </div>
        </div>

        {/* Description (Full Width) */}
        <div className='mt-4'>
          <p className='text-pricing_text text-sm'>Center description</p>
          <p className='text-textblack text-base mt-2'>
            Premium fitness center with modern equipment and certified trainers.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CenterInformation

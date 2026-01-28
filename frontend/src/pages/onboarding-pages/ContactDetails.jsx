import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import { Input } from '@pages/components/ui/input'
import { Checkbox } from '@pages/components/ui/checkbox'
import { Mail, User, Phone, Building2, MapPin } from 'lucide-react'

const ContactDetails = () => {
  return (
    <SecondaryLayout>
      <OnboardHeader />
      <div className='px-4 sm:px-10'>
        <div className='flex flex-col gap-1 mb-6 text-xl font-medium'>
            Let’s Set This Up for You
        </div>
      </div>

       <form className="space-y-4">
      <div className="flex items-center border rounded px-3 py-2">
        <Building2 className="w-5 h-5 text-gray-400 mr-2" />
        <Input placeholder="Center Name" className="border-0 focus:ring-0" />
      </div>
      <div className="flex items-center border rounded px-3 py-2">
        <User className="w-5 h-5 text-gray-400 mr-2" />
        <Input placeholder="Contact Person" className="border-0 focus:ring-0" />
      </div>
      <div className="flex items-center border rounded px-3 py-2">
        <Mail className="w-5 h-5 text-gray-400 mr-2" />
        <Input placeholder="Email" type="email" className="border-0 focus:ring-0" />
      </div>
      <div className="flex items-center border rounded px-3 py-2">
        <Phone className="w-5 h-5 text-gray-400 mr-2" />
        <Input placeholder="Phone" type="tel" className="border-0 focus:ring-0" />
      </div>
      <div className="flex items-center border rounded px-3 py-2">
        <MapPin className="w-5 h-5 text-gray-400 mr-2" />
        <Input placeholder="City" className="border-0 focus:ring-0" />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="agree" />
        <label htmlFor="agree" className="text-sm">
          I agree to be contacted for onboarding and support.
        </label>
      </div>
      <Button type="submit">Submit</Button>
    </form>
    </SecondaryLayout>
  )
}
export default ContactDetails
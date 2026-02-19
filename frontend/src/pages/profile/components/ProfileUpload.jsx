import profile_bg from '@assets/header-icons/profilebg.svg'
import user from '@assets/dummy/center.svg'
import { Camera } from 'lucide-react'
import { useState } from 'react'
import UpdateProfile from './UpdateProfile'

const ProfileUpload = () => {
  const [open, setOpen] = useState(false)
  return (
    <div className='flex flex-col'>
      {/* Background Image */}
      <img
        src={profile_bg}
        alt='Profile Background'
        className='w-full h-28 object-cover rounded-2xl'
      />

      {/* Profile Image Wrapper */}
      <div className='relative self-center -mt-20'>
        {/* Profile Image */}
        <img
          src={user}
          alt='User'
          className='w-28 h-28 rounded-full border-2 border-bordergreylight'
        />

        {/* Camera Button (Left Overlapping) */}
        <button onClick={() => setOpen(true)} className='absolute -right-2 bottom-0 bg-primary w-8 h-8 rounded-full flex justify-center items-center shadow-md'>
          <Camera size={16} className='text-white' />
        </button>
      </div>
      <div className='gap-1'>
      <span className='text-center block text-md font-semibold mt-2'>
        Prathibha Gathibandhe
      </span>
      <span className='text-center block text-xs text-secondary'>Center Admin</span>
    </div>
    <UpdateProfile open={open} setOpen={setOpen} />
    </div>
  )
}

export default ProfileUpload

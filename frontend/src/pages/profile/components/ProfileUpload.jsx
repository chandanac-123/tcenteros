import profile_bg from '@assets/header-icons/profilebg.svg'
import { Camera } from 'lucide-react'
import { useState } from 'react'
import UpdateProfile from './UpdateProfile'
import { useGetProfileInfoQuery } from '@api-queries/center-admin/center-profile/Query'
import defalutUser from '@assets/header-icons/user.svg'

const ProfileUpload = () => {
  const [open, setOpen] = useState(false)
  const { data } = useGetProfileInfoQuery()
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
          src={data?.profile_photo || defalutUser }
          alt='User'
          className='w-28 h-28 rounded-full border-2 border-bordergreylight'
        />

        {/* Camera Button (Left Overlapping) */}
        <button
          onClick={() => setOpen(true)}
          className='absolute -right-2 bottom-0 bg-primary w-8 h-8 rounded-full flex justify-center items-center shadow-md'
        >
          <Camera size={16} className='text-white' />
        </button>
      </div>
      <div className='gap-1'>
        <span className='text-center block text-md font-semibold mt-2'>
          {data?.full_name || '-'}
        </span>
        <span className='text-center block text-xs text-secondary'>
          {data?.role
            ? data.role.charAt(0).toUpperCase() + data.role.slice(1)
            : '-'}
        </span>
      </div>
      <UpdateProfile
        open={open}
        setOpen={setOpen}
        profileImage={data?.profile_photo}
      />
    </div>
  )
}

export default ProfileUpload

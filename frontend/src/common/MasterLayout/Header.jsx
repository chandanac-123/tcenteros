import bell from '@assets/header-icons/bell.svg'
import user from '@assets/header-icons/user.svg'
import map from '@assets/header-icons/map.svg'
import logout from '@assets/header-icons/logout.svg'
import dummy from '@assets/dummy/center.svg'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@pages/components/ui/popover'
import { ChevronDown, FileText, Key, Settings } from 'lucide-react'
import CustomeSearch from '../CustomeSearch'
import CustomeModal from '../CustomeModal'
import AddEditForm from '../../pages/employee-management/AddEditForm'
import { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const navigate = useNavigate()

  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <header className='w-full bg-textblack shadow flex items-center h-16 p-3'>
      <div className='w-1/2 flex'>
        <CustomeSearch placeholder='Search User' />
      </div>
      <div className='flex w-full justify-end gap-2 items-center font-bold text-xl text-gray-200'>
        <div className='flex w-full justify-end gap-2 items-center'>
          <span className='flex justify-center items-center text-xs font-normal bg-search_bg p-2 rounded-md'>
            <img src={map} className='w-5 h-5 mr-2' />
            Fitness center
          </span>

          {/* ADD */}
          <Button onClick={handleOpen} size='addbutton'>
            + Add Employee
          </Button>

          {/* EDIT MODAL */}
          <CustomeModal
            open={open}
            onOpenChange={setOpen}
            header='Create Employee'
          >
            <AddEditForm
              open={open}
              setOpen={setOpen}
              closeModal={() => setOpen(false)}
            />
          </CustomeModal>
        </div>
        <img src={bell} alt='logo' className='mr-2' />
        <Popover>
          <PopoverTrigger asChild>
            <div className='flex border border-textwhite rounded-full w-auto px-3 py-1 items-center cursor-pointer'>
              <div className='flex items-center'>
                <div className='flex items-center gap-0'>
                  <img
                    src={dummy}
                    alt='logo'
                    className='w-8 h-8 mr-4 rounded-full'
                  />
                  <div className='flex flex-col'>
                    <span className='text-textwhite text-sm whitespace-nowrap'>
                      Hello, Pratibha
                    </span>
                    <span className='text-primary text-xs font-light'>
                      Center Admin
                    </span>
                  </div>
                </div>
                <ChevronDown className='w-5 h-5 text-primary  ml-10' />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-auto'>
            <div className='flex flex-col gap-2'>
              <button className='flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded'>
                <img src={user} alt='' className='w-6 h-6 text-primary' />
                Profile
              </button>
              <button className='flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded'>
                <Key className='w-5 h-5 text-primary' />
                Reset Password
              </button>
              <button
                onClick={() => navigate('/settings')}
                className='flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded'
              >
                <Settings className='w-5 h-5 text-primary' />
                Settings
              </button>
              <button className='flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded'>
                <FileText className='w-5 h-5 text-primary' />
                Legal & polices
              </button>
              <button
                onClick={() => setLogoutOpen(true)}
                className='flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded'
              >
                <img src={logout} alt='' className='w-6 h-6 text-primary' />
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {/* <CustomeModal open={logoutOpen} onOpenChange={setLogoutOpen} header='Logout'>
        <div className='flex flex-col gap-4 p-4'></div>
      </CustomeModal> */}
    </header>
  )
}
export default Header

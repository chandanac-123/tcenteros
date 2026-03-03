import bell from '@assets/header-icons/bell.svg'
import map from '@assets/header-icons/map.svg'
import dummy from '@assets/dummy/center.svg'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@pages/components/ui/popover'
import {
  ChevronDown,
  FileText,
  Key,
  LogOut,
  Settings,
  UserRound
} from 'lucide-react'
import CustomeModal from '../CustomeModal'
import { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import AddBranchButton from '@pages/branch'
import { useCrmStore } from '@store/tabStore'

const Header = () => {
  const { setSelectedTab, setMemberView } = useCrmStore()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    const state = useAuthStore.getState()
    if (state.clearAuth) state.clearAuth()
    // Implement logout logic here
    setLogoutOpen(false)
  }

  return (
    <header className='w-full bg-secondary shadow flex items-center h-16 p-3'>
      <div className='flex w-full justify-end gap-2 items-center font-bold text-xl text-gray-200'>
        <div className='flex w-full justify-end gap-2 items-center'>
          <span className='flex justify-center items-center text-xs font-normal bg-search_bg p-2 rounded-md'>
            <img src={map} className='w-5 h-5 mr-2' />
            Fitness center
          </span>
          <AddBranchButton />
          <Button
            size='addbutton'
            onClick={() => {
              setSelectedTab(1)
              setMemberView('add')
              navigate('/crm')
            }}
          >
            + Add Member
          </Button>
        </div>

        <img src={bell} alt='logo' className='mr-2' />
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild onClick={() => setPopoverOpen(true)}>
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
                      Center Admin
                    </span>
                  </div>
                </div>
                <ChevronDown className='w-5 h-5 text-primary  ml-10' />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className='w-auto'>
            <div className='flex flex-col gap-2'>
              <button
                onClick={() => {
                  navigate('/profile')
                  setPopoverOpen(false)
                }}
                className='flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded'
              >
                <UserRound className='w-5 h-5 text-primary' />
                Profile
              </button>
              <button className='flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded'>
                <Key className='w-5 h-5 text-primary' />
                Reset Password
              </button>
              <button
                onClick={() => {
                  navigate('/settings')
                  setPopoverOpen(false)
                }}
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
                <LogOut className='w-5 h-5 text-primary' />
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <CustomeModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        header='Logout'
      >
        Are you sure you want to logout?
        <div className='flex justify-end  gap-4'>
          <Button
            onClick={() => setLogoutOpen(false)}
            size='addbutton'
            variant='outline_secondary'
            type='button'
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            size='addbutton'
            variant='default'
            type='button'
          >
            Logout
          </Button>
        </div>
      </CustomeModal>
    </header>
  )
}
export default Header

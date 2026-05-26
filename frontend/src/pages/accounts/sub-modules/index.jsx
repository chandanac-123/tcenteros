import CustomeBreadcrumb from '@common/components/CustomeBreadcrumb'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { subaccounts } from '@constants/accounts_submodules'
import { useNavigate, useParams } from 'react-router-dom'

const AccountsSubModules = () => {
  const navigate = useNavigate()
  const { module } = useParams()

  // Find active tab from URL
  const activeIndex = subaccounts.findIndex(
    item => item.title.toLowerCase() === module
  )

  // fallback to first tab
  const currentIndex = activeIndex >= 0 ? activeIndex : 0

  return (
    <ContentLayout>
      <div className='flex flex-col gap-6'>
        <div>
          <span className='text-lg font-semibold text-textblack'>
            Accounts Sub Modules - {subaccounts[currentIndex].title}
          </span>
          <CustomeBreadcrumb
            goBack={() => navigate("/accounts")}
            buttonName="Revenue Calendar"
            currentPageName="Revenue Details"
          />

        </div>


        {/* Tabs */}
        <div className='bg-white rounded-xl border border-gray-200 flex overflow-x-auto'>
          {subaccounts.map((item, index) => {
            const isActive = currentIndex === index

            return (
              <button
                key={index}
                onClick={() =>
                  navigate(
                    `/accounts/sub-modules/${item.title.toLowerCase()}`
                  )
                }
                className={`
                  flex flex-col items-center justify-center
                  w-full
                  py-4 px-6
                  border-r border-gray-200 last:border-r-0
                  transition-all duration-200
                  ${isActive
                    ? `${item.active_bg_color} text-white`
                    : 'bg-white hover:bg-gray-50'
                  }
                `}
              >
                <img
                  src={isActive ? item.image_active : item.image}
                  alt={item.title}
                  loading='lazy'
                  className='w-8 h-8 mb-2'
                />

                <span
                  className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700'
                    }`}
                >
                  {item.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Component */}
        <div className='mt-4'>
          {subaccounts[currentIndex].component}
        </div>
      </div>
    </ContentLayout>
  )
}

export default AccountsSubModules
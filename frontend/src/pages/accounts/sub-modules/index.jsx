import ContentLayout from '@common/masterLayout/ContentLayout'
import { useState } from 'react'
import { subaccounts } from '@constants/accounts_submodules'

const AccountsSubModules = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <ContentLayout>
      <div className='flex flex-col gap-6'>
        <span className='text-lg font-semibold text-textblack'>
          Accounts Sub Modules - {subaccounts[activeIndex].title}
        </span>
        {/* Tabs Container */}
        <div className='bg-white rounded-xl border border-gray-200 flex overflow-x-auto '>
          {subaccounts.map((item, index) => {
            const isActive = activeIndex === index
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  flex flex-col items-center justify-center
                  w-full
                  py-4 px-6
                  border-r border-gray-200 last:border-r-0
                  transition-all duration-200
                  ${
                    isActive
                      ? `${item.active_bg_color} text-white`
                      : 'bg-white hover:bg-gray-50'
                  }
                `}
              >
                <img
                  src={isActive ? item.image_active : item.image}
                  alt={item.title}
                  className='w-8 h-8 mb-2'
                />

                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            )
          })}
        </div>
        {/* Active Module Content */}
        <div className='mt-4'>{subaccounts[activeIndex].component}</div>
      </div>
    </ContentLayout>
  )
}

export default AccountsSubModules

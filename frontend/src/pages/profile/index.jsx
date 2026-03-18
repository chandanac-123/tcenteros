import ContentLayout from '@common/masterLayout/ContentLayout'
import ProfileUpload from './components/ProfileUpload'
import ProfileCard from './components/ProflieCard'
import CenterInformation from './components/CenterInformation'
import { useAllProfileQuery } from '@api-queries/center-profile/Query'

const ProfilePage = () => {
  const { data } = useAllProfileQuery()

  const profilecardcolor = [
    {
      color: 'border-profile_blue',
      bgcolor: 'bg-profile_bg_blue',
      label: 'Total Centers',
      count: data?.total_centers || 0
    },
    {
      color: 'border-profile_green',
      bgcolor: 'bg-profile_bg_green',
      label: 'Total Employees',
      count: data?.total_employees || 0
    },
    {
      color: 'border-profile_brown',
      bgcolor: 'bg-profile_bg_brown',
      label: 'Total Active Member',
      count: data?.total_active_members || 0
    },
    {
      color: 'border-profile_pink',
      bgcolor: 'bg-profile_bg_pink',
      label: 'Total In-active Member',
      count: data?.total_inactive_members || 0
    }
  ]

  return (
    <ContentLayout>
      <h1 className='text-xl font-semibold text-textblack'>Center Profile</h1>
      <div className='flex flex-col gap-2'>
        <ProfileUpload />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {profilecardcolor.map((card, index) => (
            <ProfileCard
              key={index}
              color={card.color}
              bgcolor={card.bgcolor}
              label={card.label}
              count={card.count}
            />
          ))}
        </div>
        <CenterInformation data={data} />
      </div>
    </ContentLayout>
  )
}
export default ProfilePage

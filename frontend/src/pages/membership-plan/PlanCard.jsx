import { CircleCheck } from 'lucide-react'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import { Switch } from '@pages/components/ui/switch'
import { useEffect, useState } from 'react'
import DeleteModal from '@common/components/CustomeDelete'
import { useDeletePlanMutation } from '@api-queries/center-admin/membership-plan/Query'
import CreateMembershipForm from './CreateForm'
import { useUpdatePlanStatusMutation } from '@api-queries/center-admin/membership-plan/Query'

import { useAppPermissions } from '@hooks/permissions'

const PlanCard = ({ data, colors }) => {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const { mutateAsync: updateMembershipStatus, isPending: isStatusUpdating } =
    useUpdatePlanStatusMutation()
  const [isActive, setIsActive] = useState(data?.status === 'active')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutateAsync: delete_plan, isPending } = useDeletePlanMutation(
    data?.membership_id
  )
  const {
    hydrated,
    canEditMembership,
    canDeleteMembership,
    canEnableMembership
  } = useAppPermissions()
  if (!hydrated) return null

  useEffect(() => {
    setIsActive(data?.status === 'active')
  }, [data?.status])

  const handleStatusChange = async value => {
    const newStatus = value ? 'active' : 'inactive'
    setIsActive(value)
    try {
      await updateMembershipStatus({
        id: data.membership_id,
        data: { status: newStatus }
      })
    } catch (error) {
      setIsActive(!value)
    }
  }

  const handleDelete = () => {
    if (data?.membership_id) {
      delete_plan(data?.membership_id)
      setDeleteOpen(false)
    }
  }

  return (
    <div className='rounded-2xl border border-gray-300 relative overflow-hidden shadow-sm bg-white flex flex-col h-[480px]'>
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 ${colors.bg} text-gray-800 px-6 py-1 rounded-b-xl font-semibold whitespace-nowrap`}
      >
        {data?.membership_name}
      </div>

      <div className='p-4 pt-10 flex-1 flex flex-col overflow-hidden'>
        <div className='flex items-baseline gap-2'>
          <span className={`text-3xl font-bold ${colors.text}`}>
            ₹{data?.default_price} /
          </span>
          <span className='text-base font-semibold text-textblack'>
            {data?.duration_count} {data?.duration_unit}
          </span>
        </div>

        <p className='mt-2 text-sm text-textblack'>
          Membership ID -
          <span className={`${colors.text} font-medium ml-1`}>
            {data?.membership_code}
          </span>
        </p>

        <hr className='my-4 border-textgrey' />
        <div className='mt-2 flex-1 overflow-y-auto'>
          <p className='text-sm text-grey_text leading-relaxed'>
            {data?.description}
          </p>
          <div className='mt-3 space-y-1'>
            {data?.membership_features?.map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                <img src={colors?.tick} className='w-3 h-3' />
                <span className='text-sm text-textblack break-words'>
                  {item?.feature_name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Push bottom to end */}
        <div className='mt-auto'>
          <hr className='my-5 border-gray-300' />
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='text-primary font-medium'>Activate</span>
              <Switch
                checked={isActive}
                disabled={isStatusUpdating || !canEnableMembership}
                onCheckedChange={handleStatusChange}
              />
            </div>
            <div className='flex items-center gap-2'>
              <button
                disabled={!canEditMembership}
                onClick={() => {
                  setEditId(data?.membership_id)
                  setOpen(true)
                }}
              >
                <img src={edit} alt='edit' />
              </button>
              <button
                disabled={!canDeleteMembership}
                onClick={() => setDeleteOpen(true)}
              >
                <img src={deleteicon} alt='delete' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Accent Always at Bottom */}
      <div className={`h-2 w-full ${colors.footer_bg}`}></div>
      <CreateMembershipForm open={open} setOpen={setOpen} editId={editId} />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        onConfirm={handleDelete}
        loading={isPending}
        header='Plan Deletion'
        description='This plan will be removed from your active offerings and new members won`t be able to purchase it. This action cannot be undone.'
      />
    </div>
  )
}
export default PlanCard

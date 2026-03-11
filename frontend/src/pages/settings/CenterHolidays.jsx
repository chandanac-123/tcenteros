import { useState } from 'react'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { Input } from '@pages/components/ui/input'
import { Button } from '@pages/components/ui/button'
import deleteicon from '@assets/form-icons/delete.svg'
import { DataTable } from '@common/components/DataTable'
import {
  useAllHolidayQuery,
  usecreateHolidayMutation,
  usedeleteHolidayMutation
} from '@api-queries/holiday/Query'
import { useFormik } from 'formik'
import { holidayValidationSchema } from '@utils/validations'
import { format } from 'date-fns'
import DeleteModal from '@common/components/CustomeDelete'

const CenterHolidays = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3
  })
  const { data, isLoading } = useAllHolidayQuery()
  const { mutateAsync: createHoliday, isPending } = usecreateHolidayMutation()
  const { mutateAsync: deleteHoliday } = usedeleteHolidayMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const columns = [
    {
      accessorKey: 'holiday_name',
      header: 'Holiday name'
    },
    {
      accessorKey: 'start_date',
      header: 'Start date'
    },
    {
      accessorKey: 'end_date',
      header: 'End date'
    },
    {
      header: 'Day',
      accessorKey: 'day',
      cell: ({ row }) => {
        console.log('Day row data: ', row?.original?.day)
        return (
          <span className='flex gap-3'>
            {row?.original?.day?.map(d => d.toUpperCase())?.join(', ')}
          </span>
        )
      }
    },
    {
      header: 'Actions',
      accessorKey: '',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <button
            onClick={() => {
              setDeleteId(row.original.id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' />
          </button>
        </span>
      )
    }
  ]

  const initialValues = {
    holiday_name: '',
    start_date: '',
    end_date: ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: holidayValidationSchema,  
    onSubmit: async values => {
      try {
        await createHoliday(values)
        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteHoliday(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleDateChange = (field, val) => {
    formik.setFieldValue(field, val ? format(val, 'yyyy-MM-dd') : '')
  }

  return (
    <div className='flex flex-col gap-6 py-2'>
      <span className='text-lg font-semibold'>Add New Holiday</span>
      <form
        className='space-y-4'
        id='center-timing'
        onSubmit={formik.handleSubmit}
      >
        <Input
          label='Holiday Name'
          placeholder='Enter holiday name'
          name='holiday_name'
          value={formik.values.holiday_name}
          onChange={formik.handleChange}
          error={formik.touched.holiday_name && formik.errors.holiday_name}
        />
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomDatePicker
              label='Start Date'
              name='start_date'
              value={formik.values.start_date}
              onChange={val => handleDateChange('start_date', val)}
              error={formik.touched.start_date && formik.errors.start_date}
            />
          </div>
          <div className='flex-1'>
            <CustomDatePicker
              label='End Date'
              name='end_date'
              value={formik.values.end_date}
              onChange={val => handleDateChange('end_date', val)}
              error={formik.touched.end_date && formik.errors.end_date}
            />
          </div>
        </div>

        <div className='flex justify-end items-center'>
          <Button
            id='center-timing'
            size='addbutton'
            variant='default'
            type='submit'
          >
            Add Holiday
          </Button>
        </div>
      </form>
      <DataTable
        columns={columns}
        data={data?.data}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Delete Holiday'
        description='Are you sure you want to delete this holiday?'
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default CenterHolidays

import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { DataTable } from '@common/DataTable'
import { useState } from 'react'
import { Switch } from '@radix-ui/react-switch'
import { Button } from '@pages/components/ui/button'
import { tax_type } from '@constants/taxType'
import { tax_scope } from '@constants/taxScope'
import {
  useAllTaxQuery,
  useCreateTaxMutation,
  useDeleteTaxMutation,
  useUpdateTaxMutation
} from '@api-queries/tax/Query'
import { useFormik } from 'formik'

const TaxCategorySettings = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3
  })
  const { data, isFetching: isTaxFetching } = useAllTaxQuery()

  const { mutateAsync: createTax, isPending } = useCreateTaxMutation()
  // const { mutateAsync: updateTax, isPending: isUpdating } =
  //   useUpdateTaxMutation()
  // const { mutateAsync: deleteTax, isPending: isDeleting } =
  //   useDeleteTaxMutation()

  const initialValues = {
    name: data?.name || '',
    tax_type: data?.tax_type || '',
    tax_percentage: data?.tax_percentage || '',
    tax_scope: data?.tax_scope || ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await createTax(values)

        closeModal()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const columns = [
    {
      accessorKey: 'name',
      header: 'Tax Name'
    },
    {
      accessorKey: 'tax_type',
      header: 'Tax Type'
    },
    {
      accessorKey: 'tax_percentage',
      header: 'Tax Rate'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge
            label={
              row.original.status == 'active'
                ? 'Active Member'
                : 'Inactive Member'
            }
            variant={
              row.original.status == 'Active Member' ? 'active' : 'inactive'
            }
          />
          <button
            onClick={() => {
              setViewId(row.original.id)
              setViewOpen(true)
            }}
          >
            <img src={view} alt='view' />
          </button>
          <button
            onClick={() => {
              setEditId(row.original.id)
              setEditOpen(true)
            }}
          >
            <img src={edit} alt='edit' />
          </button>
          <button
            onClick={() => {
              setDeleteId(row.original.id)
              setDeleteOpen(true)
            }}
          >
            <img src={deleteicon} alt='delete' />
          </button>
          <Switch />
        </span>
      )
    },
    {
      accessorKey: 'tax_scope',
      header: 'Actions'
    }
  ]

  return (
    <div className='py-4 gap-4 flex flex-col'>
      <form className='space-y-2' onSubmit={formik.handleSubmit}>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Tax Category Name'
              name='name'
              value={formik.values.name}
              onChange={formik.handleChange}
              placeholder='Enter Tax Name'
            />
          </div>
          <div className='flex-1'>
            <Input
              label='Tax Rate (Percentage)'
              name='tax_percentage'
              value={formik.values.tax_percentage}
              onChange={formik.handleChange}
              placeholder='Enter Tax Rate (Percentage)'
            />
          </div>
        </div>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <CustomeSelect
              label='Tax Type'
              name='tax_type'
              options={tax_type}
              value={formik.values.tax_type}
              onChange={value => formik.setFieldValue('tax_type', value)}
            />
          </div>
          <div className='flex-1'>
            <CustomeSelect
              label='Tax Scope'
              name='tax_scope'
              options={tax_scope}
              value={formik.values.tax_scope}
              onChange={value => formik.setFieldValue('tax_scope', value)}
            />
          </div>
        </div>
        <div className='flex justify-end mt-4 '>
          <Button size='addbutton' variant='default' type='submit'>
            + Create Tax Category
          </Button>
        </div>
      </form>
      <span className='font-semibold'>Existing Tax Categories</span>
      <DataTable
        title='Products'
        subTitle='Products'
        columns={columns}
        data={[]}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
    </div>
  )
}

export default TaxCategorySettings

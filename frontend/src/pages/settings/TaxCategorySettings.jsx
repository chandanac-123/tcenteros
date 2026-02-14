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
  useUpdateTaxMutation,
  useTaxGetByIdQuery
} from '@api-queries/tax/Query'
import { useFormik } from 'formik'
import { Badge } from '@pages/components/ui/badge'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import DeleteModal from '@common/CustomeDelete'

const TaxCategorySettings = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 3
  })
  const { data, isFetching: isTaxFetching } = useAllTaxQuery()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const { mutateAsync: createTax, isPending } = useCreateTaxMutation()
  const { mutateAsync: updateTax, isPending: isUpdating } =
    useUpdateTaxMutation()
  const { mutateAsync: deleteTax, isPending: isDeleting } =
    useDeleteTaxMutation(deleteId)
  const { data: taxData, isFetching: isTaxFetchingById } = useTaxGetByIdQuery(
    editId,
    {
      enabled: !!editId
    }
  )

  const initialValues = {
    name: taxData?.name || '',
    tax_type: taxData?.tax_type || '',
    tax_percentage: taxData?.tax_percentage || '',
    tax_scope: taxData?.tax_scope || ''
  }

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        if (editId) {
          await updateTax({ id: editId, data: values })
        } else {
          await createTax(values)
        }

        formik.resetForm()
        setEditId(null)
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleDelete = () => {
    if (deleteId) {
      deleteTax(deleteId)
      setDeleteOpen(false)
      setDeleteId(null)
    }
  }
  const columns = [
    {
      accessorKey: 'name',
      header: 'Tax Name'
    },
    {
      accessorKey: 'tax_type',
      header: 'Tax Type',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          {' '}
          {row.original.tax_type.replace(/_/g, ' /').toUpperCase()}
        </span>
      )
    },
    {
      accessorKey: 'tax_percentage',
      header: 'Tax Rate',
      cell: ({ row }) => (
        <span className='flex gap-3'> {row.original.tax_percentage}%</span>
      )
    },
    {
      accessorKey: 'tax_scope',
      header: 'Tax Scope',
      cell: ({ row }) => (
        <span className='flex gap-3'> {row.original.tax_scope.replace(/_/g, '')}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <Badge
            label={row.original.status == 'active' ? 'Active' : 'Inactive'}
            variant={
              row.original.status == 'Active Member' ? 'active' : 'inactive'
            }
          />
        </span>
      )
    },
    {
      accessorKey: 'tax_scope',
      header: 'Actions',
      cell: ({ row }) => (
        <span className='flex gap-3'>
          <button
            onClick={() => {
              setEditId(row.original.id)
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
            {editId ? 'Update Tax Category' : '+ Create Tax Category'}
          </Button>
        </div>
      </form>
      <span className='font-semibold'>Existing Tax Categories</span>
      <DataTable
        title='Products'
        subTitle='Products'
        columns={columns}
        data={data || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        paginationVisibile={true}
      />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Delete Tax Category'
        description='Are you sure you want to delete this Tax Category?'
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default TaxCategorySettings

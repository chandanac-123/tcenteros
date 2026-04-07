import React, { useState } from 'react'
import { DataTable } from '@common/components/DataTable'
import edit from '@assets/form-icons/edit.svg'
import deleteicon from '@assets/form-icons/delete.svg'
import StructureAddEdit from './AddEdit'
import DeleteModal from '@common/components/CustomeDelete'
import { useDeleteSalaryMutation } from '@api-queries/employee-salary/Query'

const SalaryStructureTable = ({
  pagination,
  data,
  isLoading,
  setTableParams,
  tableParams
}) => {
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const { mutate: deleteSalary } = useDeleteSalaryMutation()

  const handleDelete = async () => {
    try {
      if (deleteId) {
        await deleteSalary(deleteId)
      }
      setDeleteId(null)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const columns = [
    { accessorKey: 'full_name', header: 'Name' },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'joining_date', header: 'Joining Date' },
    { accessorKey: 'salary_type', header: 'Salary Type' },
    { accessorKey: 'pay_cycle', header: 'Pay Cycle' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button
            onClick={() => {
              setEditId(row.original.id)
            }}
          >
            <img src={edit} alt='edit' className='w-6 h-6' />
          </button>

          <button
            onClick={() => {
              setDeleteId(row.original.id)
            }}
          >
            <img src={deleteicon} alt='delete' className='w-6 h-6' />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={pagination}
        paginationVisibile={true}
      />
      <StructureAddEdit
        open={!!editId}
        setOpen={() => setEditId(null)}
        id={editId}
      />
      <DeleteModal
        open={!!deleteId}
        setOpen={() => setDeleteId(null)}
        id={deleteId}
        header='Delete Employee'
        description={'Are you sure you want to delete this employee?'}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default SalaryStructureTable

import { useState } from 'react'
import { DataTable } from '@common/components/DataTable'
import {
  usePayrollQuery,
  useRunPayrollMutation
} from '@api-queries/employee-management/Query'
import { Button } from '@pages/components/ui/button'
import { ArrowBigRightDash } from 'lucide-react'
import { Badge } from '@pages/components/ui/badge'
const statusVariantMap = { paid: 'active', unpaid: 'inactive' }
const Payroll = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data: payrollData, isFetching } = usePayrollQuery(tableParams)
  const { mutate: runPayroll } = useRunPayrollMutation()

  const columns = [
    { accessorKey: 'employee_name', header: 'EmployeeName' },
    { accessorKey: 'paid_date', header: 'Paid Date' },
    { accessorKey: 'payment_method', header: 'Payment Method' },
    { accessorKey: 'period', header: 'Period' },
    { accessorKey: 'deductions', header: 'Deductions' },
    { accessorKey: 'gross_salary', header: 'Gross Salary' },
    { accessorKey: 'net_salary', header: 'Net Salary' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          label={row.original.status.replace('_', ' ').toUpperCase()}
          variant={statusVariantMap[row.original.status] || 'inactive'}
        />
      )
    }
  ]

  const handleRunPayroll = async () => {
    try {
      await runPayroll() // Wait for the payroll to run before fetching the updated data
    } catch (error) {}
  }

  return (
    <div className='flex gap-3 flex-col'>
      <div>
        <Button size='addbutton' onClick={handleRunPayroll}>
          Run Payroll <ArrowBigRightDash />
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={payrollData?.payroll_records || []}
        setTableParams={setTableParams}
        tableParams={tableParams}
        pagination={payrollData?.total}
        paginationVisibile={true}
        isLoading={isFetching}
        search={false}
      />
    </div>
  )
}

export default Payroll

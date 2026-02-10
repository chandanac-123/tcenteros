import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@pages/components/ui/table'

import React, { useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis
} from '@pages/components/ui/pagination'

export function DataTable ({
  columns,
  data,
  setTableParams,
  tableParams,
  paginationVisibile
}) {
  const page = tableParams.page || 1
  const rowsPerPage = 10
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState(false)

  const handlePageChange = newPage => {
    setTableParams(prevParams => ({
      ...prevParams,
      page: newPage
    }))
  }

  const totalPageCount = tableParams?.totalCount || 5
  const paginationItems = []

  const visibleRange = 2 // pages before & after current

  let lastRenderedPage = null

  for (let i = 1; i <= totalPageCount; i++) {
    const shouldShow =
      i === 1 ||
      i === totalPageCount ||
      (i >= page - visibleRange && i <= page + visibleRange)

    if (shouldShow) {
      if (lastRenderedPage && i - lastRenderedPage > 1) {
        paginationItems.push(<PaginationEllipsis key={`ellipsis-${i}`} />)
      }

      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === page}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )

      lastRenderedPage = i
    }
  }

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: tableParams?.totalCount,
    state: {
      rowSelection,
      pagination: { pageIndex: page, pageSize: rowsPerPage }
    },
    onPaginationChange: () => handlePageChange
  })

  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className='py-2 flex justify-between items-center w-full px-2'>
        {paginationVisibile && (
          <div className='flex justify-between items-center w-full mt-4'>
            <div className='text-grey text-sm '> Showing {tableParams?.page} from {tableParams?.totalCount} data</div>

            <div className='flex items-center space-x-2'>
              <Pagination currentPage={tableParams?.page} lastPage={tableParams?.pageSize} setPageIndex={handlePageChange}>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(page - 1, 1))}
                    />
                  </PaginationItem>
                  <div className="flex border border-secondary rounded-md overflow-hidden">
                    {paginationItems}
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(page + 1, totalPageCount))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

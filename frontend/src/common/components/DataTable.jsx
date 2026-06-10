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

import React, { useRef, useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis
} from '@pages/components/ui/pagination'
import { Spinner } from '@pages/components/ui/spinner'
import CustomeSearch from './CustomeSearch'

export function DataTable ({
  columns,
  data,
  setTableParams,
  tableParams,
  paginationVisibile,
  pagination,
  loading,
  search = true
}) {
  const page = tableParams?.page || 1
  const rowsPerPage = 10
  const [rowSelection, setRowSelection] = useState({})
  const searchTimeout = useRef(null)
  const [searchValue, setSearchValue] = useState(tableParams?.search || '')

  const handlePageChange = newPage => {
    setTableParams(prevParams => ({
      ...prevParams,
      page: newPage
    }))
  }

  const totalRecords = pagination || 0
  const totalPageCount = Math.ceil(totalRecords / rowsPerPage)
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
    pageCount: pagination?.total || 1,
    state: {
      rowSelection,
      pagination: {
        pageIndex: page - 1, // 🔥 fix
        pageSize: rowsPerPage
      }
    },
    onPaginationChange: updater => {
      const newPageIndex =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1 }).pageIndex
          : updater.pageIndex

      handlePageChange(newPageIndex + 1)
    }
  })

  const handleSearchChange = e => {
    const value = e.target.value
    setSearchValue(value) // immediate typing
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    searchTimeout.current = setTimeout(() => {
      setTableParams(prev => ({
        ...prev,
        search: value,
        page: 1
      }))
    }, 300)
  }

  return (
    <>
      {search && (
        <div className='mb-4'>
          <CustomeSearch value={searchValue} onChange={handleSearchChange} />
        </div>
      )}
      <div className='flex flex-col h-full rounded-md border'>
        <div className='flex-1 overflow-y-auto '>
          <Table>
            <TableHeader className='sticky top-0 bg-white z-10'>
              {table?.getHeaderGroups()?.map(headerGroup => (
                <TableRow key={headerGroup?.id}>
                  {headerGroup?.headers?.map(header => (
                    <TableHead key={header?.id}>
                      {header?.isPlaceholder
                        ? null
                        : flexRender(
                            header?.column?.columnDef?.header,
                            header?.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className='text-sm'>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns?.length}
                    className='h-24 text-center'
                  >
                    <div className='flex justify-center items-center gap-2'>
                      <Spinner />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table?.getRowModel()?.rows.length ? (
                table?.getRowModel()?.rows.map(row => (
                  <TableRow
                    key={row?.id}
                    data-state={row?.getIsSelected() && 'selected'}
                  >
                    {row?.getVisibleCells()?.map(cell => (
                      <TableCell key={cell?.id}>
                        {flexRender(
                          cell?.column?.columnDef?.cell,
                          cell?.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns?.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='bg-white px-3 py-3 sticky -bottom-4 z-10 border-t'>
         {paginationVisibile && totalRecords > 10 && (
  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 w-full'>
    
    {/* Records Info */}
    <div className='text-grey text-xs sm:text-sm text-center sm:text-left'>
      Showing {(page - 1) * rowsPerPage + 1} -
      {Math.min(page * rowsPerPage, totalRecords)} of {totalRecords}
    </div>

    {/* Pagination */}
    <div className='flex justify-center sm:justify-end overflow-x-auto'>
      <Pagination>
        <PaginationContent className='flex-nowrap'>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
            />
          </PaginationItem>

          <div className='flex border border-secondary rounded-md overflow-hidden shrink-0'>
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
    </>
  )
}

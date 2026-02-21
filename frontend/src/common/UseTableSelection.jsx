import { Checkbox } from '@pages/components/ui/checkbox'
import { useState, useMemo } from 'react'

const useTableSelection = (data = []) => {
  const [selectedIds, setSelectedIds] = useState([])

  const allSelected = data.length > 0 && selectedIds.length === data.length

  const partiallySelected =
    selectedIds.length > 0 && selectedIds.length < data.length

  const selectionColumn = useMemo(
    () => ({
      id: 'select',
      header: () => (
        <Checkbox
          checked={partiallySelected ? 'indeterminate' : allSelected}
          onCheckedChange={checked => {
            if (checked) {
              setSelectedIds(data.map(item => item.id))
            } else {
              setSelectedIds([])
            }
          }}
        />
      ),
      cell: ({ row }) => {
        const id = row.original.id
        const checked = selectedIds.includes(id)

        return (
          <Checkbox
            checked={checked}
            onCheckedChange={isChecked => {
              if (isChecked) {
                setSelectedIds(prev =>
                  prev.includes(id) ? prev : [...prev, id]
                )
              } else {
                setSelectedIds(prev => prev.filter(item => item !== id))
              }
            }}
          />
        )
      }
    }),
    [data, selectedIds]
  )

  return {
    selectedIds,
    setSelectedIds,
    selectionColumn
  }
}
export default useTableSelection

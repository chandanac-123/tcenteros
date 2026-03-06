import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  getAllSKU,


} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useAllSKUsQuery = () => {
  return useQuery({
    queryKey: ['sku'],
    queryFn: () => getAllSKU(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateProductMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createProduct(data),
    onSuccess: async data => {
      query.invalidateQueries('salary')
      showSuccess('Product created successfully')
    },
    onError: err => {
      showError(err?.response?.data?.message || 'Failed to create product')
      return err
    }
  })
}

// export const useUpdateSalaryMutation = () => {
//   const query = useQueryClient()
//   return useMutation({
//     mutationFn: ({ id, data }) => updateSalary(data, id),
//     onSuccess: async data => {
//       query.invalidateQueries('salary')
//       showSuccess('Salary updated successfully')
//     },
//     onError: err => {
//       showError(err?.response?.data?.message || 'Failed to update salary')
//       return err
//     }
//   })
// }

// export const useDeleteSalaryMutation = () => {
//   const query = useQueryClient()
//   return useMutation({
//     mutationFn: id => deleteSalary(id),
//     onSuccess: async data => {
//       query.invalidateQueries('salary')
//     },
//     onError: err => {
//       return err
//     }
//   })
// }

// export const useSalaryGetByIdQuery = id => {
//   return useQuery({
//     queryKey: ['salary', id],
//     queryFn: () => getSalaryById(id),
//     enabled: !!id,
//     refetchOnWindowFocus: true,
//     refetchOnMount: true
//   })
// }

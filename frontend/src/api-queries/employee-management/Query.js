import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCategory, getAllCategories } from "./Urls"

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateCategoryMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createCategory(data),
    onSuccess: async data => {
      query.invalidateQueries('categories')
    },
    onError: err => {
      return err
    }
  })
}


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMember,
  deleteMember,
  getAllMember,
  getMemberById,
  updateMember,
  getMemberTimeSlot,
  getMemberPlan,
  getMemberCount,
  updateMemberStatus,
  getVisitor,
  getGuestInfo,
  getVisitorById,
  getGuestById,
  getActiveMemberPlan
} from './Urls'
import { showError, showSuccess } from '@utils/toast'

export const useMembersQuery = data => {
  return useQuery({
    queryKey: ['members', data],
    queryFn: () => getAllMember(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useCreateMemberMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: data => createMember(data),
    onSuccess: async data => {
      query.invalidateQueries('members')
      showSuccess('Member created successfully')
    },
    onError: err => {
      console.log('err22: ', err.response?.data);
      showError(err?.response?.data?.detail || 'Failed to create member')
      return err
    }
  })
}

export const useUpdateMemberMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateMember(data, id),
    onSuccess: async   => {
      query.invalidateQueries('members')
      showSuccess('Member updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to update member')
      return err
    }
  })
}

export const useDeleteMemberMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: id => deleteMember(id),
    onSuccess: async data => {
      query.invalidateQueries('members')
      showSuccess('Member deleted successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to delete member')
      return err
    }
  })
}

export const useMembersGetByIdQuery = id => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => getMemberById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useMembersTimeSlotQuery = id => {
  return useQuery({
    queryKey: ['membersTimeSlot', id],
    queryFn: () => getMemberTimeSlot(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useMembersPlanQuery = () => {
  return useQuery({
    queryKey: ['membersPlan'],
    queryFn: () => getMemberPlan(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useActiveMembersPlanQuery = () => {
  return useQuery({
    queryKey: ['membersPlan'],
    queryFn: () => getActiveMemberPlan(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}


export const useMembersCountQuery = () => {
  return useQuery({
    queryKey: ['membersCount'],
    queryFn: () => getMemberCount(),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useUpdateMemberStatusMutation = () => {
  const query = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => updateMemberStatus(id, status),
    onSuccess: async data => {
      query.invalidateQueries('members')
      showSuccess(data.detail ||'Member status updated successfully')
    },
    onError: err => {
      showError(err?.response?.data?.detail || 'Failed to update member status')
      return err
    }
  })
}

export const useVisitorQuery = data => {
  return useQuery({
    queryKey: ['visitors', data],
    queryFn: () => getVisitor(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGuestQuery = (data) => {
  return useQuery({
    queryKey: ['guests', data],
    queryFn: () => getGuestInfo(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}


export const useVisitorById = (id) => {
  return useQuery({
    queryKey: ['visitorById'],
    queryFn: () => getVisitorById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}

export const useGuestById = (id) => {
  return useQuery({
    queryKey: ['guestById'],
    queryFn: () => getGuestById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
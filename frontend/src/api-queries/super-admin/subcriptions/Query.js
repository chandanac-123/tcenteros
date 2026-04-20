import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMember,
  deleteMember,
  getAllMember,
  getMemberById,
  updateMember,
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useMembersQuery = (data) => {
  return useQuery({
    queryKey: ["members", data],
    queryFn: () => getAllMember(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateMemberMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (data) => createMember(data),
    onSuccess: async (data) => {
      query.invalidateQueries("members");
      showSuccess("Member created successfully");
    },
    onError: (err) => {
      console.log("err22: ", err.response);
      showError(err?.response?.data?.detail || "Failed to create member");
      return err;
    },
  });
};

export const useUpdateMemberMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateMember(data, id),
    onSuccess: (async) => {
      query.invalidateQueries("members");
      showSuccess("Member updated successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to update member");
      return err;
    },
  });
};

export const useDeleteMemberMutation = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteMember(id),
    onSuccess: async (data) => {
      query.invalidateQueries("members");
      showSuccess("Member deleted successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to delete member");
      return err;
    },
  });
};

export const useMembersGetByIdQuery = (id) => {
  return useQuery({
    queryKey: ["members", id],
    queryFn: () => getMemberById(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

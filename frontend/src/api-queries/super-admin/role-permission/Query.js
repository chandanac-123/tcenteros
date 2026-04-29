import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDesignation,
  createEmployee,
  createPermission,
  deleteEmployee,
  getDesignation,
  getEmployee,
  getPermission,
  deleteDesignation,
} from "./Urls";
import { showError, showSuccess } from "@utils/toast";

export const useDesignationQuery = (data) => {
  return useQuery({
    queryKey: ["designations", data],
    queryFn: () => getDesignation(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateDesignationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createDesignation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      showSuccess("Designation created successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to create designation");
      return err;
    },
  });
};

export const useDeleteDesignationMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteDesignation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["designations"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      showSuccess(data?.detail || "Designation deleted successfully");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail ||
          "Failed to delete selected designations",
      );
      return err;
    },
  });
};

export const useEmployeeQuery = (data) => {
  return useQuery({
    queryKey: ["employees", data],
    queryFn: () => getEmployee(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreateEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      showSuccess("Employee created successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to create employee");
      return err;
    },
  });
};

export const usePermissionQuery = (data) => {
  return useQuery({
    queryKey: ["permissions", data],
    queryFn: () => getPermission(data),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useCreatePermissionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      showSuccess("Permission created successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.detail || "Failed to create permission");
      return err;
    },
  });
};

export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteEmployee(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      showSuccess(data?.detail || "Employee deleted successfully");
    },
    onError: (err) => {
      showError(
        err?.response?.data?.detail || "Failed to delete selected employees",
      );
      return err;
    },
  });
};

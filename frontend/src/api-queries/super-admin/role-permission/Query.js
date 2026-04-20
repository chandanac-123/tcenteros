import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDesignation,
  createEmployee,
  getDesignation,
  getEmployee,
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
      showSuccess("Designation created successfully");
    },
    onError: (err) => {
      showError(err?.response?.data?.message || "Failed to create designation");
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
      showError(err?.response?.data?.message || "Failed to create employee");
      return err;
    },
  });
};
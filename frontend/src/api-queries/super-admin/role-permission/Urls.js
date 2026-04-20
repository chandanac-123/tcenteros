import {
  createDesignationApiCall,
  createEmployeeApiCall,
  createPermissionApiCall,
  deleteEmployeeApiCall,
  getDesignationApiCall,
  getEmployeeApiCall,
  getPermissionApiCall,
  deleteDesignationApiCall
} from "./index";

export const getDesignation = async (data) => {
  try {
    const response = await getDesignationApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDesignation = async (details) => {
  try {
    const response = await createDesignationApiCall(details);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDesignation = async (id) => {
  try {
    const response = await deleteDesignationApiCall(id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEmployee = async (data) => {
  try {
    const response = await getEmployeeApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createEmployee = async (details) => {
  try {
    const response = await createEmployeeApiCall(details);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await deleteEmployeeApiCall(id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPermission = async (data) => {
  try {
    const response = await getPermissionApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPermission = async (details) => {
  try {
    const response = await createPermissionApiCall(details);
    return response.data;
  } catch (error) {
    throw error;
  }
};
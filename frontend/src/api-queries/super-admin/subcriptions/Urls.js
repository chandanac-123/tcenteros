import {
  createMemberApiCall,
  getMemberApiCall,
  updateMemberApiCall,
  deleteMemberApiCall,
  getMemberByIdApiCall,
} from "./index";

export const getAllMember = async (data) => {
  try {
    const response = await getMemberApiCall(data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMember = async (details) => {
  try {
    const response = await createMemberApiCall(details);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMember = async (details, id) => {
  try {
    const response = await updateMemberApiCall(details, id);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteMember = async (id) => {
  try {
    const response = await deleteMemberApiCall(id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMemberById = async (id) => {
  try {
    const response = await getMemberByIdApiCall(id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

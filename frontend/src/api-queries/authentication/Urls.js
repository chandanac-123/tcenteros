import { loginApiCall } from "../../api/index";

export const login = async (details) => {
  try {
    const response = await loginApiCall(details)
    return response.data
  } catch (error) {
    throw error
  }
}
import axiosInstance from "@api/axiosInstance"

export const getGalleryApiCall = id =>
  axiosInstance.get(`/center/center/${id}/gallery`)
export const createGalleryApiCall = details =>
  axiosInstance.post(`/center/center/gallery`, details, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
export const deleteGalleryApiCall = id => {
  return axiosInstance.delete(`/center/center/gallery/${id}`)
}
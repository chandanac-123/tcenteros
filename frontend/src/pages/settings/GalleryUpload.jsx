import { Button } from '@pages/components/ui/button'
import React, { useState } from 'react'
import deleteicon from '@assets/form-icons/delete.svg'
import { useGalleryQuery } from '@api-queries/gallery/Query'
import { useAuthStore } from '@store/authStore'
import UploadImage from './components/UploadImage'
import { useDeleteGalleryMutation } from '@api-queries/gallery/Query'

const GalleryUpload = () => {
  const state = useAuthStore.getState()
  const centerId = state?.auth?.center_id

  const [open, setOpen] = useState(false)

  const { data: galleryData, refetch } = useGalleryQuery(centerId)

  const { mutate: deleteGallery } = useDeleteGalleryMutation()

  const handleDelete = id => {
    deleteGallery(id, {
      onSuccess: () => {
        refetch()
      }
    })
  }

  return (
    <div>
      <div className='flex justify-between'>
        <div className='text-lg font-semibold mb-6'>
          Gallery image upload
        </div>
        <Button
          size='addbutton'
          variant='button_outlined'
          onClick={() => setOpen(true)}
        >
          + Upload image
        </Button>
      </div>

      {galleryData?.length > 0 && (
        <span className='text-sm text-textblack'>Gallery List</span>
      )}

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-4'>
        {galleryData?.map(image => (
          <div
            key={image?.id}
            className='relative rounded-xl overflow-hidden border border-dashed border-gray-300'
          >
            <img
              src={image?.image_url}
              loading='lazy'
              alt='gallery'
              className='w-full h-56 object-cover'
            />

            <button
              onClick={() => handleDelete(image?.id)}
              className='absolute bottom-3 right-3'
            >
              <img src={deleteicon} alt='delete' className='w-6 h-6' />
            </button>
          </div>
        ))}
      </div>

      <UploadImage
        open={open}
        setOpen={setOpen}
        centerId={centerId}
        refetch={refetch}
      />
    </div>
  )
}

export default GalleryUpload
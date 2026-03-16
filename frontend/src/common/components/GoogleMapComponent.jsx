import React from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import CustomeModal from './CustomeModal'
import { useFetchCenterLocationMutation } from '@api-queries/center-profile/Query'
import { useFormik } from 'formik'
import { Button } from '@pages/components/ui/button'
import { useAuthStore } from '@store/authStore'

const containerStyle = {
  width: '100%',
  height: '400px'
}

function GoogleMapComponent ({ open, setLocationOpen }) {
  const state = useAuthStore.getState()
  const { mutateAsync: fetchCenterLocation, isPending } =
    useFetchCenterLocationMutation()

  const initialValues = {
    center_id: state?.auth?.center_id,
    latitude: '',
    longitude: ''
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, { resetForm }) => {
      try {
        await fetchCenterLocation(values)
        setLocationOpen(false)
        resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const center = {
    lat: 10.8505, // Kerala example
    lng: 76.2711
  }

  return (
    <CustomeModal
      open={open}
      onOpenChange={setLocationOpen}
      className='max-w-xl w-full'
      header='Fitness center location'
    >
      <form onSubmit={formik.handleSubmit}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onClick={e => {
              console.log(e.latLng.lat(), e.latLng.lng())
            }}
          >
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
        <div className='flex justify-end mt-2'>
          <Button type='submit' size='addbutton' disabled={isPending}>
            Save Location
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default GoogleMapComponent

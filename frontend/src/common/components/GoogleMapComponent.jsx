import React, { useEffect, useState } from 'react'
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete
} from '@react-google-maps/api'
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

  const [center, setCenter] = useState(null)
  const [marker, setMarker] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)

  const initialValues = {
    center_id: state?.auth?.center_id,
    latitude: '',
    longitude: ''
  }

  const formik = useFormik({
    initialValues,
    onSubmit: async values => {
      try {
        await fetchCenterLocation(values)
        setLocationOpen(false)
      } catch (error) {
        console.error(error)
      }
    }
  })

  // 📍 Get Current Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      const location = { lat, lng }

      setCenter(location)
      setMarker(location)

      formik.setFieldValue('latitude', lat)
      formik.setFieldValue('longitude', lng)
    })
  }, [])

  // 🔍 Search place

const onLoadAutocomplete = auto => {
  setAutocomplete(auto)
}

const onPlaceChanged = () => {
  if (!autocomplete) return

  const place = autocomplete.getPlace()

  // safety check
  if (!place.geometry) {
    alert('Please select a valid location')
    return
  }

  const lat = place.geometry.location.lat()
  const lng = place.geometry.location.lng()

  const location = { lat, lng }

  setCenter(location)
  setMarker(location)

  formik.setFieldValue('latitude', lat)
  formik.setFieldValue('longitude', lng)
}

    //  Click on map → move marker
  const handleMapClick = e => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    const location = { lat, lng }

    setMarker(location)

    formik.setFieldValue('latitude', lat)
    formik.setFieldValue('longitude', lng)
  }


  return (
    <CustomeModal
      open={open}
      onOpenChange={setLocationOpen}
      className='max-w-xl w-full'
      header='Fitness center location'
    >
      <form onSubmit={formik.handleSubmit}>
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
          libraries={['places']}
        >
          {/* 🔍 Search box */}
          {/* <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type='text'
              placeholder='Search location...'
              className='w-full p-2 border rounded mb-2'
            />
          </Autocomplete> */}

           {center && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
              onClick={handleMapClick}
            >
              {/* 📍 Draggable Marker */}
              {marker && (
                <Marker
                  position={marker}
                  draggable={true}
                  onDragEnd={e => {
                    const lat = e.latLng.lat()
                    const lng = e.latLng.lng()

                    const location = { lat, lng }

                    setMarker(location)

                    formik.setFieldValue('latitude', lat)
                    formik.setFieldValue('longitude', lng)
                  }}
                />
              )}
            </GoogleMap>
          )}
        </LoadScript>

        <div className='flex justify-end mt-3'>
          <Button type='submit' size='addbutton' disabled={isPending}>
            Save Location
          </Button>
        </div>
      </form>
    </CustomeModal>
  )
}

export default GoogleMapComponent

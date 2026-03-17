import React, { useEffect, useState, useRef } from 'react'
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader
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
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries: ['places']
  })

  const state = useAuthStore.getState()
  const { mutateAsync: fetchCenterLocation, isPending } =
    useFetchCenterLocationMutation()

  const [center, setCenter] = useState(null)
  const [marker, setMarker] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const autocompleteRef = useRef(null)

  // Reset search when modal opens
  useEffect(() => {
    if (open) {
      setSearchValue('')
    }
  }, [open])

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
    if (!open) return // ✅ only run when modal opens
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const location = { lat, lng }
        setCenter(location)
        setMarker(location)
        formik.setFieldValue('latitude', lat)
        formik.setFieldValue('longitude', lng)
        // (optional) clear search box
        setSearchValue('')
      },
      error => {
        console.error('Error getting location:', error)
      }
    )
  }, [open])

  // 🔍 Search place
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()
    console.log('PLACE:', place) // 👈 debug
    if (!place || !place.geometry) {
      console.warn('No geometry found. Probably typed text only.')
      return
    }
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const location = { lat, lng }
    setCenter(location)
    setMarker(location)
    formik.setFieldValue('latitude', lat)
    formik.setFieldValue('longitude', lng)
    setSearchValue(place.formatted_address || place.name || '')
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
      className='max-w-3xl w-full'
      header='Fitness center location'
    >
      <form onSubmit={formik.handleSubmit}>
        {isLoaded && center && (
          <div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
              onClick={handleMapClick}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 10,
                  display: 'flex',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                <Autocomplete
                  onLoad={autocomplete => {
                    autocomplete.setFields([
                      'formatted_address',
                      'geometry',
                      'name'
                    ])
                    autocompleteRef.current = autocomplete
                  }}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault() // 🚨 STOP form submit
                      }
                    }}
                    type='text'
                    placeholder='Search location...'
                    style={{
                      boxSizing: 'border-box',
                      border: '1px solid #ccc',
                      width: '300px',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </Autocomplete>
              </div>
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
          </div>
        )}
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

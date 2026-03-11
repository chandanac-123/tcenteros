import React from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '400px'
}

const center = {
  lat: 10.8505, // Kerala example
  lng: 76.2711
}

function GoogleMapComponent () {
  return (
    <LoadScript googleMapsApiKey='YOUR_API_KEY'>
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
  )
}

export default GoogleMapComponent

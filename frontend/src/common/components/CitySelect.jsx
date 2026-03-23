import { useState, useEffect } from 'react'
import CustomeSelect from '@common/components/CustomeSelect'
import { City } from 'country-state-city'

const stateMap = {
  KL: 'Kerala',
}

const CitySelect = ({ country = 'IN', state, value, onChange }) => {
  const [places, setPlaces] = useState([])
  console.log('places: ', places);

  // 🔥 Load default cities (before search)
  useEffect(() => {
    if (state) {
      const cities = City.getCitiesOfState(country, state)

      const formatted = cities.map(c => ({
        id: c.name,
        name: c.name
      }))

      setPlaces(formatted)
    }
  }, [state, country])

  const fetchPlaces = input => {
    if (!input || input.length < 2) {
      // 🔥 fallback to default cities
      const cities = City.getCitiesOfState(country, state)
      setPlaces(
        cities.map(c => ({
          id: c.name,
          name: c.name
        }))
      )
      return
    }

    if (!window.google || !window.google.maps) return

    const service = new window.google.maps.places.AutocompleteService()
    const stateName = stateMap[state] || ''

    service.getPlacePredictions(
      {
        input: stateName ? `${input} ${stateName}` : input,
        types: ['(cities)'],
        componentRestrictions: { country: country.toLowerCase() }
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          const uniqueCities = [
            ...new Map(
              predictions.map(p => {
                const city = p.terms?.[0]?.value || p.description
                return [city, { id: p.place_id, name: city }]
              })
            ).values()
          ]

          setPlaces(uniqueCities)
        } else {
          setPlaces([])
        }
      }
    )
  }

  return (
    <CustomeSelect
      label='City'
      placeholder='Select or Search City'
      options={places}
      value={value}
      search={true}
      disabled={!state}
      onSearch={fetchPlaces}
      onChange={val => {
        const selected = places.find(p => String(p.id) === String(val))
        onChange(selected?.name || '')
      }}
    />
  )
}

export default CitySelect

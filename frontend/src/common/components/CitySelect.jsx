import { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'

const CitySelect = ({ value, onChange, label, icon, country = 'IN' }) => {
  const autocompleteRef = useRef(null)

  const onLoad = autocomplete => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()

    if (!place || !place.address_components) return

    let city = ''
    let state = ''
    let selectedCountry = ''

    place.address_components.forEach(component => {
      const types = component.types

      if (
        types.includes('locality') ||
        types.includes('postal_town') ||
        types.includes('sublocality') ||
        types.includes('administrative_area_level_3')
      ) {
        if (!city) city = component.long_name
      }

      if (types.includes('administrative_area_level_1')) {
        state = component.long_name
      }

      if (types.includes('country')) {
        selectedCountry = component.long_name
      }
    })

    if (!city) {
      city = place.name || place.formatted_address || ''
    }

    onChange({
      city,
      state,
      country: selectedCountry
    })
  }

  const handleInputChange = e => {
    const typedCity = e.target.value
    onChange({
      city: typedCity,
      state: '',
      country: ''
    })
  }

  return (
    <div>
      {label && (
        <label className='block mb-1 text-sm text-textblack'>{label}</label>
      )}

      <div onMouseDown={e => e.stopPropagation()}>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['(cities)'],
            fields: ['address_components', 'name'], // 🔥 important
            ...(country && {
              componentRestrictions: {
                country: country.toLowerCase()
              }
            })
          }}
        >
          <div className='relative flex items-center'>
            {icon && (
              <span className='absolute left-3 text-gray-400'>{icon}</span>
            )}

            <input
              type='text'
              placeholder='Search City'
              value={value || ''}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (e.key === 'Enter') e.preventDefault()
              }}
              className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                icon ? 'pl-10' : ''
              }`}
            />
          </div>
        </Autocomplete>
      </div>
    </div>
  )
}

export default CitySelect

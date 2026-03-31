import { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'

const CountrySelect = ({ value, onChange, label }) => {
  const autocompleteRef = useRef(null)

  const onLoad = autocomplete => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace()

    if (!place || !place.address_components) return

    let country = ''
    let countryCode = ''

    place.address_components.forEach(component => {
      if (component.types.includes('country')) {
        country = component.long_name
        countryCode = component.short_name
      }
    })

    // fallback
    if (!country) {
      country = place.name || ''
    }

    onChange({
      country,
      countryCode
    })
  }

  const handleInputChange = e => {
    const typed = e.target.value

    onChange({
      country: typed,
      countryCode: ''
    })
  }

  return (
    <div>
      {label && (
        <label className='block mb-1 text-sm text-textblack'>
          {label}
        </label>
      )}

      <div onMouseDown={e => e.stopPropagation()}>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['(regions)'],
            fields: ['address_components', 'name'] // 🔥 important
          }}
        >
          <input
            type='text'
            placeholder='Search Country'
            value={value || ''}
            onChange={handleInputChange}
            onKeyDown={e => {
              if (e.key === 'Enter') e.preventDefault()
            }}
            className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          />
        </Autocomplete>
      </div>
    </div>
  )
}

export default CountrySelect
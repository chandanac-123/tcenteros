import { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'

const StateSelect = ({ country, value, onChange, label }) => {
  const autocompleteRef = useRef(null)

  const countryCode =
    typeof country === 'string' ? country.toLowerCase() : undefined

  const onLoad = autocomplete => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace()

    if (!place || !place.address_components) return

    let state = ''

    place.address_components.forEach(component => {
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name
      }
    })

    onChange(state)
  }

  return (
    <div>
      {label && <label className='block mb-1 text-sm font-normal text-textblack'>{label}</label>}
      <div
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['(regions)'],
            ...(countryCode && {
              componentRestrictions: {
                country: countryCode
              }
            })
          }}
        >
          <input
            type='text'
            placeholder='Search State'
            defaultValue={value || ''}
            onKeyDown={e => {
              if (e.key === 'Enter') e.preventDefault()
            }}
            className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm disabled:opacity-50'
          />
        </Autocomplete>
      </div>
    </div>
  )
}

export default StateSelect

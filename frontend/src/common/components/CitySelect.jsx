import { useRef } from 'react'
import { Autocomplete } from '@react-google-maps/api'

const CitySelect = ({ value, onChange, label, icon, country="IN" }) => {
  const autocompleteRef = useRef(null)

  const onLoad = autocomplete => {
    autocompleteRef.current = autocomplete
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace()
    if (!place || !place.address_components) return

    let city = ''
    let state = ''
    let selectedCountry = ''

    place.address_components.forEach(component => {
      const types = component.types

      // ✅ Better city detection priority
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
      city = place.name //  VERY IMPORTANT (Coorg comes here)
    }
    onChange({
      city,
      state,
      country: selectedCountry
    })
  }

  const hasIcon = !!icon
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
            types: ['(cities)'],
            ...(country && {
              componentRestrictions: {
                country: country.toLowerCase()
              }
            })
          }}
        >
          {hasIcon ? (
            <div className='flex items-center relative rounded-lg '>
              <span className='absolute  left-3 flex items-center text-gray-400'>
                {icon}
              </span>
              <input
                type='text'
                placeholder='Search City'
                defaultValue={value || ''}
                onKeyDown={e => {
                  if (e.key === 'Enter') e.preventDefault()
                }}
                className='flex pl-10 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm'
              />
            </div>
          ) : (
            <input
              type='text'
              placeholder='Search City'
              defaultValue={value || ''}
              onKeyDown={e => {
                if (e.key === 'Enter') e.preventDefault()
              }}
              className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm'
            />
          )}
        </Autocomplete>
      </div>
    </div>
  )
}

export default CitySelect

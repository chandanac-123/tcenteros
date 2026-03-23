import { useState } from 'react'
import CustomeSelect from '@common/components/CustomeSelect'

const stateMap = {
  KL: 'Kerala',
  TN: 'Tamil Nadu',
  KA: 'Karnataka',
  MH: 'Maharashtra'
  // add more if needed
}

const CitySelect = ({ country = 'IN', state, value, onChange }) => {
  const [places, setPlaces] = useState([])

  const fetchPlaces = input => {
    if (!input || input.length < 2) {
      setPlaces([])
      return
    }

    if (!window.google || !window.google.maps) return

    const service = new window.google.maps.places.AutocompleteService()

    const stateName = stateMap[state] || ''

    service.getPlacePredictions(
      {
        input: stateName ? `${input} ${stateName}` : input, // 🔥 filter by state
        types: ['(cities)'],
        componentRestrictions: { country: country.toLowerCase() }
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          // ✅ Extract only city names + remove duplicates
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
      label="City"
      placeholder="Search City"
      options={places}
      value={value}
      search={true}
      disabled={!state}
      onSearch={fetchPlaces} // 🔥 dynamic Google search
      onChange={val => onChange(val)}
    />
  )
}

export default CitySelect


// import { useState } from 'react'

// const CitySelect = ({ value, onChange }) => {
//   const [input, setInput] = useState('')
//   const [places, setPlaces] = useState([])
//   const [showDropdown, setShowDropdown] = useState(false)

//   const fetchPlaces = input => {
//     if (!input || input.length < 2) {
//       setPlaces([])
//       return
//     }

//     if (!window.google || !window.google.maps) return

//     const service = new window.google.maps.places.AutocompleteService()

//     service.getPlacePredictions(
//       {
//         input,
//         types: ['(cities)'], // 🔥 only cities
//         componentRestrictions: { country: 'in' }
//       },
//       (predictions, status) => {
//         if (
//           status === window.google.maps.places.PlacesServiceStatus.OK &&
//           predictions
//         ) {
//           // ✅ Extract ONLY city name + remove duplicates
//           const uniqueCities = [
//             ...new Map(
//               predictions.map(p => {
//                 const city = p.terms?.[0]?.value || p.description
//                 return [city, { id: p.place_id, name: city }]
//               })
//             ).values()
//           ]

//           setPlaces(uniqueCities)
//           setShowDropdown(true)
//         } else {
//           setPlaces([])
//         }
//       }
//     )
//   }

//   return (
//     <div className="relative w-full">
//       {/* 🔍 Input */}
//       <input
//         type="text"
//         placeholder="Search City"
//         value={input || value}
//         className="border p-2 w-full rounded-md"
//         onChange={e => {
//           setInput(e.target.value)
//           fetchPlaces(e.target.value)
//         }}
//         onFocus={() => setShowDropdown(true)}
//       />

//       {/* 📍 Dropdown */}
//       {showDropdown && places.length > 0 && (
//         <ul className="absolute z-50 bg-white border w-full mt-1 max-h-60 overflow-y-auto rounded shadow">
//           {places.map(place => (
//             <li
//               key={place.id}
//               className="p-2 hover:bg-gray-100 cursor-pointer"
//               onClick={() => {
//                 onChange(place.name) // 🔥 send to Formik
//                 setInput(place.name)
//                 setShowDropdown(false)
//               }}
//             >
//               {place.name}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   )
// }

// export default CitySelect
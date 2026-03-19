

import { State } from 'country-state-city'
import CustomeSelect from '@common/components/CustomeSelect'

const StateSelect = ({ country, value, onChange }) => {
  const states = country
    ? State.getStatesOfCountry(country)
    : []

  return (
    <CustomeSelect
      label='State'
      placeholder='State'
      options={states.map(s => ({
        id: s.isoCode,
        name: s.name
      }))}
      value={value}
      search
      disabled={!country}
      onChange={val => onChange(val)}
    />
  )
}

export default StateSelect
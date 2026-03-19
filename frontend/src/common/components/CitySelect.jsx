import { City } from 'country-state-city'
import CustomeSelect from '@common/components/CustomeSelect'

const CitySelect = ({ country, state, value, onChange }) => {
  const cities =
    country && state
      ? City.getCitiesOfState(country, state)
      : []

  return (
    <CustomeSelect
      label='City'
      placeholder='City'
      options={cities.map(c => ({
        id: c.name,
        name: c.name
      }))}
      value={value}
      search
      disabled={!state}
      onChange={val => onChange(val)}
    />
  )
}

export default CitySelect
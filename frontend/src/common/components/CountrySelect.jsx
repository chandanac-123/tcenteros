import { Country } from 'country-state-city'
import CustomeSelect from '@common/components/CustomeSelect'

const CountrySelect = ({ value, onChange }) => {
  const countries = Country.getAllCountries()

  return (
    <CustomeSelect
      label='Country'
      placeholder='Country'
      options={countries.map(c => ({
        id: c.isoCode,
        name: c.name
      }))}
      value={value}
      search
      onChange={val => onChange(val)}
    />
  )
}

export default CountrySelect
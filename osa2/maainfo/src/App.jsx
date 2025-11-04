import { useState, useEffect } from 'react'
import axios from 'axios'
import CountryInfo from './components/CountryInfo'
import CountryList from './components/CountryList'

function App() {
  const [filter, setFilter] = useState('')
  const [allCountries, setAllCountries] = useState([])
  const [countries, setCountries] = useState([])
  const [countryDetails, setCountryDetails] = useState(null)

  // Get all country names from API and save in state; don't want to perform constant API calls
  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        const countryNames = response.data.map(country => country.name.common)
        setAllCountries(countryNames)
      })
  }, [])

  // Perform API call to get entire country object if filtered down to 1 country
  useEffect(() => {
    if (countries.length === 1) {
      const currentCountry = countries[0]
      let lat, lon, country

      setCountryDetails(null)

      axios
        .get(`https://studies.cs.helsinki.fi/restcountries/api/name/${currentCountry}`)
        .then(response => {
          country = response.data
          lat = country.capitalInfo.latlng[0]
          lon = country.capitalInfo.latlng[1]
        })
        .then(() => {
          const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`
          axios
            .get(weatherApiUrl)
            .then(response => {
              const combinedData = {...country, weather: response.data.current}
              setCountryDetails(combinedData)
            })
            .catch(error => console.log(`Some error occurred, most likely a weather API error. API has changed or allowed calls have been used up.`))
        })
    }
    else {
      setCountryDetails(null)
    }
  }, [countries])

  const handleFilter = (newFilter) => {
    setFilter(newFilter)

    if (newFilter.trim() === '') {
      setCountries([])
    }
    else {
      setCountries(allCountries.filter(country => country.toLowerCase().includes(newFilter.toLowerCase())))
    }
  }

  const handleShowCountry = (country) => {
    setCountries([country])
  }

  const renderCountryContent = () => {
    const searchResultsLength = countries.length

    if (searchResultsLength > 10) {
      return <p>Too many matches, specify another filter</p>
    }

    if (searchResultsLength > 1 && searchResultsLength <= 10) {
      return <CountryList countries={countries} onShowClick={handleShowCountry} />
    }

    if (searchResultsLength === 1) {
      if (countryDetails) return <CountryInfo country={countryDetails} />
      else return null
    }

    if (searchResultsLength === 0) {
      return <p>No results found</p>
    }

    // Default fallback behavior
    return null
  }

  return (
    <div>
      find countries <input value={filter} onChange={(event) => handleFilter(event.target.value)} />

      {filter.trim() === '' ? (
        null
      ) : (
        renderCountryContent()
      )}
    </div>
  )
}

export default App

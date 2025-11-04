const CountryInfo = ({ country }) => {
    return (
        <div>
            <h2>{country.name.common}</h2>
            <p>Capital city: {country.capital[0]}</p>
            <p>Area: {country.area}</p>
            <h2>Languages</h2>
            <ul>
                {Object.values(country.languages).map(language => 
                    <li key={language}>{language}</li>
                )}
            </ul>
            <img
            style={{ boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)' }}
            src={country.flags.png} 
            alt={country.flags.alt}
            />

            <h2>Weather in {country.capital[0]}</h2>
            <p>Temperature: {country.weather.temperature_2m} °C</p>
            <p>Wind: {country.weather.wind_speed_10m} km/h</p>
        </div>
    )
}

export default CountryInfo
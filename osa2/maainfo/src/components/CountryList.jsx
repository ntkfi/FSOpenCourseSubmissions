const CountryList = ({ countries, onShowClick }) => {
    return (
        <div>
            {countries.map(country => 
                <div key={country}>
                    <span>{country}</span>
                    <button onClick={() => onShowClick(country)}>Show</button>
                    <br />
                </div>
            )}
        </div>
    )
}

export default CountryList
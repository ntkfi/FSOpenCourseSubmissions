const FilterField = ({ filter, setFilter }) => {
    return (
        <div>
            Filter results <input value={filter} onChange={(event) => setFilter(event.target.value)} />
        </div>
    )
}

export default FilterField
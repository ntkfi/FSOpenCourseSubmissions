const Contact = ({ person, handleDelete }) => {
    return (
        <div style={{marginBottom: '10px'}}>
            <span style={{marginRight : '10px'}}>{person.name} {person.number}</span>
            <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
        </div>
    )
}

const Contacts = ({ filter, persons, filteredPersons, handleDelete }) => {
    return (
        <div>
            <h2>Contacts</h2>
            {filter ? (
                filteredPersons.map(person => <Contact key={person.name} person={person} handleDelete={handleDelete} />)
            ) : (
                persons.map(person => <Contact key={person.name} person={person} handleDelete={handleDelete} />)
            )}
        </div>
    )
}

export default Contacts
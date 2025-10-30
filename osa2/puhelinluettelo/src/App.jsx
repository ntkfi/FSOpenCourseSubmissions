import { useState } from 'react'

const FilterField = ({ filter, setFilter }) => {
  return (
  <div>
    Filter results <input value={filter} onChange={(event) => setFilter(event.target.value)} />
  </div>
  )
}

const NewContact = ({ handleSubmit, newName, setNewName, newNumber, setNewNumber }) => {
  return (
    <div>
      <h2>Add a new contact</h2>
      <form onSubmit={handleSubmit}>
        <div>
          name: <input value={newName} placeholder='Enter name...' onChange={(event) => setNewName(event.target.value)} />
        </div>
        <div>
          number:<input value={newNumber} placeholder='(Optional)' onChange={(event) => setNewNumber(event.target.value)} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>    
  )
}

const Contacts = ({ filter, persons, filteredPersons }) => {
  return (
    <div>
      <h2>Contacts</h2>
      {filter ? (
        filteredPersons.map(person => <p key={person.name}>{person.name} {person.number}</p>)
      ) : (
        persons.map(person => <p key={person.name}>{person.name} {person.number}</p>)
      )}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (newName.trim() === '') {
      alert('Entering a name is required')
      return
    }

    const isAlreadyAdded = persons.find(person => person.name.toLowerCase() === newName.toLowerCase())
    if (isAlreadyAdded) {
      alert(`${newName} is already added to phonebook`)
      setNewName('')
      setNewNumber('')
      return
    }

    const newPerson = {name: newName, number: newNumber}
    setPersons(persons.concat(newPerson))
    setNewName('')
    setNewNumber('')
  }

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <FilterField filter={filter} setFilter={setFilter} />

      <NewContact
        handleSubmit={handleSubmit}
        newName={newName}
        setNewName={setNewName}
        newNumber={newNumber}
        setNewNumber={setNewNumber}
      />

      <Contacts persons={persons} filteredPersons={filteredPersons} filter={filter} />
    </div>
  )
}

export default App
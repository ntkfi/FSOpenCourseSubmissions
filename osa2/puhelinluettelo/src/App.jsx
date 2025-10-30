import { useState } from 'react'

const FilterField = ({ filter, setFilter }) => {
  return (
  <div>
    Filter results <input value={filter} onChange={(event) => setFilter(event.target.value)} />
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

    const isAlreadyAdded = persons.find(person => person.name === newName)
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
    person.name.toLowerCase().startsWith(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <FilterField filter={filter} setFilter={setFilter} />

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

      <h2>Contacts</h2>
      {filter ? (
        filteredPersons.map(person => <p key={person.name}>{person.name} {person.number}</p>)
      ) : (
        persons.map(person => <p key={person.name}>{person.name} {person.number}</p>)
      )}
    </div>
  )
}

export default App
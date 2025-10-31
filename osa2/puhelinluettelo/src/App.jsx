import { useState, useEffect } from 'react'
import Contacts from './components/Contacts'
import NewContact from './components/NewContact'
import FilterField from './components/FilterField'
import phonebookService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    phonebookService
      .getAllContacts()
      .then(initialContacts => {
        setPersons(initialContacts)
      })
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (newName.trim() === '') {
      alert('Entering a name is required')
      return
    }

    const existingPerson = persons.find(person => person.name.toLowerCase() === newName.toLowerCase())

    if (existingPerson) {
      if (existingPerson.number === newNumber) {
        alert(`${newName} is already added to phonebook`)
      }
      else {
        const updatedPerson = { ...existingPerson, number: newNumber }
        if (confirm(`${updatedPerson.name} is already added to phonebook, replace the old number with a new one?`)) {
          phonebookService
            .updatePhoneNumber(updatedPerson.id, updatedPerson)
            .then(returnedPerson => {
              setPersons(persons.map(person => person.id !== returnedPerson.id ? person : returnedPerson))
            })
        }
      }
      setNewName('')
      setNewNumber('')
      return
    }

    const newPerson = { name: newName, number: newNumber }
    phonebookService
      .addContact(newPerson)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
      })
  }

  const handleDelete = (id, name) => {
    if (confirm(`Delete contact ${name}?`)) {
      phonebookService
        .deleteContact(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
        })
    }
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

      <Contacts persons={persons} filteredPersons={filteredPersons} filter={filter} handleDelete={handleDelete} />
    </div>
  )
}

export default App
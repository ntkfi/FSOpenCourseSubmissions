import { useState, useEffect, useRef } from 'react'
import Contacts from './components/Contacts'
import NewContact from './components/NewContact'
import FilterField from './components/FilterField'
import Notification from './components/Notification'
import phonebookService from './services/persons'
import './index.css'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState({ message: null, type: null })
  const notificationTimeout = useRef(null)

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
      showTemporaryNotification('Entering a name is required', 'error')
      return
    }

    if (newNumber.trim() === '') {
      showTemporaryNotification('Entering a number is required', 'error')
      return
    }

    const existingPerson = persons.find(person => person.name.toLowerCase() === newName.toLowerCase())

    if (existingPerson) {
      if (existingPerson.number === newNumber) {
        showTemporaryNotification(`${newName} is already added to phonebook`, 'error')
        emptyInputFields()
      }
      else {
        const updatedPerson = { ...existingPerson, number: newNumber }
        if (confirm(`${updatedPerson.name} is already added to phonebook, replace the old number with a new one?`)) {
          phonebookService
            .updatePhoneNumber(updatedPerson.id, updatedPerson)
            .then(returnedPerson => {
              setPersons(persons.map(person => person.id !== returnedPerson.id ? person : returnedPerson))
              showTemporaryNotification(`${returnedPerson.name}'s phone number was updated`, 'success')
              emptyInputFields()
            })
            .catch(error => { // Tämä ei nyt toimi jos vaihdetaan numero "väärään muotoon" (ei läpäise validointia) - ei vaadittu että toimii tehtävissä?
              showTemporaryNotification(`${existingPerson.name} was already removed from server`, 'error')
              setPersons(persons.filter(person => person.id !== existingPerson.id))
              emptyInputFields()
            })
        }
      }
      return
    }

    const newPerson = { name: newName, number: newNumber }
    phonebookService
      .addContact(newPerson)
      .then(returnedPerson => {
        showTemporaryNotification(`${returnedPerson.name} was added to phonebook`, 'success')
        setPersons(persons.concat(returnedPerson))
        emptyInputFields()
      })
      .catch(error => {
        showTemporaryNotification(`${error.response.data.error}`, 'error')
        console.log(error.response)
      })
  }

  const handleDelete = (id, name) => {
    if (confirm(`Delete contact ${name}?`)) {
      phonebookService
        .deleteContact(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          showTemporaryNotification(`${name} was deleted from phonebook`, 'success')
        })
        .catch(error => {
          setPersons(persons.filter(person => person.id !== id))
          showTemporaryNotification(`${name} was already removed from server`, 'error')
        })
    }
  }

  const emptyInputFields = () => {
    setNewName('')
    setNewNumber('')
  }

  const showTemporaryNotification = (message, type) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current)
    }

    setNotification({ message, type })
    notificationTimeout.current = setTimeout(() => setNotification({ message: null, type: null }), 5000)
  }


  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type} />

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
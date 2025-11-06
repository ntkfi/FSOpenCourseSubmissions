import axios from 'axios'
const baseUrl = '/api/persons' // Jos käyttää JSON-serveriä niin tilalle "http://localhost:3001/persons"

const getAllContacts = () => {
    return axios.get(baseUrl).then(response => response.data)
}

const addContact = newObject => {
    return axios.post(baseUrl, newObject).then(response => response.data)
}

const updatePhoneNumber = (id, newObject) => {
    return axios.put(`${baseUrl}/${id}`, newObject).then(response => response.data)
}

const deleteContact = (id) => {
    return axios.delete(`${baseUrl}/${id}`)
}

export default { getAllContacts, addContact, updatePhoneNumber, deleteContact }
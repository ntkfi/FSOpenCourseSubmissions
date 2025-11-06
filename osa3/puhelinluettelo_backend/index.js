const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req, res) => {
  if (req.method === 'POST') {
    if (!req.body) {
      return JSON.stringify({error: 'No data sent to server'})
    }
    return JSON.stringify(req.body)
  }
  return ''
})

const customFormat = (tokens, req, res) => {
  if (req.method === 'POST') {
    return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    '- Body: ' + tokens.body(req, res)
  ].join(' ') + '\n'
  }

  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ') + '\n'
}

app.use(morgan(customFormat))

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": "1"
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": "2"
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
    }
]

const validatePostRequest = (requestBody) => {
  if (!requestBody?.name || requestBody.name.trim() === '') {
    return 'Name missing'
  }

  if (!requestBody?.number || requestBody.number.trim() === '') {
    return 'Number missing'
  }

  const nameExists = persons.some(person => person.name === requestBody.name)

  if (nameExists) {
    return 'Name must be unique'
  }

  return null
}

const generateId = () => {
    let newId
    const MAX_VAL = Number.MAX_SAFE_INTEGER

    do {
        newId = Math.floor(Math.random() * MAX_VAL)
        const newIdString = String(newId)
        const isDuplicate = persons.some(person => person.id === newIdString)

        if (!isDuplicate) {
            return newIdString
        }

    } while (true)
}

app.get('/info', (req, res) => {
    const date = new Date()
    const currentTime = date.toString()
    const numberOfPersons = persons.length

    res.send(`
        <p>Phonebook has info for ${numberOfPersons} people</p>
        <p>${currentTime}</p>`
    )
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(person => person.id === id)
  
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  const validationError = validatePostRequest(body)

  if (validationError) {
    return res.status(400).json({
        error: validationError
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
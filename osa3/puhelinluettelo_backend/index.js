require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

const morgan = require('morgan')

app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (req, res) => {
  if (req.method === 'POST') {
    if (!req.body) {
      return JSON.stringify({ error: 'No data sent to server' })
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
    "name": "Using hardcoded data",
    "number": "111111",
    "id": "1"
  }
]

const validatePostRequest = (requestBody) => {
  if (!requestBody?.name || requestBody.name.trim() === '') {
    return Promise.resolve('Name missing')
  }

  if (!requestBody?.number || requestBody.number.trim() === '') {
    return Promise.resolve('Number missing')
  }

  return Person.findOne({ name: requestBody.name })
    .then(nameExists => {
      if (nameExists) {
        return 'Name is already in phonebook'
      }
      return null
    })
}

// const generateId = () => {
//   let newId
//   const MAX_VAL = Number.MAX_SAFE_INTEGER
// 
//   do {
//     newId = Math.floor(Math.random() * MAX_VAL)
//     const newIdString = String(newId)
//     const isDuplicate = persons.some(person => person.id === newIdString)
// 
//     if (!isDuplicate) {
//       return newIdString
//     }
// 
//   } while (true)
// }

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
  Person.find({}).then(personsmongo => {
    res.json(personsmongo)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  validatePostRequest(body)
    .then(validationError => {
      if (validationError) {
        return res.status(400).json({
          error: validationError
        })
      } else {
        const person = new Person({
          name: body.name,
          number: body.number
          // id: generateId()
        })
        person.save().then(savedPerson => {
          res.json(savedPerson)
        })
      }
    })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// TODO:
// 3. korjaa poisto
// 4. korjaa /info sivu
// 5. poista lokaali persons-objekti
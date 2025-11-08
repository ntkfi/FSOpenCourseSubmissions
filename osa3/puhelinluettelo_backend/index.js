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

app.get('/info', (req, res) => {
  const date = new Date()
  const currentTime = date.toString()

  Person.countDocuments({})
    .then(count => {
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${currentTime}</p>
        `)
    })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
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
    .catch(error => next(error))
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
        })
        person.save().then(savedPerson => {
          res.json(savedPerson)
        })
      }
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number} = req.body

  Person.findById(req.params.id)
    .then(person => {
      if (!person) {
        return res.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then(updatedPerson => {
        res.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
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
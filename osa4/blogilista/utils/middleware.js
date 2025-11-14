const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send( {error: 'Malformed request - Make sure blog title and URL are added'} )
  } 
    
  next(error)
}

module.exports = { unknownEndpoint, errorHandler }
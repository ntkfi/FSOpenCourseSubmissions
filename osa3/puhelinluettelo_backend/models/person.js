const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)
  .then(result => console.log('connected to mongoDB'))
  .catch(error => console.log('error connecting to mongoDB:', error.message))

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema, 'persons')

// if (newName && newNumber) {
//   const person = new Person({
//     name: newName,
//     number: newNumber,
//     })
//     
//     person.save().then(result => {
//       console.log(`Added ${newName} number ${newNumber} to phonebook`)
//         mongoose.connection.close()
//       })
// } else {
//     Person.find({}).then(persons => {
//       console.log("Phonebook:")
//         persons.forEach(p => {console.log(`${p.name} ${p.number}`)})
//         mongoose.connection.close()
//     })
// }
// 
// const Person = mongoose.model('Person', personSchema, 'persons')
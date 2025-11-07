const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const newName = process.argv[3]
const newNumber = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.9m2uyzu.mongodb.net/phonebookApp?appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema, 'persons')

if (newName && newNumber) {
    const person = new Person({
      name: newName,
      number: newNumber,
    })

    person.save().then(result => {
        console.log(`Added ${newName} number ${newNumber} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Person.find({}).then(persons => {
        console.log("Phonebook:")
        persons.forEach(p => {console.log(`${p.name} ${p.number}`)})
        mongoose.connection.close()
    })
}


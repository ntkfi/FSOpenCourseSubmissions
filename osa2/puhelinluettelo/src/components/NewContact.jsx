const NewContact = ({ handleSubmit, newName, setNewName, newNumber, setNewNumber }) => {
    return (
        <div>
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
        </div>
    )
}

export default NewContact
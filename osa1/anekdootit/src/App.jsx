import { useState } from 'react'

const Anecdote = ({ anecdote }) => <h2 style={{ fontWeight: 'normal' }}>{anecdote}</h2>

const Votes = ({ selectedVotes }) => <p>has {selectedVotes} votes</p>

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when dianosing patients.',
    'The only way to go fast, is to go well.'
  ]
   
  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(new Uint8Array(anecdotes.length))

  const maxVotes = Math.max(...votes)
  const topAnecdoteIndex = votes.indexOf(maxVotes)

  const getRandomInt = (max) => Math.floor(Math.random() * max)

  const handleNextAnecdote = () => setSelected(getRandomInt(anecdotes.length))

  const addVote = () => {
    const newVotes = [...votes]
    newVotes[selected] += 1
    setVotes(newVotes)
  }

  return (
    <div>
      <h1>Anecdote of the day</h1>

      <Anecdote anecdote={anecdotes[selected]} />
      <Votes selectedVotes={votes[selected]} />
      <button onClick={addVote}>Vote</button>
      <button onClick={handleNextAnecdote}>Next anecdote</button>

      <h1>Anecdote with most votes</h1>
      {maxVotes === 0 ? (
        <p>No votes yet! Please vote!</p>
      ) : (
        <>
          <Anecdote anecdote={anecdotes[topAnecdoteIndex]} />
          <Votes selectedVotes={maxVotes} />
        </>
      )}
    </div>
  )
}

export default App
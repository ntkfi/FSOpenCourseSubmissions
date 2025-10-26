import { useState } from 'react'

const Statistics = ({ good, neutral, bad}) => {
  const total = good + neutral + bad

  if (total === 0) {
    return (
      <div>
        <p>No feedback given</p>
      </div>
    )
  }

  return (
    <div>
      <Statisticline text={'good'} statistic={good} />
      <Statisticline text={'neutral'} statistic={neutral} />
      <Statisticline text={'bad'} statistic={bad} />
      <Statisticline text={'all'} statistic={total} />
      <Statisticline text={'average'} statistic={(good - bad) / total} />
      <Statisticline text={'positive'} statistic={good / total + ' %'} />
    </div>
  )
}

const Statisticline = ({ text, statistic }) => <p>{text} {statistic}</p>

const Button = ({ onClick, text}) => <button onClick={onClick}>{text}</button>

const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>give feedback</h1>

      <Button onClick={() => setGood(good + 1)} text='good' />
      <Button onClick={() => setNeutral(neutral + 1)} text='neutral' />
      <Button onClick={() => setBad(bad+ 1)} text='bad' />

      <h1>statistics</h1>
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App
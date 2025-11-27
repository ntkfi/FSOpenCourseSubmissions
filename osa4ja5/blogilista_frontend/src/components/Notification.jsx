const Notification = ({ message, type }) => {
  if (!message || !type) return null

  return (
    <div className={type}>
      {message}
    </div>
  )
}

export default Notification
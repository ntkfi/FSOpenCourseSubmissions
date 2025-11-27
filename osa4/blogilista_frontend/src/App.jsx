import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newLikes, setNewLikes] = useState("");
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: null, type: null })
  const notificationTimeout = useRef(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('loggedUser')
    if (loggedUser) {
      const user = JSON.parse(loggedUser)
      setUser(user)
    }
  }, [])

  const showTemporaryNotification = (message, type) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current)
    }

    setNotification({ message, type })
    notificationTimeout.current = setTimeout(() => setNotification({ message: null, type: null }), 5000)
  }

  const handleLogin = async event => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      showTemporaryNotification('Wrong credentials', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedUser')
    setUser(null)
  }

  const handleAddBlog = () => {
    // ...
  }

  if (user === null) {
    return (
      <div>
        <Notification message={notification.message} type={notification.type} />
        <h2>Log in to application</h2>
        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div>
      <h2>Blogs</h2>
      <span>{user.name} logged in</span> <button type="button" onClick={() => handleLogout()}>Logout</button><br /><br />

      <BlogForm
        title={newTitle}
        author={newAuthor}
        url={newUrl}
        likes={newLikes}
        setTitle={setNewTitle}
        setAuthor={setNewAuthor}
        setUrl={setNewUrl}
        setLikes={setNewLikes}
        handleAddBlog={handleAddBlog}
      />

      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App
// TODO:
// 1. Luo Blogi-formi
// 2. Luo handleBlogSubmit vai mikä onkaan nimi ehkä addBlog?
// 3. Näytä vain käyttäjän omat blogit
// 4. Notifikaatiot
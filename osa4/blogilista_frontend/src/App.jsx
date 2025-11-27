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
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: '',
    likes: ''
  })
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
      blogService.setToken(user.token)
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
      blogService.setToken(user.token)
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

  const handleBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog({ ...newBlog, [name]: value })
  }

  const handleAddBlog = async event => {
    event.preventDefault()

    const { title, author, url, likes } = newBlog

    if (title.trim() === '' || url.trim() === '') {
      showTemporaryNotification('Title and URL are required fields', 'error')
      return
    }

    let parsedLikes = Number(likes)
    if (likes.trim() === '') {
      parsedLikes = 0
    } else if (isNaN(parsedLikes)) {
      showTemporaryNotification('Likes must be a valid number', 'error')
      return
    }

    const blogObject = { title, author, url, likes: parsedLikes }

    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setNewBlog({ title: '', author: '', url: '', likes: '' })
      showTemporaryNotification('New blog added', 'success')
    } catch {
      showTemporaryNotification('Error adding blog', 'error')
    }
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
      <Notification message={notification.message} type={notification.type} />
      <span>{user.name} logged in</span> <button type="button" onClick={handleLogout}>Logout</button><br /><br />
      <BlogForm
        blog={newBlog}
        handleBlogChange={handleBlogChange}
        handleAddBlog={handleAddBlog}
      />
      <hr />
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App
// TODO:
// 1. Näytä vain käyttäjän omat blogit
// 2. Paranna uuden blogin lisäysnotifikaatiota (blogin nimi + tekijä)
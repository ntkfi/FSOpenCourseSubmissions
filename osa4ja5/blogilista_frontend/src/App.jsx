import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const blogFormRef = useRef(null)
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

  const validateBlog = (blogObject) => {
    if (blogObject.title.trim() === '' || blogObject.url.trim() === '') {
      return { errorMessage: 'Title and URL are required fields' }
    }

    const parsedLikes = Number(blogObject.likes)
    if (blogObject.likes.trim() === '') {
      return { likes: 0 }
    } else if (isNaN(parsedLikes)) {
      return { errorMessage: 'Likes must be a valid number' }
    }

    return { likes: parsedLikes }
  }

  const handleAddBlog = async (blogObject) => {
    const validationResult = validateBlog(blogObject)
    if (validationResult.errorMessage) {
      showTemporaryNotification(validationResult.errorMessage, 'error')
      return null
    }

    const parsedBlogObject = { title: blogObject.title, author: blogObject.author, url: blogObject.url, likes: validationResult.likes }

    try {
      const returnedBlog = await blogService.create(parsedBlogObject)
      blogFormRef.current.toggleVisibility()
      setBlogs(blogs.concat({ ...returnedBlog, user }))
      if (returnedBlog.author) {
        showTemporaryNotification(`New blog '${returnedBlog.title}' by ${returnedBlog.author} added`, 'success')
      } else {
        showTemporaryNotification(`New blog '${returnedBlog.title}' added`, 'success')
      }
      return returnedBlog
    } catch {
      showTemporaryNotification('Error adding blog', 'error')
      return null
    }
  }

  const handleDeleteBlog = async id => {
    try {
      await blogService.remove(id)
      const deletedBlog = blogs.find(b => b.id === id)
      setBlogs(blogs.filter(b => b.id !== id))
      showTemporaryNotification(`Deleted blog '${deletedBlog.title}'`, 'success')
    } catch {
      showTemporaryNotification('Deleting blog failed, check if token expired and re-log', 'error')
    }
  }

  const handleAddLike = async (id, updatedLikesObject) => {
    try {
      const returnedBlog = await blogService.update(id, updatedLikesObject)
      setBlogs(blogs.map(b => b.id === returnedBlog.id ? { ...returnedBlog, user: b.user } : b))
    } catch {
      showTemporaryNotification('Something went wrong while adding like', 'error')
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
      <Togglable buttonLabel='Create new blog' ref={blogFormRef}>
        <BlogForm createBlog={handleAddBlog} />
      </Togglable>
      {[...blogs]
        .sort((b1, b2) => b2.likes - b1.likes)
        .map(blog =>
          <Blog key={blog.id} blog={blog} loggedUserId={user.id} handleAddLike={handleAddLike} handleDeleteBlog={handleDeleteBlog} />
        )}
    </div>
  )
}

export default App
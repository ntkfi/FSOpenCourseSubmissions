import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: '',
    likes: ''
  })

  const handleAddBlog = async (event) => {
    event.preventDefault()
    const result = await createBlog({
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url,
      likes: newBlog.likes
    })
    if (result) {
      setNewBlog({ title: '', author: '', url: '', likes: '' })
    }
  }

  return (
    <div>
      <h2>Create new blog</h2>
      <form onSubmit={handleAddBlog}>
        <div>
          <label>
                        Title&nbsp;
            <input
              type="text"
              name="title"
              value={newBlog.title}
              onChange={(event) => setNewBlog({ ...newBlog, [event.target.name]: event.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
                        Author&nbsp;
            <input
              type="text"
              name="author"
              value={newBlog.author}
              onChange={(event) => setNewBlog({ ...newBlog, [event.target.name]: event.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
                        URL&nbsp;
            <input
              type="text"
              name="url"
              value={newBlog.url}
              onChange={(event) => setNewBlog({ ...newBlog, [event.target.name]: event.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
                        Likes&nbsp;
            <input
              type="text"
              name="likes"
              value={newBlog.likes}
              onChange={(event) => setNewBlog({ ...newBlog, [event.target.name]: event.target.value })}
            />
          </label>
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

export default BlogForm
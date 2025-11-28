import { useState } from 'react'
import '../index.css'

const Blog = ({ blog, loggedUserId, handleAddLike, handleDeleteBlog }) => {
  const [showAll, setShowAll] = useState(false)

  const addLike = () => {
    const newLikes = blog.likes + 1
    handleAddLike(blog.id, { likes: newLikes })
  }

  const deleteBlog = () => {
    if (window.confirm(`Delete '${blog.title}'?`)) {
      handleDeleteBlog(blog.id)
    }
  }

  if (showAll) {
    return (
      <div className='expandedblog'>
        <p>Blog name: {blog.title}<button type="button" onClick={() => setShowAll(!showAll)}>Hide</button></p>
        <p>Author: {blog.author ? blog.author : 'Unknown'}</p>
        <p>Url: {blog.url}</p>
        <p>Likes: {blog.likes}<button type="button" onClick={addLike}>Like</button></p>
        <p>Added by: {blog.user.name}</p>
        {blog.user.id === loggedUserId ? <button type="button" style={{ marginBottom: '1em' }} onClick={deleteBlog}>Remove blog</button> : null}
      </div>
    )
  }

  return (
    <div>
      {blog.title} by {blog.author ? blog.author : 'Unknown'}
      &nbsp;
      <button type="button" onClick={() => setShowAll(!showAll)}>View more</button>
    </div>
  )
}

export default Blog
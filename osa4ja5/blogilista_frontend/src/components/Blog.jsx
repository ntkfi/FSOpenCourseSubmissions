import { useState } from 'react'
import '../index.css'

const Blog = ({ blog }) => {
  const [showAll, setShowAll] = useState(false)

  if (showAll) {
    return (
      <div className='expandedblog'>
        <p>Blog name: {blog.title}<button type="button" onClick={() => setShowAll(!showAll)}>Hide</button></p>
        <p>Author: {blog.author ? blog.author : 'Unknown'}</p>
        <p>Url: {blog.url}</p>
        <p>Likes: {blog.likes}<button type="button" onClick={() => window.alert('LOL!!!')}>Like</button></p>
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
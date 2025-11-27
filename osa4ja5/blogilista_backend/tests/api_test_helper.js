const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Understanding Async/Await in JavaScript',
    author: 'Jane Doe',
    url: 'https://example.com/async-await-guide',
    likes: 12
  },
  {
    title: 'A Practical Introduction to Node.js Streams',
    author: 'John Smith',
    url: 'https://example.com/node-streams',
    likes: 7
  },
  {
    title: 'Optimizing MongoDB Queries for Performance',
    author: 'Alex Rivera',
    url: 'https://example.com/mongodb-optimization',
    likes: 25
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', url: 'www.example.com' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const blogs_of_users = async () => {
  const users = await User.find({})
  const blogs_of_users = []
  for (const user of users) {
    blogs_of_users.push(user.blogs)
  }
  return blogs_of_users.flat()
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  blogs_of_users
}
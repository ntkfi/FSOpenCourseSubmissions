const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "Understanding Async/Await in JavaScript",
        author: "Jane Doe",
        url: "https://example.com/async-await-guide",
        likes: 12
    },
    {
        title: "A Practical Introduction to Node.js Streams",
        author: "John Smith",
        url: "https://example.com/node-streams",
        likes: 7
    },
    {
        title: "Optimizing MongoDB Queries for Performance",
        author: "Alex Rivera",
        url: "https://example.com/mongodb-optimization",
        likes: 25
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb
}
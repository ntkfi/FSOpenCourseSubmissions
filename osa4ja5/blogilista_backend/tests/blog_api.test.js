const assert = require('node:assert')
const { test, after, describe, before, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const helper = require('./api_test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const api = supertest(app)

describe('user tests', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', name: 'admin', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'valov',
      name: 'Ville Valo',
      password: 'secret',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails without username', async () => {
    const newUserWithoutUsername = {
      name: 'Test User',
      password: 'ValidPassword123'
    }

    const response = await api
      .post('/api/users')
      .send(newUserWithoutUsername)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(response.body.error.includes('Path `username` is required'))
  })

  test('creation fails without password', async () => {
    const newUserWithoutPassword = {
      username: 'testguy54',
      name: 'Test User'
    }

    const response = await api
      .post('/api/users')
      .send(newUserWithoutPassword)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(response.body.error.includes('Password is required'))
  })
})

describe('blog tests', () => {
  let testUser = null
  let token = null

  before(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', name: 'admin', passwordHash })
    testUser = await user.save()
    const userForToken = { username: testUser.username, id: testUser._id, }
    token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '5m' })
  })

  beforeEach(async () => {
    await Blog.deleteMany({})

    testUser = await User.findById(testUser._id)

    const blogsWithUser = helper.initialBlogs.map(blog => ({
      ...blog,
      user: testUser._id
    }))

    const savedBlogs = await Blog.insertMany(blogsWithUser)

    testUser.blogs = savedBlogs.map(blog => blog._id)
    await testUser.save()
  })

  describe('fetching blogs when some have been added already', () => {
    test('blogs are returned as JSON', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned with GET', async () => {
      const response = await api.get('/api/blogs')

      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('returned blogs have a field named "ID"', async () => {
      const response = await api.get('/api/blogs')

      const firstBlog = response.body[0]

      assert(firstBlog.id)
      assert.strictEqual(firstBlog._id, undefined)
    })

    test('returned blogs contain the user who created them', async () => {
      const response = await api.get('/api/blogs')

      const firstBlog = response.body[0]

      assert(mongoose.Types.ObjectId.isValid(firstBlog.user.id))
    })
  })

  describe('adding new blogs', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'POST can be used to add new blogs',
        author: 'Postmaster123',
        url: 'www.example.com',
        likes: 3,
      }

      const savedBlog = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const savedBlog_id = savedBlog.body.id
      const savedBlog_user = savedBlog.body.user

      const response = await api.get('/api/blogs')
      const titles = response.body.map(r => r.title)
      const blogs_of_users = await helper.blogs_of_users()

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      assert(titles.includes('POST can be used to add new blogs'))
      assert(blogs_of_users.toString().includes(savedBlog_id))
      assert(savedBlog_user.toString().includes(testUser._id.toString()))
    })

    test('if no likes are added, defaults to 0', async () => {
      const newBlog = {
        title: 'Where are the likes at',
        author: 'Like Mike',
        url: 'www.example.com/likes',
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      const response = await api.get('/api/blogs')

      assert.strictEqual(response.body.at(-1).likes, 0)
      assert.strictEqual(response.body.at(-1).title, 'Where are the likes at')
    })

    test('respond with status 400 if no title or url in new blog', async () => {
      const blogWithoutTitle = {
        author: 'No Title',
        url: 'www.example.com'
      }

      const blogWithoutUrl = {
        title: 'This blog has no title',
        author: 'No URL'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutTitle)
        .expect(400)

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutUrl)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog can\'t be added without token', async () => {
      const newBlog = {
        title: 'POST can be used to add new blogs',
        author: 'Postmaster123',
        url: 'www.example.com',
        likes: 3,
      }

      const post_response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      assert(post_response.body.error.includes('token invalid'))

      const get_response = await api.get('/api/blogs')

      assert.strictEqual(get_response.body.length, helper.initialBlogs.length)
    })
  })

  describe('deleting blogs', () => {
    test('a blog can be deleted', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.titles)
      const blogs_of_users = await helper.blogs_of_users()

      assert(!titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      assert(!blogs_of_users.toString().includes(blogToDelete.id))
    })

    test('can\'t delete someone else\'s blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      const passwordHash = await bcrypt.hash('secret', 10)
      const newUser = new User({
        username: 'faker',
        name: 'Fake for Token',
        passwordHash
      })

      const fakeUser = await newUser.save()
      const faketoken = jwt.sign({ username: fakeUser.username, id: fakeUser._id }, process.env.SECRET, { expiresIn: '5m' })

      const response = await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${faketoken}`)
        .expect(401)

      assert(response.body.error.includes('blog not written by token owner, can\'t delete'))
    })

    test('malformatted id returns 400', async () => {
      const malformattedId = 'xyz'
      await api
        .delete(`/api/blogs/${malformattedId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('updating blogs', () => {
    test('a blog can be modified', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedBlog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: 999
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      const updatedBlogInDb = blogsAtEnd.find(b => b.id === blogToUpdate.id)

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

      assert(updatedBlogInDb.likes === updatedBlog.likes)
    })

    test('a blog that doesn\'t exist can\'t be updated', async () => {
      const nonExistingId = await helper.nonExistingId()
      await api
        .put(`/api/blogs/${nonExistingId}`)
        .expect(404)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('malformatted id returns 400', async () => {
      const malformattedId = 'xyz'
      await api
        .put(`/api/blogs/${malformattedId}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })
})


after(async () => {
  await mongoose.connection.close()
})
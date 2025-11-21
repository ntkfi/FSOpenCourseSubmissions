const assert = require('node:assert')
const { test, after, describe, before, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const helper = require('./api_test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

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

    before(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'root', name: 'admin', passwordHash })
        testUser = await user.save()
    })

    beforeEach(async () => {
        await Blog.deleteMany({})

        const user = await User.findById(testUser._id)

        const blogsWithUser = helper.initialBlogs.map(blog => ({
            ...blog,
            user: user._id
        }))

        const savedBlogs = await Blog.insertMany(blogsWithUser)

        user.blogs = savedBlogs.map(blog => blog._id)
        await user.save()
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
            
            assert(mongoose.Types.ObjectId.isValid(firstBlog.user.id));
        })
    })

    describe('adding new blogs', () => {
        test('a valid blog can be added', async () => {
            const newBlog = {
                title: 'POST can be used to add new blogs',
                author: 'Postmaster123',
                url: 'www.example.com',
                likes: 3,
                userId: testUser._id
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const response = await api.get('/api/blogs')

            const titles = response.body.map(r => r.title)

            assert(response.body.length, helper.initialBlogs.length + 1)

            assert(titles.includes('POST can be used to add new blogs'))
        })

        test('if no likes are added, defaults to 0', async () => {
            const newBlog = {
                title: 'Where are the likes at',
                author: 'Like Mike',
                url: 'www.example.com/likes',
                userId: testUser._id
            }

            await api
                .post('/api/blogs')
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
                .send(blogWithoutTitle)
                .expect(400)

            await api
                .post('/api/blogs')
                .send(blogWithoutUrl)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })

    })

    describe('deleting blogs', () => {
        test('a blog can be deleted', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            const titles = blogsAtEnd.map(b => b.titles)
            assert(!titles.includes(blogToDelete.title))

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
        })

        test('malformatted id returns 400', async () => {
            const malformattedId = 'xyz'
            await api
                .delete(`/api/blogs/${malformattedId}`)
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
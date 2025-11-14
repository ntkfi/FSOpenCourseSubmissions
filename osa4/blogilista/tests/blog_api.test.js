const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./blog_api_test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async() => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as JSON', async() => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned with GET', async() => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('returned blogs have a field named "ID"', async() => {
    const response = await api.get('/api/blogs')

    const firstBlog = response.body[0]
    
    assert(firstBlog.id)
    assert.strictEqual(firstBlog._id, undefined)
})

after(async() => {
    await mongoose.connection.close()
})
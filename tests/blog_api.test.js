const { test, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const assert = require('node:assert')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)


beforeEach(async () => {
    await Blog.deleteMany({})
  
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

})

test('unique identifier property of blogs is named id', async () => {
    const response = await api.get('/api/blogs');
    
    response.body.forEach(blog => {
      assert(blog.id);
    });
  });

test('there are three blogs', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, 3)
  })
  
test('a valid blog can be added', async () => {
    const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    const titles = blogsAtEnd.map(n => n.title)
    assert(titles.includes('TDD harms architecture'))
})

after(async () => {
  await mongoose.connection.close()
})
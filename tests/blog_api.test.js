const { test, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const api = supertest(app)


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
  

after(async () => {
  await mongoose.connection.close()
})
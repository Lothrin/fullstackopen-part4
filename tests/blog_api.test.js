const { test, describe, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const User = require('../models/user')
const assert = require('node:assert')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')



beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('fullstackopen', 10)
  const user = new User({ username: 'root', passwordHash })
  const user2 = new User({ username: 'root2', passwordHash })

  await user.save()
  await user2.save()


  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog({ ...blog, user: user._id })
    await blogObject.save()
    user.blogs = user.blogs.concat(blogObject._id)
  }
  await user.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

})

test('unique identifier property of blogs is named id', async () => {
    const response = await api.get('/api/blogs')
    
    response.body.forEach(blog => {
      assert(blog.id)
    })
  })

test('there are three blogs', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, 3)
  })
  
  test('a valid blog can be added', async () => {
    const token = await helper.user1Token()
  
    const newBlog = {
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) 
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  
    const titles = blogsAtEnd.map(n => n.title)
    assert(titles.includes('TDD harms architecture'))
  })
  


test('likes property missing, defaulted to 0', async () => {
  const token = await helper.user1Token()

    const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) 
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  
    const titles = blogsAtEnd.map(n => n.title)
    assert(titles.includes('TDD harms architecture'))

})

test('blog without title is not added', async () => {
const token = await helper.user1Token()

    const newBlog = {
      author: "Author without Title",
      url: "http://example.com/no-title",
      likes: 2,
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
  
  test('blog without url is not added', async () => {
    const token = await helper.user1Token()

    const newBlog = {
      title: "No URL Blog",
      author: "Author without URL",
      likes: 2,
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
  

  test('deletion of a blog', async () => {
    const token = await helper.user1Token()
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    const titles = blogsAtEnd.map(n => n.title)
    assert(!titles.includes(blogToDelete.title))
  })


  test('a blog can be successfully updated', async () => {
    const token = await helper.user1Token()
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
  
    const updatedBlogData = {
      title: "Updated Blog Title",
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 10,
    }
  
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedBlogData)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    
    assert.strictEqual(response.body.title, updatedBlogData.title)
    assert.strictEqual(response.body.likes, updatedBlogData.likes)
  
  
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
  
    assert.strictEqual(updatedBlog.title, updatedBlogData.title)
    assert.strictEqual(updatedBlog.likes, updatedBlogData.likes)
  })
  
  
  test('attempting to update a blog with an invalid id returns 404', async () => {
    const token = await helper.user1Token()
    const invalidId = '1234567890abcdef12345678'
  
    const updateData = {
      title: "Invalid ID Update Attempt",
      author: "Some Author",
      url: "http://example.com/invalid-id",
      likes: 1,
    }
  
    await api
      .put(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData)
      .expect(404)
  })

  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
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
  
    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))
  
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('short username fail with status code and message', async () => {
      const usersAtStart = await helper.usersInDb()
    
      const newUser = {
        username: 'ro', 
        name: 'Short User',
        password: 'validpassword',
      }
    
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400) 
        .expect('Content-Type', /application\/json/)
    
   
      assert(result.body.error.includes('Username must be at least 3 characters long'))
    
    
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
    
    test('missing username fail with status code and message', async () => {
      const usersAtStart = await helper.usersInDb()
    
      const newUser = {
        name: 'Missing Username User',
        password: 'validpassword',
      }
    
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400) 
        .expect('Content-Type', /application\/json/)
    
     
      assert(result.body.error.includes('Username must be at least 3 characters long'))
    
     
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
    
    test('short password fail with status code and message', async () => {
      const usersAtStart = await helper.usersInDb()
    
      const newUser = {
        username: 'validusername',
        name: 'Valid User',
        password: 'pw', 
      }
    
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400) 
        .expect('Content-Type', /application\/json/)
    
     
      assert(result.body.error.includes('Password must be at least 3 characters long'))
    
      
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
    
    test('missing password fail with status code and message', async () => {
      const usersAtStart = await helper.usersInDb()
    
      const newUser = {
        username: 'validusername',
        name: 'Missing Password User',
      }
    
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400) 
        .expect('Content-Type', /application\/json/)
    
      
      assert(result.body.error.includes('Password must be at least 3 characters long'))
    
      
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })

    describe('invalid or missing token', () => {

      test('cant create blog with missing token', async () => {
      
        const newBlog = {
          title: "TDD harms architecture",
          author: "Robert C. Martin",
          url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
          likes: 0,
        }
      
        await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(401)
      
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
      
      })

      test('only creator of blog can delete it', async () => {
        const token = await helper.user2Token()
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
    
        await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
    
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
      })
 })
 
after(async () => {
  await mongoose.connection.close()
})
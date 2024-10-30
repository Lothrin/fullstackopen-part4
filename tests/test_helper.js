const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)


const initialBlogs = [
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        user: {
          "username": "root",
          "name": "Superuser",
          "id": "6720ca0b127713449f0e2645"
        }
      },
      {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        user: {
          "username": "root2",
          "name": "Superuser2",
          "id": "6720cee519c92f83871780c8"
        }
      },
      {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        user: {
          "username": "root",
          "name": "Superuser",
          "id": "6720ca0b127713449f0e2645"
        }
      },
]

const user1Token= async () => {
  const login = {
    username: "root",
    password: "fullstackopen"
  }
  const loginResponse = await api
  .post('/api/login')
  .send(login)
  .expect(200)
  .expect('Content-Type', /application\/json/)

    return token = loginResponse.body.token
}

const user2Token = async () => {

  const login2 = {
    username: "root2",
    password: "fullstackopen"
  }

  const loginResponse = await api
  .post('/api/login')
  .send(login2)
  .expect(200)
  .expect('Content-Type', /application\/json/)

    return token = loginResponse.body.token
}


const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb, usersInDb, user2Token, user1Token
}
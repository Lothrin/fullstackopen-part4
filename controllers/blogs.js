const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
   const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
   response.json(blogs)
  })


  blogsRouter.post('/', async (request, response) => {
    const body = request.body

    const user = request.user
    if (!user) {
      return response.status(401).json({ error: 'user not authenticated' })
    }

    if (!body.title || !body.url) {
      return response.status(400).json({
        error: 'title or url missing'
      })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user.id
    })
  
    const savedBlog = await blog
      .save()
      user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
      response.status(201).json(savedBlog)
  })

 blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'user not authenticated' })
  }
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() !== user.id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete the blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

  blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  
  if (updatedBlog) {
    response.status(200).json(updatedBlog)
  } else {
    response.status(404).end()
  }
  })


  module.exports = blogsRouter
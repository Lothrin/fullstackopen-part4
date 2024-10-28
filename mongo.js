require('dotenv').config()
process.env.NODE_ENV = 'test'
const mongoose = require('mongoose');
const config = require('./utils/config');
const Blog = require('./models/blog'); 
const logger = require('./utils/logger'); 


mongoose.set('strictQuery', false)

logger.info('Connecting to', config.mongoUrl)

mongoose.connect(config.mongoUrl)
  .then(() => {
    logger.info('Connected to MongoDB')
    return addSampleBlogs();
  })
  .then(() => {
    logger.info('Closing connection');
    mongoose.connection.close();
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
    mongoose.connection.close()
  })


  const addSampleBlogs = () => {
    const sampleBlogs = [
        {
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
          },
          {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
          },
          {
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
          },
    ];
  
    return Blog.deleteMany({})
      .then(() => {
        return Blog.create(sampleBlogs);
      })
      .then(() => {
        logger.info(`Added ${sampleBlogs.length} sample Blogs to the database.`);
      })
      .catch((error) => {
        logger.error('Error adding sample Blogs:', error.message);
      });
  };

const dummy = (blogs) => {
   return 1
  }
  
const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0);
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null;
    }
  
    const favorite = blogs
      .sort((a, b) => b.likes - a.likes)[0];
  
    return {
      title: favorite.title,
      author: favorite.author,
      likes: favorite.likes,
    };
  }

 const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const blogCounts = {};

  blogs.forEach(blog => {

    if (blogCounts[blog.author]) {
      blogCounts[blog.author] += 1;
    } else {
      blogCounts[blog.author] = 1;
    }
  });

  let topAuthor = '';
  let maxBlogs = 0;

  for (const author in blogCounts) {
    if (blogCounts[author] > maxBlogs) {
      topAuthor = author;
      maxBlogs = blogCounts[author];
    }
  }
  return {
    author: topAuthor,
    blogs: maxBlogs,
  };
};

  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
  }
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
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
  }
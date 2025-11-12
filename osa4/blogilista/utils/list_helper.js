const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce(
        (accumulator, current) => accumulator + current.likes,
        0
    )
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null

    return blogs.reduce(
        (maxLikesBlog, current) =>
            current.likes > maxLikesBlog.likes ? current : maxLikesBlog
    )
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null

    const authorCounts = blogs.reduce((counts, blog) => {
        counts[blog.author] = (counts[blog.author] || 0) + 1
        return counts
    }, {})

    const topAuthor = Object.entries(authorCounts).reduce((top, current) =>
        current[1] > top[1] ? current : top
    )

    return {
        author: topAuthor[0],
        blogs: topAuthor[1]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null

    const authorLikes = blogs.reduce((sums, blog) => {
        sums[blog.author] = (sums[blog.author] || 0) + blog.likes
        return sums
    }, {})

    const topAuthor = Object.entries(authorLikes).reduce((top, current) => 
        current[1] > top[1] ? current : top
    )

    return {
        author: topAuthor[0],
        likes: topAuthor[1]
    }    
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
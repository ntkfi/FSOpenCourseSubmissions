const BlogForm = ({ blog, handleBlogChange, handleAddBlog }) => {
    return (
        <div>
            <h2>Create new blog</h2>
            <form onSubmit={handleAddBlog}>
                <div>
                    <label>
                        Title&nbsp;
                        <input
                            type="text"
                            name="title"
                            value={blog.title}
                            onChange={handleBlogChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Author&nbsp;
                        <input
                            type="text"
                            name="author"
                            value={blog.author}
                            onChange={handleBlogChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        URL&nbsp;
                        <input
                            type="text"
                            name="url"
                            value={blog.url}
                            onChange={handleBlogChange}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Likes&nbsp;
                        <input
                            type="text"
                            name="likes"
                            value={blog.likes}
                            onChange={handleBlogChange}
                        />
                    </label>
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    )
}

export default BlogForm
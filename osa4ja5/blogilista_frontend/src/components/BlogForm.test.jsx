import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('when new blog is created, callback function is called correctly', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createBlog={createBlog} />)

  const titleInput = screen.getByLabelText('Title')
  const authorInput = screen.getByLabelText('Author')
  const urlInput = screen.getByLabelText('URL')
  const likesInput = screen.getByLabelText('Likes')
  const sendButton = screen.getByText('Create')

  await user.type(titleInput, 'Test title')
  await user.type(authorInput, 'Tester')
  await user.type(urlInput, 'www.example.com/test')
  await user.type(likesInput, '5')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toStrictEqual(
    {
      title: 'Test title',
      author: 'Tester',
      url: 'www.example.com/test',
      likes: '5'
    }
  )
})
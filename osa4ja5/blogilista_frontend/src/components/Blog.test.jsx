import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title', () => {
  const blog = {
    title: 'A test',
    author: 'Tester',
    url: 'www.example.com/test',
    likes: 0,
    id: '123abc',
    user: {
      username: 'Test123',
      name: 'Test Man',
      id: '456def'
    }
  }

  render(<Blog blog={blog} />)
  const element = screen.findByText('A test')
  expect(element).toBeDefined()
})

test('when expanded renders all fields', async () => {
  const blog = {
    title: 'A test',
    author: 'Tester',
    url: 'www.example.com/test',
    likes: 0,
    id: '123abc',
    user: {
      username: 'Test123',
      name: 'Test Man',
      id: '456def'
    }
  }

  render(<Blog blog={blog} />)

  const user = userEvent.setup()
  const button = screen.getByText('View more')
  await user.click(button)

  expect(screen.getByText('Blog name: A test')).toBeInTheDocument()
  expect(screen.getByText('Author: Tester')).toBeInTheDocument()
  expect(screen.getByText('Url: www.example.com/test')).toBeInTheDocument()
  expect(screen.getByText('Likes: 0')).toBeInTheDocument()
})

test('when like button pressed twice, event handler called twice', async () => {
  const blog = {
    title: 'A test',
    author: 'Tester',
    url: 'www.example.com/test',
    likes: 0,
    id: '123abc',
    user: {
      username: 'Test123',
      name: 'Test Man',
      id: '456def'
    }
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} handleAddLike={mockHandler} />)

  const user = userEvent.setup()
  const viewMoreButton = screen.getByText('View more')
  await user.click(viewMoreButton)

  const likeButton = screen.getByRole('button', { name: 'Like' })
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})
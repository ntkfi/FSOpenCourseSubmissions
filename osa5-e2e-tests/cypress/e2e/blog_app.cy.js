describe('Blog app', function () {
  beforeEach(function () {
    cy.request('POST', '/api/testing/reset')
    const user = {
      username: "tester",
      name: "Test User",
      password: "test123"
    }
    cy.request('POST', '/api/users', user)
    cy.visit('')
  })

  it('Login form is shown', function () {
    cy.contains('Log in to application')
    cy.contains('button', 'Login')
  })

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.contains('label', 'Username').type('tester')
      cy.contains('label', 'Password').type('test123')
      cy.get('[data-cy="login-button"]').click()

      cy.contains('Test User logged in')
    })

    it('fails with wrong password', function () {
      cy.contains('label', 'Username').type('tester')
      cy.contains('label', 'Password').type('wrong')
      cy.get('[data-cy="login-button"]').click()

      cy.get('.error')
        .should('contain', 'Wrong credentials')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
        .and('have.css', 'border-style', 'solid')

      cy.contains('Matti Luukkainen logged in').should('not.exist')
    })
  })

  describe('When logged in', function () {
    beforeEach(function () {
      cy.login({ username: 'tester', password: 'test123' })
    })

    it('A blog can be created', function () {
      cy.contains('button', 'Create new blog').click()
      cy.contains('label', 'Title').type('Test blog')
      cy.contains('label', 'Author').type('Test author')
      cy.contains('label', 'URL').type('www.example.com/test')
      cy.contains('label', 'Likes').type('5')
      cy.get('[data-cy="create-button"]').click()
      cy.contains('Test blog by Test author')
    })

    describe('and several blogs have been added', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'Understanding React Hooks in 2024',
          author: 'Dan Abramov',
          url: 'https://overreacted.io/hooks-guide',
          likes: 15
        })

        cy.createBlog({
          title: 'Why I stopped using CSS and started using Telepathy',
          author: 'FullStackNinja',
          url: 'https://dev.to/ninja/css-is-hard',
          likes: 9001
        })

        cy.createBlog({
          title: 'Canonical String Reduction',
          author: 'Edsger W. Dijkstra',
          url: 'http://www.cs.utexas.edu/users/EWD/',
          likes: 0
        })
      })

      it('a blog can be liked', function () {
        cy.contains('button', 'View more').first().click()
        cy.contains('Likes: 9001')
        cy.get('.expandedblog').contains('button', 'Like').click()
        cy.contains('Likes: 9002')
      })

      it.only('the user that added blog can delete it', function () {
        cy.contains('button', 'View more').first().click()
        cy.get('.expandedblog').contains('button', 'Remove blog').click()

        cy.get('.success')
          .should('contain', 'Deleted blog \'Why I stopped using CSS and started using Telepathy\'')
          .and('have.css', 'color', 'rgb(0, 128, 0)')
          .and('have.css', 'border-style', 'solid')

        cy.get('html').should('not.contain', 'Why I stopped using CSS and started using Telepathy by FullStackNinja')
      })
    })
  })
})
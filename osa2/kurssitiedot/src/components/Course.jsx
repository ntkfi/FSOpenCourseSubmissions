const Header = ({ header }) => <h1>{header}</h1>

const Content = ({ parts }) => (
  <div>
    {parts.map(part => <Part key={part.id} part={part} />)}
  </div>
)

const Part = ({ part }) => (
  <p>
    {part.name} {part.exercises}
  </p>
)

const Total = ({ total }) => <p><b>Total number of exercises {total}</b></p>

const Course = ({ course }) => {
  return (
    <div>
      <Header header={course.name} />
      <Content parts={course.parts} />
      <Total total={course.parts.reduce((total, part) => total + part.exercises, 0)}/>
    </div>
  )
}

export default Course
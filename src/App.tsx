import './App.css'
import { Board } from './core'
import { BoardTag } from './ui/2d/BoardTag'


function App() {
  const board = Board.allPossible[Math.floor(Math.random() * Board.allPossible.length)]
  // board.isEnemy = true
  // const board = new Board()
  const points: [x: number, y: number][] = [
    ...[...Array(Board.height / 2)].map((_, y) => [...Array(Board.width)].map((_, x) => [x, y] as [number, number])).flat()
  ]
  points.map(v => board.blockAt(v).setHitted(true))
  return (
    <>
      <BoardTag board={board} width='50vw' />
    </>
  )
}

export default App

import './App.css'
import { Board } from './core'
import BoardTag from './ui/2d/BoardTag'


function App() {
  const board = Board.allPossible[Math.floor(Math.random() * Board.allPossible.length)]
  board.putPlanesOn()
  const points: [x: number, y: number][] = [
    [0, 0],
    [3, 2],
    [5, 5],
  ]
  points.map(v => board.blockAt(v).setHitted(true))
  return (
    <>
      <BoardTag board={board} />
    </>
  )
}

export default App

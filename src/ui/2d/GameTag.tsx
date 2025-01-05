import { useState, useRef, useCallback } from "react";
import { Board, BoardState, } from "../../core";
import { BoardTag } from "./BoardTag";
import './Game.scss'
import classNames from "classnames"
import { AiPlayer } from "../../core/ai"

interface GamePros {
}

enum GameState {
  Title,
  Preparing,
  Finding,
  Fighting,
  End,
}

type CustomAudio = HTMLAudioElement & {
  state: GameState|undefined, 
  file: string|undefined,
}

function playBgm(audio: CustomAudio, state: GameState) {
  audio.state = state
  if (state === GameState.Preparing) {
    audio.file = 'bgm/thinking-time.mp3'
  } else if (state === GameState.Fighting) {
    audio.file = 'bgm/Hiding In The Blue.m4a'
  }

  if (!audio.src && audio.file) {
    audio.src = audio.file
  }
  audio.volume = 0.25
  audio.preload = 'auto'
  // audio.play()
  audio.ontimeupdate = () => {
    if (audio.state === GameState.Preparing) {
      const loopStart = 34.114
      const loopEnd = 45.666
      const delta = loopEnd - loopStart
      if (audio.currentTime >= loopEnd) {
        audio.currentTime -= delta
        audio.pause()
        audio.play()
      }
    }
  }
  audio.onended = () => {
    if (audio.file !== undefined) {
      audio.src = audio.file
    }
  }
}

function GameTag () {
  const [gameState, setGameState] = useState<GameState>(GameState.Title)
  const [selfBoard, setSelfBoard] = useState<Board>(new Board())
  const [enemyBoard, setEnemyBoard] = useState<Board>(Board.pickRandomBoard())
  const [gameTurn, setGameTurn] = useState(0)
  const [enemyMovingState, setEnemyMovingState] = useState<'moved'|'moving'>('moved')
  const [,setUpdate] = useState({})
  const forceUpdate = useCallback(() => setUpdate({}), [])
  const aiPlayer = useRef(new AiPlayer())

  const audioRef = useRef<HTMLAudioElement>(null)
  if (audioRef.current) {
    playBgm(audioRef.current as CustomAudio, gameState)
  }

  if (gameState === GameState.Finding) {
    if (Board.allPossibleBoardsGenerated()) {
      setGameState(GameState.Fighting)
      aiPlayer.current.init()
    } else {
      // wait until all possible boards are generated
      setTimeout(() => {
        setUpdate({})
      }, 0)
    }
  }

  const GameTitle = useCallback(() => {
    return (
      <div>
        <h1>Plane War</h1>
        <p>Click Start to begin</p>
        <button
          onClick={() => {
            setSelfBoard(new Board())
            setGameState(GameState.Preparing)
          }}
        >Start</button>
      </div>
    )
  }, [setSelfBoard, setGameState])

  const GameOngoing = useCallback(() => {
    const enemyClassName = classNames({
      'enemy-preparing': gameState === GameState.Preparing,
      'enemy-playing': gameState !== GameState.Preparing,
    })
    const selfClassName = classNames({
      'self-preparing': gameState === GameState.Preparing,
      'self-playing': gameState !== GameState.Preparing,
    })
    return (
      <div className="board-container">
        <div className="game-control">
          {
            gameState === GameState.Preparing ? (
              <button
                onClick={() => {
                  const enemyBoard = Board.pickRandomBoard()
                  enemyBoard.isEnemy = true
                  enemyBoard.state = BoardState.Fighting
                  setEnemyBoard(enemyBoard)
                  selfBoard.state = BoardState.Over
                  aiPlayer.current.opponentBoard = selfBoard
                  setSelfBoard(selfBoard)
                  setGameState(GameState.Finding)
                }}
                disabled={!selfBoard.isLayoutReady()}
              >Ready? Go!</button>
            ) : gameState === GameState.Fighting ? (
              <label>
                Analyzing
                <input type="checkbox" onChange={(e) => {
                  enemyBoard.state = e.target.checked ? BoardState.Analyzing : BoardState.Fighting;
                  setEnemyBoard(enemyBoard)
                  setUpdate({})
                }} />
              </label>
            ) : gameState === GameState.End ? (
              <button onClick={() => setGameState(GameState.Title)}>Restart</button>
            ) : (
              <></>
            )
          }
        </div>
        <div className={enemyClassName}>
          <BoardTag board={enemyBoard} onUpdated={() => {
            // it's turn for enemy moving after self's turn
            switch (gameState) {
              case GameState.Fighting: {
                if (enemyBoard.state === BoardState.Fighting && enemyMovingState === 'moved') {
                  const turnCount = enemyBoard.blocks.flat().filter(b => b.isHitted()).length
                  setEnemyMovingState('moving')
                  aiPlayer.current.playTurn(turnCount)
                  setGameTurn(turnCount)
                  console.log('%c%s', 'color: #88f;', selfBoard.toString())
                  setEnemyMovingState('moved')
                }
                if (enemyBoard.allPlanesKilled || selfBoard.allPlanesKilled) {
                  enemyBoard.state = BoardState.Over
                  setEnemyBoard(enemyBoard)
                  setGameState(GameState.End)
                }
              }
              break
            }
          }} />
        </div>
        <div className={selfClassName}>
          <BoardTag board={selfBoard} onUpdated={gameState === GameState.Preparing ? forceUpdate : undefined} turnCount={gameTurn} />
        </div>
      </div>
    )
  }, [gameState, selfBoard, enemyBoard, forceUpdate, setEnemyBoard, setGameState, enemyMovingState, aiPlayer, gameTurn])

  return (
    <div className="game-root">
      <audio ref={audioRef} />
      {
        gameState === GameState.Title ? (
          <GameTitle />
        ) : (
          GameOngoing()
        )
      }
    </div>
  )
}

export {
  type GamePros,
  GameState,
  GameTag,
}
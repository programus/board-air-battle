import { useState, useRef, useCallback } from "react";
import { Board, BoardState, } from "../../core";
import { BoardTag } from "./BoardTag";
import './Game.scss'

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
  const [,setUpdate] = useState({})
  const forceUpdate = useCallback(() => setUpdate({}), [])
  const audioRef = useRef<HTMLAudioElement>(null)
  if (audioRef.current) {
    playBgm(audioRef.current as CustomAudio, gameState)
  }

  const renderStates = (gameState: GameState) => {
    let ret = <></>
    switch (gameState) {
      case GameState.Title: {
        ret = (
          <div>
            <button onClick={() => {
              selfBoard.cleanPlanes()
              setSelfBoard(selfBoard)
              setGameState(GameState.Preparing)
            }}>Start</button>
          </div>
        )
        break
      }
      case GameState.Preparing: {
        ret = (
          <>
            <BoardTag board={selfBoard} onUpdated={forceUpdate} />
            <button onClick={() => {
              const enemyBoard = Board.pickRandomBoard()
              enemyBoard.isEnemy = true
              enemyBoard.state = BoardState.Fighting
              setEnemyBoard(enemyBoard)
              setGameState(GameState.Finding)
            }} disabled={!selfBoard.isLayoutReady()}>Ready? Go!</button>
          </>
        )
        break
      }
      case GameState.Finding: {
        ret = (
          <div>
            <button onClick={() => setGameState(GameState.Fighting)}>Fight!</button>
          </div>
        )
        break
      }
      case GameState.Fighting: {
        ret = (
          <>
            <BoardTag board={enemyBoard} onUpdated={() => {
              if (enemyBoard.allPlanesKilled) {
                enemyBoard.state = BoardState.Over
                setEnemyBoard(enemyBoard)
                setGameState(GameState.End)
              }
            }} />
            <label>
              Analyzing
              <input type="checkbox" onChange={(e) => {
                enemyBoard.state = e.target.checked ? BoardState.Analyzing : BoardState.Fighting;
                setEnemyBoard(enemyBoard)
              }} />
            </label>
          </>
        )
        break
      }
      case GameState.End: {
        ret = (
          <div>
            <BoardTag board={enemyBoard} />
            <button onClick={() => setGameState(GameState.Title)}>Restart</button>
          </div>
        )
        break
      }
    }
    return ret
  }

  return (
    <div className="game-root">
      <audio ref={audioRef} />
      {
        renderStates(gameState)
      }
    </div>
  )
}

export {
  type GamePros,
  GameState,
  GameTag,
}
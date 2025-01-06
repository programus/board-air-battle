import { useState, useRef, useCallback } from "react";
import { Board, BoardState, playEffect } from "../../core";
import { BoardTag } from "./BoardTag";
import './Game.scss'
import classNames from "classnames"
import { AiPlayer } from "../../core/ai"
import AiLevelSelector from "./AiLevelSelector"
import { boards } from "../../core/boards"

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
  const [selfBoard, setSelfBoard] = useState<Board>(Board.placeholder)
  const [enemyBoard, setEnemyBoard] = useState<Board>(Board.placeholder)
  const [gameTurn, setGameTurn] = useState(0)
  const [hitTurn, setHitTurn] = useState(0)
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
      const enemyBoard = Board.pickRandomBoard()
      enemyBoard.isEnemy = true
      enemyBoard.state = BoardState.Fighting
      setEnemyBoard(enemyBoard)
      selfBoard.state = BoardState.Watching
      setSelfBoard(selfBoard)

      aiPlayer.current.opponentBoard = selfBoard
      aiPlayer.current.init()
      setGameState(GameState.Fighting)
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
        <AiLevelSelector aiPlayer={aiPlayer.current} />
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
    const preparingStates = new Set([GameState.Preparing, GameState.Finding])
    const isPreparing = preparingStates.has(gameState)
    const enemyClassName = classNames({
      'enemy-preparing': isPreparing,
      'enemy-playing': !isPreparing,
    })
    const selfClassName = classNames({
      'self-preparing': isPreparing,
      'self-playing': !isPreparing,
    })
    return (
      <div className="board-container">
        <div className="game-control">
          {
            gameState === GameState.Preparing ? (
              <div>
                <button
                  onClick={() => {
                    setGameState(GameState.Finding)
                  }}
                  disabled={!selfBoard.isLayoutReady()}
                >Ready? Go!</button>
                <button
                  onClick={() => setSelfBoard(Board.pickRandomBoard())}
                >Pick a random board for me.</button>
              </div>
            ) : gameState === GameState.Finding ? (
              <div>Waiting for AI opponent finishing preparing... { (Board.allPossible.length * 100 / boards.length).toFixed(0) }%</div>
            ) : gameState === GameState.Fighting ? (
              <label>
                Analyzing
                <input type="checkbox" checked={enemyBoard.state === BoardState.Analyzing} onChange={(e) => {
                  enemyBoard.state = e.target.checked ? BoardState.Analyzing : BoardState.Fighting;
                  setEnemyBoard(enemyBoard)
                  forceUpdate()
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
          <BoardTag board={enemyBoard} turnCount={hitTurn} onUpdated={() => {
            // it's turn for enemy moving after self's turn
            switch (gameState) {
              case GameState.Fighting: {
                if (enemyBoard.state === BoardState.Fighting && enemyMovingState === 'moved') {
                  const turnCount = enemyBoard.blocks.flat().filter(b => b.isHitted()).length
                  const count = aiPlayer.current.playTurn(turnCount, (ai, hittedType) => {
                    // simulate ai thinking time
                    setTimeout(() => {
                      console.log('%c%s', 'color: red', enemyBoard.toString())
                      enemyBoard.state = BoardState.Fighting
                      setEnemyBoard(enemyBoard)
                      console.log('%c%s', 'color: red', enemyBoard.toString())
                      playEffect(hittedType, 0.6)
                      setGameTurn(ai.turnCount)
                      setEnemyMovingState('moved')

                      if (enemyBoard.allPlanesKilled || selfBoard.allPlanesKilled) {
                        enemyBoard.state = BoardState.Over
                        setEnemyBoard(enemyBoard)
                        setGameState(GameState.End)
                      }
                    }, Math.random() * 5000 + 500)
                  })
                  if (count > 0) {
                    setEnemyMovingState('moving')
                    enemyBoard.state = BoardState.Analyzing
                    setHitTurn(turnCount)
                    console.log('%c%s', 'color: #88f;', selfBoard.toString())
                  }
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
  }, [gameState, selfBoard, enemyBoard, forceUpdate, setEnemyBoard, setGameState, enemyMovingState, aiPlayer, gameTurn, hitTurn])

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
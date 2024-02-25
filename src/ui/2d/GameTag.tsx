import { useState, useRef, useCallback } from "react";
import { Board, } from "../../core";
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
  const [,setUpdate] = useState({})
  const forceUpdate = useCallback(() => setUpdate({}), [])
  const audioRef = useRef<HTMLAudioElement>(null)
  if (audioRef.current) {
    playBgm(audioRef.current as CustomAudio, gameState)
  }

  const selfBoard = useRef(new Board())

  const renderStates = (gameState: GameState) => {
    let ret = <></>
    switch (gameState) {
      case GameState.Title: {
        ret = (
          <div>
            <button onClick={() => setGameState(GameState.Preparing)}>Start</button>
          </div>
        )
        break
      }
      case GameState.Preparing: {
        ret = (
          <>
            <BoardTag board={selfBoard.current} onUpdated={forceUpdate} />
            <button onClick={() => setGameState(GameState.Finding)} disabled={!selfBoard.current.isLayoutReady()}>Ready? Go!</button>
          </>
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
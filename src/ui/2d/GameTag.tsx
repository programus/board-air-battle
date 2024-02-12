import { useState, useRef } from "react";
import { Board, } from "../../core";
import { BoardTag } from "./BoardTag";
import './Game.scss'

interface GamePros {
  board: Board;
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

function GameTag ({ board }: GamePros) {
  const [gameState, setGameState] = useState<GameState>(GameState.Title)
  const audioRef = useRef<HTMLAudioElement>(null)
  if (audioRef.current) {
    playBgm(audioRef.current as CustomAudio, gameState)
  }

  return (
    <div className="game-root">
      <audio ref={audioRef} />
      {
        gameState == GameState.Title ? 
          <div>
            <button onClick={() => setGameState(GameState.Preparing)}>Start</button>
          </div> : (
        gameState == GameState.Preparing ?
          <>
            <BoardTag board={board} />
          </> : 
          <></>
        )
      }
    </div>
  )
}

export {
  type GamePros,
  GameTag,
}
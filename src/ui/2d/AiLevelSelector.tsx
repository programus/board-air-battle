import { useState } from "react"
import { AiPlayer } from "../../core/ai"
import './AiLevelSelector.scss'

const noCheatLevels = Array.from('🧍🐬🐘🦜🐕🐈🐝🐛🪼🦠')
const cheatLevels = Array.from('😈🧞🦸🦹👻')

export type AiLevelSelectorProp = {
  aiPlayer: AiPlayer,
}

export default function AiLevelSelector({aiPlayer}: AiLevelSelectorProp) {
  const [level, setLevel] = useState<number>(aiPlayer.intellegentLevel)
  const levelText = aiPlayer.intellegentLevel <= 1 ? noCheatLevels[Math.floor((1 - aiPlayer.intellegentLevel) * noCheatLevels.length)] || noCheatLevels[noCheatLevels.length - 1] : cheatLevels[Math.floor((1.99 - aiPlayer.intellegentLevel) * (cheatLevels.length - 1) + 1)]
  return (
    <div className="ai-level-selector">
      <div className="level-text noto-color-emoji-regular">
        {levelText}
      </div>
      <label>
        <span>AI Intellegent Level </span>
        <input
          type="range"
          min="0" max="2" step="0.01"
          value={level}
          onChange={e => {
            const l = parseFloat(e.target.value)
            setLevel(l)
            aiPlayer.intellegentLevel = l
          }}
        />
      </label>
    </div>
  )
}
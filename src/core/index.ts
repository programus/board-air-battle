import { Block, HittedType } from './Block'
import { FighterPlane, FighterDirection } from './FighterPlane';
import { Board, BoardState } from './Board'


const hittedSoundMap = {
  [HittedType.NotHitted]: null,
  [HittedType.Empty]: new Audio('sounds/hit-empty.mp3'),
  [HittedType.PlaneBody]: new Audio('sounds/hit-body.mp3'),
  [HittedType.PlaneCore]: new Audio('sounds/hit-core.mp3'),
}


function playEffect(hittedType: HittedType, volume?: number) {
  const audio = hittedSoundMap[hittedType]
  if (audio) {
    if (!audio.paused) {
      audio.pause()
      audio.currentTime = 0
    }
    audio.volume = volume || 1
    audio.play()
    console.log('playEffect', hittedType)
  }
}


function areArrayEqual<T>(...aa: T[][]): boolean {
  let ret = true
  if (aa.length > 1) {
    const topResult = aa[0].every((v, i) => v == aa[1][i])
    ret = topResult && areArrayEqual(...aa.slice(1))
  }
  return ret
}

// shuffle an array and retrun a new array
function shuffle<T>(array: T[], inplace?: boolean): T[] {
  const ret = inplace ? array : [...array]
  let currentIndex = ret.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [ret[currentIndex], ret[randomIndex]] = [
      ret[randomIndex], ret[currentIndex]];
  }

  return ret;
}

export {
  playEffect,
  areArrayEqual,
  shuffle,
  HittedType,
  Block,
  FighterPlane,
  FighterDirection,
  Board,
  BoardState,
}
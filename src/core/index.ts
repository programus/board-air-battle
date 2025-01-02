import { Block, HittedType } from './Block'
import { FighterPlane, FighterDirection } from './FighterPlane';
import { Board, BoardState } from './Board'

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
  areArrayEqual,
  shuffle,
  HittedType,
  Block,
  FighterPlane,
  FighterDirection,
  Board,
  BoardState,
}
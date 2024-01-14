import { Block } from './Block'
import { FighterPlane, FighterDirection } from './FighterPlane';
import { Board } from './Board'

function areArrayEqual<T>(...aa: T[][]): boolean {
  let ret = true
  if (aa.length > 1) {
    const topResult = aa[0].every((v, i) => v == aa[1][i])
    ret = topResult && areArrayEqual(...aa.slice(1))
  }
  return ret
}

export {
  areArrayEqual,
  Block,
  FighterPlane,
  FighterDirection,
  Board,
}
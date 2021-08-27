import type {Literal} from 'nlcst'

export interface Emoticon extends Literal {
  type: 'EmoticonNode'
}

declare module 'nlcst' {
  interface SentenceContentMap {
    emoticon: Emoticon
  }
}

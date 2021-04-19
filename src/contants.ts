import { Level, Style } from './types'

export const COLOR_PALETTE: Style[] = [
  'green',
  'blue',
  'cyan',
  'yellow',
  'magenta',
  'white'
]

export const LEVELS: Record<number, Level> = {
  60: 'fatal',
  50: 'error',
  40: 'warn',
  30: 'info',
  20: 'debug',
  10: 'trace'
}

export const LEVEL_COLORS: Record<Level, Style> = {
  fatal: 'redBright',
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  debug: 'reset',
  trace: 'dim'
}

export const LEVEL_PADDING = 5

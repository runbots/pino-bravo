import { ForegroundColor, Modifier } from 'ansi-styles'

export { Level } from 'pino'

export type Style = keyof ForegroundColor | keyof Modifier

export type Input = {
  level: number
  time: number
  msg: string
  err?: Error
  pid: number
  hostname: string
  module?: string
  [k: string]: unknown
}

export type Options = {
  ignoreKeys: string
  modules: Record<string, Style>
  modulePadding: number
}

export type PartialOptions = Partial<Options>

export type FormatterFactory = () => (input: Input) => string | Input

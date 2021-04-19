import styles from 'ansi-styles'
import { EOL } from 'os'
import { COLOR_PALETTE, LEVELS, LEVEL_COLORS, LEVEL_PADDING } from './contants'
import {
  FormatterFactory,
  Input,
  Level,
  Options,
  PartialOptions,
  Style
} from './types'

function stylize(str: string, style: Style) {
  return `${styles[style].open}${str}${styles[style].close}`
}

function formatLevel(level: Level) {
  const style = LEVEL_COLORS[level]
  return stylize(level.padStart(LEVEL_PADDING), style)
}

function ensureModuleStyle(module: string, options: Options) {
  if (!options.modules[module]) {
    const colorIndex =
      // Quick & dirty "pseudo hash"
      (module.length +
        module.charCodeAt(0) +
        module.charCodeAt(module.length - 1)) %
      COLOR_PALETTE.length
    options.modules[module] = COLOR_PALETTE[colorIndex]
  }
  return options.modules[module]
}

function formatModule(module: string, level: Level, options: Options) {
  const moduleStyle = ensureModuleStyle(module, options)
  const style = level === 'trace' ? LEVEL_COLORS[level] : moduleStyle
  return stylize(module.padEnd(options.modulePadding), style)
}

function formatMsg(msg: string, level: Level) {
  const style = level === 'trace' ? LEVEL_COLORS[level] : 'reset'
  return stylize(msg, style)
}

function formatErr(err: Error) {
  // Trim the error message as we already displayed it
  const trimmedStack = err.stack.substr(err.stack.indexOf('\n'))
  return stylize(trimmedStack, 'dim')
}

function formatArgs(
  args: Record<string, unknown>,
  module: string,
  msg: string,
  options: Options
) {
  const output = Object.keys(args)
    .filter(key => !options.ignoreKeys.includes(key))
    .reduce((str, key) => `${str}, ${key}=${args[key]}`, '')
    .slice(2)
    .padStart(
      process.stdout.columns -
        LEVEL_PADDING -
        Math.max(module.length, options.modulePadding) -
        msg.length -
        4
    )
  return stylize(output, 'dim')
}

const defaultOptions: Options = {
  ignoreKeys: 'hostname,pid,time',
  modules: {},
  modulePadding: undefined
}

function normalizeOptions(options: PartialOptions): Options {
  // Dynamically compute the module padding if not explicitely specified
  const modulePadding =
    options.modulePadding ||
    Object.keys(options.modules || {}).reduce(
      (max, module) => Math.max(module.length, max),
      0
    )

  return {
    ...defaultOptions,
    ...options,
    modulePadding
  }
}

export default function pinoBravo(
  options: PartialOptions = {}
): FormatterFactory {
  return function factory() {
    const normalizedOpts = normalizeOptions(options)

    return function format(input: Input) {
      const { level: levelNum, module, err, ...args } = input

      const level = LEVELS[levelNum]
      const msg = input.msg || err?.message || ''

      let output = ''
      output += formatLevel(level) + ' '
      output += formatModule(module, level, normalizedOpts) + ' '
      output += formatMsg(msg, level) + ' '
      output += err ? formatErr(err) + ' ' : ''
      output += formatArgs(args, module, msg, normalizedOpts) + ' '

      return output + EOL
    }
  }
}

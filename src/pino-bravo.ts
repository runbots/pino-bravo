import styles from 'ansi-styles'
import { EOL } from 'os'
import { COLOR_PALETTE, LEVELS, LEVEL_COLORS, LEVEL_PADDING } from './contants'
import {
  FormatterFactory,
  Input,
  Options,
  PartialOptions,
  Style
} from './types'

function stylize(str: string, style: Style) {
  return `${styles[style].open}${str}${styles[style].close}`
}

function formatLevel(level: number) {
  const output = LEVELS[level]
  const style = LEVEL_COLORS[output]
  return stylize(output.padStart(LEVEL_PADDING), style)
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

function formatModule(module: string, input: Input, options: Options) {
  const moduleStyle = ensureModuleStyle(module, options)
  const style =
    input.level < 20 ? LEVEL_COLORS[LEVELS[input.level]] : moduleStyle
  return stylize(module.padEnd(options.modulePadding), style)
}

function formatMsg(msg: string, input: Input) {
  const style = input.level < 20 ? LEVEL_COLORS[LEVELS[input.level]] : 'reset'
  return stylize(msg, style)
}

function formatArgs(
  args: Record<string, unknown>,
  input: Input,
  options: Options
) {
  const style = 'dim'
  const output = Object.keys(args)
    .filter(key => !options.ignoreKeys.includes(key))
    .reduce((str, key) => `${str}, ${key}=${args[key]}`, '')
    .slice(2)
    .padStart(
      process.stdout.columns -
        LEVEL_PADDING -
        Math.max(input.module.length, options.modulePadding) -
        input.msg.length -
        4
    )
  return stylize(output, style)
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
      const { level, module, msg, ...args } = input

      let output = ''
      output += formatLevel(level) + ' '
      output += formatModule(module, input, normalizedOpts) + ' '
      output += formatMsg(msg, input) + ' '
      output += formatArgs(args, input, normalizedOpts) + ' '

      return output + EOL
    }
  }
}

/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config as SecConfig, Debug, Folder, Path } from '@secjs/utils'

import { EnvHelper } from '#src/Helpers/EnvHelper'

export * from './Helpers/EnvHelper.js'

/**
 * Return the env value if found or the fallback defaultValue.
 *
 * @param {string} env
 * @param {any} [defaultValue]
 * @param {boolean} [autoCast]
 */
export function Env(env, defaultValue, autoCast = true) {
  const environment = EnvHelper.setEnvInEnv(process.env[env], autoCast)

  if (!environment) {
    Debug.log(`Variable ${env} not found.`, 'api:environments')

    return EnvHelper.setEnvInEnv(defaultValue, autoCast)
  }

  if (autoCast) {
    return EnvHelper.castEnv(environment)
  }

  return environment
}

export class Config {
  /**
   * Get the value from config file by key. If not
   * found, defaultValue will be used.
   *
   * @param {string} key
   * @param {any,undefined} defaultValue
   * @return {any}
   */
  static get(key, defaultValue = undefined) {
    return SecConfig.get(key, defaultValue)
  }

  /**
   * Load all the files that are inside the path.
   *
   * @param {string} configPath
   * @return {Promise<void>}
   */
  static async load(configPath = Path.config()) {
    const { files } = await new Folder(configPath).load()

    const promises = files.map(f => new SecConfig().safeLoad(f.path))

    await Promise.all(promises)
  }
}

if (!global.Env) {
  global.Env = Env
}

if (!global.Config) {
  global.Config = Config
}

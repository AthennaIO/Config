/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

import { Is } from '@athenna/common'
import { NotFoundConfigException } from '#src/exceptions/NotFoundConfigException'

/**
 * Set the value of some configuration in your class property.
 */
export function Value(key: string, defaultValue?: any): PropertyDecorator {
  return (target: any, propKey: string | symbol) => {
    if (Is.Defined(defaultValue) || defaultValue === null) {
      Object.defineProperty(target, propKey, {
        value: Config.get(key, defaultValue),
      })

      return
    }

    if (!Config.exists(key)) {
      throw new NotFoundConfigException(key)
    }

    Object.defineProperty(target, propKey, { value: Config.get(key) })
  }
}

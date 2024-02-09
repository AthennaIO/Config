/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'

/**
 * Set the value of some configuration in your class property.
 */
export function Value(key: string, defaultValue?: any): PropertyDecorator {
  return (target: any, propKey: string | symbol) => {
    Object.defineProperty(target, propKey, {
      value: Config.get(key, defaultValue)
    })
  }
}

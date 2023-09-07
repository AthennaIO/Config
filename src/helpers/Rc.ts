/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debug } from '#src/debug'
import { loadFile, writeFile } from 'magicast'
import { File, Is, ObjectBuilder } from '@athenna/common'

export class Rc {
  public static file: File
  public static content: ObjectBuilder

  /**
   * Set the RC file that the Rc class should work with.
   */
  public static async setFile(
    path = Path.pwd('.athennarc.json')
  ): Promise<typeof Rc> {
    this.content = new ObjectBuilder({
      referencedValues: false,
      ignoreNull: false,
      ignoreUndefined: false
    })

    this.file = await new File(path).load()

    debug('RC file loaded: %s', path)

    const json = this.file.getContentAsJsonSync()

    if (json === null) {
      const mod = await import(this.file.href)

      this.content = new ObjectBuilder({
        referencedValues: true,
        ignoreNull: false,
        ignoreUndefined: false
      })

      this.content.set(mod.default)

      return this
    }

    if (this.file.base === 'package.json') {
      debug('Using the "athenna" property of package.json file as RC content.')
      this.content.set(json.athenna)
    } else {
      this.content.set(json)
    }

    return this
  }

  /**
   * Set or subscribe a KEY:VALUE property in some property of the RC configuration file.
   * You can also pass any value as a second parameter to set multiple properties at once.
   *
   * @example
   * ```ts
   * this.rc.setTo('commands', 'test', '#app/Console/Commands/TestCommand')
   * ```
   * Or:
   * @example
   * ```ts
   * this.rc.setTo('commands', { test: '#app/Console/Commands/TestCommand' })
   * ```
   */
  public static setTo(
    rcKey: string,
    key: string | any,
    value?: any
  ): typeof Rc {
    if (value) {
      value = { ...this.content.get(rcKey, {}), [key]: value }
    }

    this.content.set(rcKey, value || key)

    Config.set(`rc.${rcKey}`, this.content.get(rcKey))

    return this
  }

  /**
   * Push a new value in some property of the RC configuration file.
   *
   * @example
   * ```ts
   * this.rc.pushTo('providers', '#providers/TestProvider')
   * ```
   */
  public static pushTo(rcKey: string, value: any): typeof Rc {
    this.content.set(rcKey, [...this.content.get(rcKey, []), value])

    Config.set(`rc.${rcKey}`, this.content.get(rcKey))

    return this
  }

  /**
   * Save the new content in the Rc file.
   */
  public static async save(): Promise<void> {
    if (Is.Module(this.file.path)) {
      const mod = await loadFile(this.file.path)

      mod.exports.default = this.content.get()

      await writeFile(mod.$ast, this.file.path, {
        quote: 'single',
        tabWidth: 2,
        trailingComma: {
          objects: true
        } as any
      })

      return
    }

    if (this.file.base === 'package.json') {
      const packageJson = await this.file.getContentAsJson()

      packageJson.athenna = this.content.get()

      await this.file.setContent(this.toStringJson(packageJson))

      return
    }

    const athennaRcJson = this.content.get()

    await this.file.setContent(this.toStringJson(athennaRcJson))
  }

  /**
   * Parse the object value to JSON string.
   */
  private static toStringJson(value: any): string {
    return JSON.stringify(value, null, 2).concat('\n')
  }
}

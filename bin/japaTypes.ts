/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@japa/assert' {
  export interface Assert {
    throws(fn: () => void, errType: any, message?: string): void
    doesNotThrows(fn: () => void, errType: any, message?: string): void
    rejects(
      fn: () => void | Promise<void>,
      errType: any,
      message?: string,
    ): Promise<void>
    doesNotRejects(
      fn: () => void | Promise<void>,
      errType: any,
      message?: string,
    ): Promise<void>
  }
}

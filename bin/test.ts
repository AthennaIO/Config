/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { assert } from '@japa/assert'
import { pathToFileURL } from 'node:url'
import { specReporter } from '@japa/spec-reporter'
import { processCliArgs, configure, run } from '@japa/runner'

/*
|--------------------------------------------------------------------------
| Japa types
|--------------------------------------------------------------------------
|
| Declare customized japa types.
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

/*
|--------------------------------------------------------------------------
| Set IS_TS env.
|--------------------------------------------------------------------------
|
| Set the IS_TS environement variable to true. Very useful when using the
| Path helper.
*/

process.env.IS_TS = 'true'

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*Test.ts'],
    plugins: [assert()],
    reporters: [specReporter()],
    importer: filePath => import(pathToFileURL(filePath).href),
    timeout: 5000,
  },
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/

run()

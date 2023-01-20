/**
 * @athenna/Config
 *
 * (c) Victor Tesoura Júnior <txsoura@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { assert } from '@japa/assert'
import { pathToFileURL } from 'node:url'
import { specReporter } from '@japa/spec-reporter'
import { configure, processCliArgs, run } from '@japa/runner'

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a Config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-Config for the Config docs.
*/

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*Test.ts'],
    plugins: [assert()],
    reporters: [specReporter()],
    importer: filePath => import(pathToFileURL(filePath).href),
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

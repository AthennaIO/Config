/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { File, Path } from '@athenna/common'

import { EnvHelper } from '#src/Helpers/EnvHelper'

test.group('EnvTest', group => {
  group.setup(async () => {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
    await new File(Path.stubs('.env.testing')).copy(Path.pwd('.env.testing'))
  })

  group.teardown(async () => {
    await new File(Path.pwd('.env')).remove()
    await new File(Path.pwd('.env.testing')).remove()
  })

  test('should not override pre set environment variables', async ({ assert }) => {
    process.env.PRESET = 'true'
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    process.env.NODE_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('PRESET'), 'true')
  })

  test('should override pre set environment variables', async ({ assert }) => {
    process.env.OVERRIDE_ENV = true
    process.env.PRESET = 'true'
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    process.env.NODE_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('PRESET'), 'false')
  })

  test('should be able to resolve more than one env files at same time', async ({ assert }) => {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    process.env.NODE_ENV = 'testing'
    EnvHelper.resolveFile()

    assert.equal(Env('ENV'), 'production')
    assert.equal(Env('ENV_TESTING'), 'testing')
  })

  test('should be able to parse the type of the environment variable', async ({ assert }) => {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    assert.strictEqual(Env('NUMBER_ENV'), 10)
    assert.strictEqual(Env('BOOLEAN_ENV'), true)
    assert.deepEqual(Env('OBJECT_ENV'), { name: 'Paulo' })
  })

  test('should be able to fallback to default values when the env does not exist', async ({ assert }) => {
    assert.equal(Env('NO_EXIST', 'Hello World'), 'Hello World')
  })

  test('should be able to set env values inside of other env values', async ({ assert }) => {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('ENV_IN_ENV'), '10-true')
    assert.deepEqual(Env('ENV_IN_ENV_JSON'), { maintainers: { name: 'Paulo' } })
  })

  test('should be able to turn off the auto cast for specifics envs when needed', async ({ assert }) => {
    process.env.NODE_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('NUMBER_ENV', '10', false), '(10)')
  })

  test('should be able to use Env without any .env file', async ({ assert }) => {
    process.env.NODE_ENV = 'undefined'
    EnvHelper.resolveFile()

    assert.equal(Env('NODE_ENV'), 'undefined')
  })
})

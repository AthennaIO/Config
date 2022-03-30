/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '../../src/Env'
import { File, Path } from '@secjs/utils'
import { resolveEnvFile } from '../../src/Utils/resolveEnvFile'

describe('\n EnvTest', () => {
  beforeAll(async () => {
    await new File(Path.noBuild().tests('Stubs/.env')).copy(Path.noBuild().pwd('.env'))
    await new File(Path.noBuild().tests('Stubs/.env.testing')).copy(Path.noBuild().pwd('.env.testing'))
  })

  it('should be able to resolve more than one env files at same time', async () => {
    process.env.NODE_ENV = ''
    resolveEnvFile()

    process.env.NODE_ENV = 'testing'
    resolveEnvFile()

    expect(Env('ENV')).toBe('production')
    expect(Env('ENV_TESTING')).toBe('testing')
  })

  it('should be able to parse the type of the environment variable', async () => {
    process.env.NODE_ENV = ''
    resolveEnvFile()

    expect(Env('NUMBER_ENV')).toStrictEqual(10)
    expect(Env('BOOLEAN_ENV')).toStrictEqual(true)
    expect(Env('OBJECT_ENV')).toStrictEqual({ name: 'Paulo' })
  })

  it('should be able to fallback to default values when the env does not exist', async () => {
    expect(Env('NO_EXIST', 'Hello World')).toBe('Hello World')
  })

  it('should be able to set env values inside of other env values', async () => {
    process.env.NODE_ENV = ''
    resolveEnvFile()

    expect(Env('ENV_IN_ENV')).toStrictEqual('10-true')
    expect(Env('ENV_IN_ENV_JSON')).toStrictEqual({ maintainers: { name: 'Paulo' } })
  })

  it('should be able to turn off the auto cast for specifics envs when needed', async () => {
    process.env.NODE_ENV = ''
    resolveEnvFile()

    expect(Env('NUMBER_ENV', '10', false)).toStrictEqual('(10)')
  })

  afterAll(async () => {
    await new File(Path.noBuild().pwd('.env')).remove()
    await new File(Path.noBuild().pwd('.env.testing')).remove()
  })
})

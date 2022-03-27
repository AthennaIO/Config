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
import { EnvTypeENUM } from '../../src/Enum/EnvTypeENUM'
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

    expect(Env({ name: 'NUMBER_ENV', type: EnvTypeENUM.NUMBER })).toStrictEqual(10)
    expect(Env({ name: 'BOOLEAN_ENV', type: EnvTypeENUM.BOOLEAN })).toStrictEqual(true)
    expect(Env({ name: 'OBJECT_ENV', type: EnvTypeENUM.OBJECT })).toStrictEqual({ name: 'Paulo' })
  })

  it('should be able to fallback to default values when the env does not exist', async () => {
    expect(Env('NO_EXIST', 'Hello World')).toBe('Hello World')
  })

  it('should be able to set env values inside of other env values', async () => {
    process.env.NODE_ENV = ''
    resolveEnvFile()

    expect(Env('ENV_IN_ENV')).toStrictEqual('10-true')
    expect(Env({ name: 'ENV_IN_ENV_JSON', type: EnvTypeENUM.OBJECT })).toStrictEqual({ maintainers: { name: 'Paulo' } })
  })

  afterAll(async () => {
    await new File(Path.noBuild().pwd('.env')).remove()
    await new File(Path.noBuild().pwd('.env.testing')).remove()
  })
})

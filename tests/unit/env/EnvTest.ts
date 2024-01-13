/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Json, Path } from '@athenna/common'
import { EnvHelper } from '#src/helpers/EnvHelper'
import { Test, BeforeAll, AfterAll, AfterEach, type Context } from '@athenna/test'

export default class EnvTest {
  public env: any = Json.copy(process.env)
  public argv: string[] = Json.copy(process.argv)

  @BeforeAll()
  public async beforeAll() {
    await new File(Path.fixtures('.env')).copy(Path.pwd('.env'))
    await new File(Path.fixtures('.env.other')).copy(Path.pwd('.env.other'))
    await new File(Path.fixtures('.env.testing')).copy(Path.pwd('.env.testing'))
  }

  @AfterAll()
  public async afterAll() {
    await File.safeRemove(Path.pwd('.env'))
    await File.safeRemove(Path.pwd('.env.other'))
    await File.safeRemove(Path.pwd('.env.testing'))
  }

  @AfterEach()
  public async afterEach() {
    process.env = this.env
    process.argv = this.argv
  }

  @Test()
  public async shouldBeAbleToParseTheTypeOfTheEnvironmentVariable({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    assert.strictEqual(Env('NUMBER_ENV'), 10)
    assert.strictEqual(Env('NUMBER_ENV', undefined, false), '10')
    assert.strictEqual(Env('BOOLEAN_ENV'), true)
    assert.strictEqual(Env('BOOLEAN_ENV', undefined, false), 'true')
    assert.deepEqual(Env('OBJECT_ENV'), { name: 'Paulo' })
    assert.deepEqual(Env('OBJECT_ENV', undefined, false), `{"name":"Paulo"}`)
  }

  @Test()
  public async shouldBeAbleToFallbackToDefaultValuesWhenTheEnvDoesNotExist({ assert }: Context) {
    assert.deepEqual(Env('NO_EXIST', false), false)
  }

  @Test()
  public async shouldBeAbleToSetEnvValuesInsideOfOtherEnvValues({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('ENV_IN_ENV'), '10-true')
    assert.deepEqual(Env('ENV_IN_ENV_JSON'), { maintainers: { name: 'Paulo' } })
    assert.deepEqual(Env('ENV_IN_ENV_JSON', undefined, false), `{ "maintainers": {"name":"Paulo"} }`)
  }

  @Test()
  public async shouldBeAbleToTurnOffTheAutoCastForSpecificsEnvsWhenNeeded({ assert }: Context) {
    process.env.APP_ENV = ''
    EnvHelper.resolveFile()

    assert.equal(Env('NUMBER_ENV', '10', false), '10')
    assert.equal(Env('STRING_NUMBER_ENV', '(10)', false), '(10)')
  }

  @Test()
  public async shouldBeAbleToUseEnvWithoutAnyEnvFile({ assert }: Context) {
    process.env.APP_ENV = 'undefined'

    EnvHelper.resolveFile()

    assert.equal(Env('APP_ENV'), 'undefined')
    assert.isUndefined(Env('OTHER_DEFINED'))
  }

  @Test()
  public async shouldBeAbleToUseEnvWithoutAnyEnvFileAndOverridingValues({ assert }: Context) {
    process.env.APP_ENV = 'undefined'
    process.env.OVERRIDE_ENV = 'true'

    EnvHelper.resolveFile()

    assert.equal(Env('APP_ENV'), 'other')
    assert.isUndefined(Env('OTHER_DEFINED'))
  }
}

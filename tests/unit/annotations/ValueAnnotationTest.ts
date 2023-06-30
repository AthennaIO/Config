/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import type { Context } from '@athenna/test/types'
import { Test, BeforeEach, AfterEach } from '@athenna/test'
import { NotFoundConfigException } from '#src/exceptions/NotFoundConfigException'

export default class ValueAnnotationTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.load(Path.stubs('config/app.ts'))
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToSetConfigurationValuesUsingValueAnnotation({ assert }: Context) {
    const { AppService } = await import('#tests/stubs/classes/AppService')

    const appService = new AppService()

    assert.equal(appService.name, 'Athenna')
    assert.deepEqual(appService.app, { name: 'Athenna', env: 'test', environments: ['default'] })
  }

  @Test()
  public async shouldThrowAnExceptionIfTryingToLoadAConfigurationValueThatDoesNotExist({ assert }: Context) {
    await assert.rejects(() => import('#tests/stubs/classes/ThrowNotFound'), NotFoundConfigException)
  }

  @Test()
  public async shouldNotThrowExceptionIfDefaultValueIsSetWhenTryingToLoadAUndefinedConfiguration({ assert }: Context) {
    const { DoesNotThrowNotFound } = await import('#tests/stubs/classes/DoesNotThrowNotFound')

    const doesNotThrowNotFound = new DoesNotThrowNotFound()

    assert.equal(doesNotThrowNotFound.defined, null)
    assert.equal(doesNotThrowNotFound.definedApp, 'Athenna')
  }

  @Test()
  public async shouldBeAbleToSetDifferentValuesToConfigurationsWithoutChangingTheOnesAlreadySetInClass({
    assert,
  }: Context) {
    const { AppService } = await import('#tests/stubs/classes/AppService')

    const appService = new AppService()

    Config.set('app.name', 'Athenna Framework')

    assert.equal(appService.name, 'Athenna')
    assert.deepEqual(appService.app, { name: 'Athenna', env: 'test', environments: ['default'] })
  }
}

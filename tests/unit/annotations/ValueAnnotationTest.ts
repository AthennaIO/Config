/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Test, BeforeEach, AfterEach, type Context } from '@athenna/test'

export default class ValueAnnotationTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.load(Path.fixtures('config/app.ts'))
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToSetConfigurationValuesUsingValueAnnotation({ assert }: Context) {
    const { AppService } = await import('#tests/fixtures/classes/AppService')

    const appService = new AppService()

    assert.equal(appService.name, 'Athenna')
    assert.deepEqual(appService.app, { name: 'Athenna', env: 'test', environments: ['default'] })
  }

  @Test()
  public async shouldSetAsUndefinedIfTryingToLoadAConfigurationValueThatDoesNotExist({ assert }: Context) {
    const { NotFoundConfig } = await import('#tests/fixtures/classes/NotFoundConfig')

    const notFoundConfig = new NotFoundConfig()

    assert.equal(notFoundConfig.undefined, undefined)
  }

  @Test()
  public async shouldTheDefaultValueIfTryingToLoadAConfigurationValueThatDoesNotExist({ assert }: Context) {
    const { NotFoundConfig } = await import('#tests/fixtures/classes/NotFoundConfig')

    const notFoundConfig = new NotFoundConfig()

    assert.equal(notFoundConfig.defined, 'Athenna')
  }

  @Test()
  public async shouldBeAbleToSetDifferentValuesToConfigurationsWithoutChangingTheOnesAlreadySetInClass({
    assert
  }: Context) {
    const { AppService } = await import('#tests/fixtures/classes/AppService')

    const appService = new AppService()

    Config.set('app.name', 'Athenna Framework')

    assert.equal(appService.name, 'Athenna')
    assert.deepEqual(appService.app, { name: 'Athenna', env: 'test', environments: ['default'] })
  }
}

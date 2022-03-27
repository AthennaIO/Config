/**
 * @athenna/config
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as dotenv from 'dotenv'
import { Path, Debug } from '@secjs/utils'

export function resolveEnvFile() {
  const debug = new Debug('Env', 'api:environments')

  const environment = process.env.NODE_ENV
  const configurations = { path: Path.noBuild().pwd('.env') }

  if (environment && environment !== '') {
    configurations.path = Path.noBuild().pwd(`.env.${environment}`)

    debug.log(`Environment variables set using .env.${environment} file`)
  }

  const result = dotenv.config(configurations)

  if (result.error) {
    debug.log('Any environment variable file found!')

    return
  }

  if (result.parsed) {
    Object.keys(result.parsed).forEach(key => {
      if (!result.parsed) return

      process.env[key] = result.parsed[key]
    })
  }
}

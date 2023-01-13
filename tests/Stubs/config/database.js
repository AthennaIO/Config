/**
 * @secjs/utils
 *
 * (c) João Lenon <lenonSec7@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '#src/index'

export default {
  // eslint-disable-next-line prettier/prettier
  username: Config.get("app.name"),
  env: Config.get('app.env'),
}

import { EnvHelper } from '#src/Helpers/EnvHelper'

/**
 * Return the env value if found or the fallback defaultValue.
 *
 * @param {string} env
 * @param {any} [defaultValue]
 * @param {boolean} [autoCast]
 */
export function Env(env, defaultValue, autoCast = true) {
  const environment = EnvHelper.setEnvInEnv(process.env[env], autoCast)

  if (!environment) {
    return EnvHelper.setEnvInEnv(defaultValue, autoCast)
  }

  if (autoCast) {
    return EnvHelper.castEnv(environment)
  }

  return environment
}

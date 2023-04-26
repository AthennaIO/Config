import { Value } from '#src/Decorators/Value'

export class AppService {
  @Value('app')
  public app: any

  @Value('app.name')
  public name: any
}

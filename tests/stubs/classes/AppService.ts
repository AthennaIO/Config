import { Value } from '#src/decorators/Value'

export class AppService {
  @Value('app')
  public app: any

  @Value('app.name')
  public name: any
}

import { Value } from '#src/annotations/Value'

export class AppService {
  @Value('app')
  public app: any

  @Value('app.name')
  public name: any
}

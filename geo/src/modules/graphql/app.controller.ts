import { Controller } from "@nestjs/common";

import { GraphQLAppService } from "./app.service";

@Controller()
export class GraphQLAppController {
  constructor(private readonly appService: GraphQLAppService) {}
}

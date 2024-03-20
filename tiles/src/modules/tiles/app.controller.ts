import { Controller, Get } from "@nestjs/common";

import { TileAppService } from "./app.service";

@Controller()
export class TileAppController {
  constructor(private readonly appService: TileAppService) {}

  @Get("tiles")
  getHello(): string {
    return this.appService.getHello();
  }
}

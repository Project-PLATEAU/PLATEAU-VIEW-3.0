import { Test, TestingModule } from "@nestjs/testing";

import { TileAppController } from "./app.controller";
import { TileAppService } from "./app.service";

describe("AppController", () => {
  let appController: TileAppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TileAppController],
      providers: [TileAppService],
    }).compile();

    appController = app.get<TileAppController>(TileAppController);
  });

  it('should return "Hello Tiles!"', () => {
    expect(appController.getHello()).toBe("Hello Tiles!");
  });
});

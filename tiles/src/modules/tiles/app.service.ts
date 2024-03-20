import { Injectable } from "@nestjs/common";

@Injectable()
export class TileAppService {
  getHello(): string {
    return "Hello Tiles!";
  }
}

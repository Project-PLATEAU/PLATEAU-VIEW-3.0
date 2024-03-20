import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";

@Injectable()
export class TileFormatValidationPipe implements PipeTransform {
  transform(value: unknown): string {
    if (value !== "png" && value !== "webp") {
      throw new BadRequestException("Invalid format");
    }
    return value;
  }
}

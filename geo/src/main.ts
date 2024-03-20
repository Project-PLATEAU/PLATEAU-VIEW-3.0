import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import invariant from "tiny-invariant";

import { AppModule } from "./app.module";
import { wildCardToRegExp } from "./utils/wildcard";

const PORT = process.env.PORT && !isNaN(Number(process.env.PORT)) ? Number(process.env.PORT) : 5002;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const allowedOrigins = JSON.parse(process.env.ALLOW_ORIGIN);
  invariant(Array.isArray(allowedOrigins));
  app.enableCors({
    origin: allowedOrigins.map(wildCardToRegExp),
    methods: ["GET", "OPTION"],
    maxAge: 3600,
  });
  console.log("PORT:", PORT);
  await app.listen(PORT);
}
bootstrap();

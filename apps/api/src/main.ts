import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded, type Request } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  // Default body parser is disabled so we can raise the JSON size limit above
  // Express's 100kb default — /ai endpoints send extracted document text.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  // Stashes the raw request bytes on req.rawBody — needed by the Lemon
  // Squeezy webhook handler, which verifies an HMAC signature computed over
  // the exact bytes sent, not the re-serialized JSON.
  app.use(
    json({
      limit: '2mb',
      verify: (req: Request & { rawBody?: Buffer }, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(urlencoded({ extended: true, limit: '2mb' }));
  // The desktop app's requests come from Tauri's internal origin, not the
  // web app's — always allow it alongside whatever CORS_ORIGIN configures
  // for the web deploy, or every fetch from the desktop app fails CORS
  // silently (caught and swallowed by each call site's error handling,
  // which looks identical to "the API just isn't returning fresh data").
  // http://tauri.localhost is Windows' scheme; tauri://localhost covers
  // macOS/Linux.
  const allowedOrigins = [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'http://tauri.localhost', 'tauri://localhost'];
  app.enableCors({ origin: allowedOrigins });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Brief.ai API')
    .setDescription(
      'PDF tools, AI document assistance, and library endpoints for the Brief.ai platform. ' +
        'Most PDF processing happens client-side; these endpoints cover AI operations, ' +
        'server-side conversions (Office↔PDF, password protect), auth, and the library.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`API docs at http://localhost:${port}/docs`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = 3003;
  const config = new DocumentBuilder()
    .setTitle('Djonanko Payout Service')
    .setDescription('Djonanko Payout API description')
    .setVersion('1.0')
    .addTag('djonanko-payout-service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT, () => {
    console.log(`Application is running on: ${PORT}`);
  });
}
bootstrap();

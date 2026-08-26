import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        autoIndex:
          configService.get<string>('app.nodeEnv') !== 'production',
        connectionFactory: (connection: Connection) => {
          const logger = new Logger('DatabaseModule');

          connection.on('connected', () => {
            logger.log('MongoDB connected successfully');
          });

          connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
          });

          connection.on('error', (error: Error) => {
            logger.error(`MongoDB connection error: ${error.message}`);
          });

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

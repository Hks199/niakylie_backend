import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: MongooseHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getAppInfo', () => {
    it('should return application info', () => {
      const result = appController.getAppInfo();
      expect(result).toEqual({
        name: 'Niakylie Women Collection API',
        version: '1.0.0',
        description: "Women's Fashion E-Commerce Platform API",
        status: 'running',
      });
    });
  });
});

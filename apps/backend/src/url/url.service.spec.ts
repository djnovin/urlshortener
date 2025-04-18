import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { UrlRepository } from './url.repository';
import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';

describe('UrlService', () => {
  let service: UrlService;
  let repo: jest.Mocked<UrlRepository>;

  const mockRepo = {
    create: jest.fn(),
    findByShortUrl: jest.fn(),
    incrementClicks: jest.fn(),
    createClick: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    getAllShortUrls: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlService, { provide: UrlRepository, useValue: mockRepo }],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repo = module.get(UrlRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createShortUrl', () => {
    it('should create and return a shortUrl', async () => {
      const dto = {
        originalUrl: 'https://example.com',
        expiredAt: undefined,
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'spring',
        utm_term: 'url shortener',
        utm_content: 'ad1',
      };

      const mockReturn = {
        shortUrl: 'abcde',
      };

      repo.create.mockResolvedValue(mockReturn as any);

      const result = await service.createShortUrl(dto);
      expect(result).toEqual({ shortUrl: 'abcde' });
      expect(repo.create).toHaveBeenCalled();
    });
  });

  describe('getOriginalUrl', () => {
    const mockRequest = {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'user-agent': 'jest',
      },
      socket: {
        remoteAddress: '1.2.3.4',
      },
    } as unknown as Request;

    it('should return null if URL not found or expired', async () => {
      repo.findByShortUrl.mockResolvedValue(null);
      const result = await service.getOriginalUrl('abcde', mockRequest);
      expect(result).toBeNull();
    });

    it('should track click and return originalUrl', async () => {
      const future = new Date(Date.now() + 100000);
      repo.findByShortUrl.mockResolvedValue({
        id: '123',
        originalUrl: 'https://test.com',
        expiredAt: future,
      } as any);
      repo.incrementClicks.mockResolvedValue({} as any);
      repo.createClick.mockResolvedValue({} as any);

      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({
          status: 'success',
          country: 'Australia',
          city: 'Sydney',
        }),
      }) as any;

      const result = await service.getOriginalUrl('abcde', mockRequest);
      expect(result).toBe('https://test.com');
      expect(repo.createClick).toHaveBeenCalledWith(
        expect.objectContaining({
          ip: '1.2.3.4',
          userAgent: 'jest',
          country: 'Australia',
          city: 'Sydney',
        }),
      );
    });
  });

  describe('updateUrl', () => {
    it('should throw if URL not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.updateUrl('1', { expiredAt: new Date() }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call update with correct data', async () => {
      repo.findById.mockResolvedValue({ id: '1' } as any);
      repo.update.mockResolvedValue({} as any);

      const dto = {
        expiredAt: new Date(),
        utm_source: 'fb',
        utm_medium: 'social',
        utm_campaign: 'autumn',
      };

      await service.updateUrl('1', dto);

      expect(repo.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          expiredAt: dto.expiredAt,
          utm: expect.objectContaining({
            update: expect.objectContaining({
              source: 'fb',
              medium: 'social',
              campaign: 'autumn',
            }),
          }),
        }),
      );
    });
  });

  describe('getAllUrls', () => {
    it('should return an array of short URLs', async () => {
      const mockUrls = [{ shortUrl: 'abc' }, { shortUrl: 'xyz' }];
      repo.getAllShortUrls.mockResolvedValue(mockUrls);

      const result = await service.getAllUrls();
      expect(result).toEqual(['abc', 'xyz']);
    });
  });
});

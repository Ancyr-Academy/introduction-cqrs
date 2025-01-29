import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = (await createClient({
      url: 'redis://user:azerty123@localhost:11012',
    })
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect()) as any;
  }

  async getJson<T>(key: string): Promise<T> {
    return (await this.client.json.get(key)) as unknown as Promise<T>;
  }

  async setJson<T extends Record<string, any>>(key: string, value: T) {
    return this.client.json.set(key, '.', value);
  }

  async onModuleDestroy() {
    return this.client.quit();
  }
}

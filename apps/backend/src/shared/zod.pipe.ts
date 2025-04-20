import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private static cache = new WeakMap<ZodSchema, ZodValidationPipe>();

  constructor(private schema: ZodSchema) {}

  static of(schema: ZodSchema): ZodValidationPipe {
    let existing = this.cache.get(schema);
    if (!existing) {
      existing = new ZodValidationPipe(schema);
      this.cache.set(schema, existing);
    }
    return existing;
  }

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.flatten(),
      });
    }

    return result.data;
  }
}

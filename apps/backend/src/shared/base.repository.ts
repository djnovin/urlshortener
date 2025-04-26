import { PrismaClient } from '@prisma/client';

export class BaseRepository<TModel, TCreateInput, TUpdateInput> {
  constructor(
    protected readonly prisma: PrismaClient,
    private readonly model: keyof PrismaClient,
  ) {}

  private get repo() {
    return this.prisma[this.model] as any;
  }

  async create(data: TCreateInput): Promise<TModel> {
    return this.repo.create({ data });
  }

  async findAll(): Promise<TModel[]> {
    return this.repo.findMany();
  }

  async findById(id: string): Promise<TModel | null> {
    return this.repo.findUnique({ where: { id } });
  }

  async update(id: string, data: TUpdateInput): Promise<TModel> {
    return this.repo.update({ where: { id }, data });
  }

  async delete(id: string): Promise<TModel> {
    return this.repo.delete({ where: { id } });
  }
}

import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const productFound = await this.productsRepository.findByName(name);
    if (productFound) {
      throw new AppError(`Product with the name ${name} already exists`);
    }
    return this.productsRepository.create({ name, price, quantity });
  }
}

export default CreateProductService;

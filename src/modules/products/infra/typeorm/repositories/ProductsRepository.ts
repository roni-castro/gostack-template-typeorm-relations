import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    return this.ormRepository.findOne({ where: { name } });
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    return this.ormRepository.find({ where: In(products) });
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productIds = products.map(product => ({ id: product.id }));
    const productsFound = await this.findAllById(productIds);
    const productsWithNewStock: Product[] = products.map(product => {
      const productFound = productsFound.find(
        prodFound => prodFound.id === product.id,
      );
      if (!productFound) {
        throw new Error('Product was not found to be updated');
      }
      return {
        ...productFound,
        quantity: productFound.quantity - product.quantity,
      };
    });
    return this.ormRepository.save(productsWithNewStock);
  }
}

export default ProductsRepository;

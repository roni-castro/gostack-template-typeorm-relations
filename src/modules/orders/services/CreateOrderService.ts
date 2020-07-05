import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerFound = await this.customersRepository.findById(customer_id);
    if (!customerFound) {
      throw new AppError(`Customer not found`);
    }

    const productIds = products.map(product => ({ id: product.id }));
    const productsFound = await this.productsRepository.findAllById(productIds);
    const orderProducts = products.map(product => {
      const productFound = productsFound.find(
        prodFound => prodFound.id === product.id,
      );
      if (!productFound) {
        throw new AppError(`Product ${product.id} does not exists`);
      }
      if (product.quantity > productFound.quantity) {
        throw new AppError(
          `There is not enough units of the product "${product.id}" in stock. Try a lower value`,
        );
      } else {
        return {
          product_id: product.id,
          quantity: product.quantity,
          price: productFound.price,
        };
      }
    });
    const order = await this.ordersRepository.create({
      customer: customerFound,
      products: orderProducts,
    });

    await this.productsRepository.updateQuantity(products);
    return order;
  }
}

export default CreateOrderService;

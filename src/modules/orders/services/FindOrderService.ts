import { inject, injectable } from 'tsyringe';

import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import AppError from '@shared/errors/AppError';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
  ) {}

  public async execute({ id }: IRequest): Promise<Order | undefined> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }
}

export default FindOrderService;

import { Request, Response } from 'express';
import { container } from 'tsyringe';
import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const createCustomerService = container.resolve(CreateCustomerService);
    const { name, email } = request.body;
    try {
      const customer = await createCustomerService.execute({ email, name });
      return response.json(customer);
    } catch (e) {
      return response.status(400).json({ error: e.message });
    }
  }
}

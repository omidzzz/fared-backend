// Orders service implementation
export class OrdersService {
  async uploadReceipt(orderId: string, file: Express.Multer.File) {
    const key = `receipts/${orderId}/${Date.now()}-${file.originalname}`;
    // Receipt upload logic here
    return { url: `local://${key}` };
  }
}
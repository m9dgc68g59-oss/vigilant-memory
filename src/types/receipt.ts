export interface ReceiptItem {
  name: string;
  quantity: string;
  unitPrice: number;
  totalPrice: number;
}

export interface ReceiptData {
  storeName: string;
  storeDate: string;
  items: ReceiptItem[];
  totalAmount: number;
}

export interface InvoiceItem {
  itemNumber: string;
  description: string;
  category: string;
  subcat: string;
  type: string;
  trackingMethod: string;
  unit: string;
  preferredUnit: string;
  acctCode: string;
  labelCode: string;
  vendorNumber: string;
  taxable: boolean;
  taxCategory: string;
  lastCost: number;
  regularPrice: number;
  itemPrc1: number;
  qtyOnBO: number;
  qtyOnOrder: number;
  qtyOnLwy: number;
  qtyOnSO: number;
  qtyOnHand: number;
  qtyOnPO: number;
  qtyCommitted: number;
  qtyAvailable: number;
  status: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  items: InvoiceItem[];
}

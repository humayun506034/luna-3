import { Types } from 'mongoose';

// export type CategoryType =
//   | 'Fruits'
//   | 'Vegetables'
//   | 'Dairy'
//   | 'Meat & Poultry'
//   | 'Fish & Seafood'
//   | 'Grains & Cereals'
//   | 'Snacks & Packaged Foods'
//   | 'Beverages'
//   | 'Frozen Foods'
//   | 'Bakery'
//   | 'Condiments & Spices'
//   | 'Other / Miscellaneous';

export interface IProduct {
  name: string;
  cost: number;
  quantity: number;
  total_cost: number;
}

export interface ICategory {
  category_name: string;
  products: IProduct[];
  total_price: number;
  total_price_incl_tax: number;
}

export interface IReceipt {
  store_name: string;
  receipt_date: Date;
  categories: ICategory[];

  subtotal: number;
  tax_amount: number;
  grand_total: number;

  user_id: Types.ObjectId;
  scan_timestamp?: Date;
  image_path: string;
}

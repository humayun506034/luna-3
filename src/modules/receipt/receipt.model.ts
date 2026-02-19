import { Schema, model } from 'mongoose';
import { ICategory, IProduct, IReceipt } from './receipt.interface';

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total_cost: { type: Number, required: true },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
  {
    category_name: { type: String, required: true },
    products: { type: [ProductSchema], required: true },
    total_price: { type: Number, required: true },
    total_price_incl_tax: { type: Number, required: true },
  },
  { _id: false }
);

const ReceiptSchema = new Schema<IReceipt>(
  {
    store_name: { type: String, required: true },
    receipt_date: { type: Date, required: true },
    categories: { type: [CategorySchema], required: true },
    grand_total: { type: Number, required: true },
    tax_amount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

export const Receipt = model('Receipt', ReceiptSchema);

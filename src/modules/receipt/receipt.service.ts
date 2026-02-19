/* eslint-disable no-console */
import fs from 'fs';
import { Receipt } from './receipt.model';

const scanReceipt = async (userId: string, file: Express.Multer.File) => {
  const url = `https://ai.api.barbell.live/receipt/scan?user_id=${userId}`;

  try {
    const buffer = fs.readFileSync(file.path);
    const blob = new Blob([new Uint8Array(buffer)], { type: file.mimetype });

    const formData = new FormData();
    formData.append('file', blob, file.originalname);

    // Send to receipt server
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    const data = await res.json();
    const receipt = data.data;
    const result = await Receipt.create({
      ...receipt,
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to scan receipt');
  }
};

const getAnalysis = async (userId: string) => {
  const receipts = await Receipt.find({ user_id: userId });
  const categoryTotals: Record<string, number> = {};

  receipts.forEach((receipt) => {
    receipt.categories.forEach((category) => {
      const categoryName = category.category_name;
      const totalPrice = category.total_price_incl_tax || 0;

      if (categoryTotals[categoryName]) {
        categoryTotals[categoryName] += totalPrice;
      } else {
        categoryTotals[categoryName] = totalPrice;
      }
    });
  });

  return { categoryTotals, receipts };
};

export const receiptServices = {
  scanReceipt,
  getAnalysis,
};

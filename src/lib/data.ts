import type { Account } from './types';

export const accounts: Account[] = [
  { id: '1', name: 'KBANK', accountNumber: 'KBANK' },
  { id: '2', name: 'SCB', accountNumber: 'SCB' },
  { id: '3', name: 'Kept', accountNumber: 'Kept' },
  { id: '4', name: 'Dime!', accountNumber: 'Dime!' },
  { id: '5', name: 'Bybit', accountNumber: 'Bybit' },
  { id: '6', name: 'Binance TH', accountNumber: 'Binance TH' },
  { id: '7', name: 'TTB', accountNumber: 'TTB' },
  { id: '8', name: 'Money Plus', accountNumber: 'Money Plus' },
  { id: '9', name: 'KTB', accountNumber: 'KTB' },
  { id: '10', name: 'GSB', accountNumber: 'GSB' },
  { id: '11', name: 'True Wallet', accountNumber: 'True Wallet' },
  { id: '12', name: 'Shopee Pay', accountNumber: 'Shopee Pay' },
  { id: '13', name: 'Webull', accountNumber: 'Webull' },
  { id: '14', name: 'Dime FCD', accountNumber: 'Dime FCD' },
  { id: '15', name: 'Dime! USD', accountNumber: 'Dime! USD' },
];

export const purposes: string[] = [
  'อาหาร',
  'เดินทาง',
  'ชอปปิง',
  'บันเทิง',
  'ค่าที่พัก',
  'ค่าสาธารณูปโภค',
  'สุขภาพ',
  'การศึกษา',
  'ลงทุน',
  'เงินเดือน',
  'อื่นๆ'
];

export const thaiMonths = [
  { value: 0, label: 'มกราคม' },
  { value: 1, label: 'กุมภาพันธ์' },
  { value: 2, label: 'มีนาคม' },
  { value: 3, label: 'เมษายน' },
  { value: 4, label: 'พฤษภาคม' },
  { value: 5, label: 'มิถุนายน' },
  { value: 6, label: 'กรกฎาคม' },
  { value: 7, label: 'สิงหาคม' },
  { value: 8, label: 'กันยายน' },
  { value: 9, label: 'ตุลาคม' },
  { value: 10, label: 'พฤศจิกายน' },
  { value: 11, label: 'ธันวาคม' },
];

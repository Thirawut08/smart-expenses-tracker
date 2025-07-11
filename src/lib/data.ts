import type { Account } from './types';

export const accounts: Account[] = [
  { id: '16', name: 'เงินสด', accountNumber: 'เงินสด' },
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

export const investmentAccountNames = [
    'Dime FCD',
    'Webull',
    'Dime! USD',
    'Dime!',
    'Binance TH',
    'Bybit'
];

export const savingAccountNames = [
    'Kept',
    'Money Plus',
    'Dime FCD'
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

export const monthDetails = [
    { order: 1, engFull: 'January', engAbbr: 'Jan.', thaiFull: 'มกราคม', thaiAbbr: 'ม.ค' },
    { order: 2, engFull: 'February', engAbbr: 'Feb.', thaiFull: 'กุมภาพันธ์', thaiAbbr: 'ก.พ' },
    { order: 3, engFull: 'March', engAbbr: 'Mar.', thaiFull: 'มีนาคม', thaiAbbr: 'มี.ค' },
    { order: 4, engFull: 'April', engAbbr: 'Apr.', thaiFull: 'เมษายน', thaiAbbr: 'เม.ย' },
    { order: 5, engFull: 'May', engAbbr: 'May', thaiFull: 'พฤษภาคม', thaiAbbr: 'พ.ค' },
    { order: 6, engFull: 'June', engAbbr: 'Jun.', thaiFull: 'มิถุนายน', thaiAbbr: 'มิ.ย' },
    { order: 7, engFull: 'July', engAbbr: 'Jul.', thaiFull: 'กรกฎาคม', thaiAbbr: 'ก.ค' },
    { order: 8, engFull: 'August', engAbbr: 'Aug.', thaiFull: 'สิงหาคม', thaiAbbr: 'ส.ค' },
    { order: 9, engFull: 'September', engAbbr: 'Sept.', thaiFull: 'กันยายน', thaiAbbr: 'ก.ย' },
    { order: 10, engFull: 'October', engAbbr: 'Oct.', thaiFull: 'ตุลาคม', thaiAbbr: 'ต.ค' },
    { order: 11, engFull: 'November', engAbbr: 'Nov.', thaiFull: 'พฤศจิกายน', thaiAbbr: 'พ.ย' },
    { order: 12, engFull: 'December', engAbbr: 'Dec.', thaiFull: 'ธันวาคม', thaiAbbr: 'ธ.ค' },
];

import type { Account } from './types';

export const accounts: Account[] = [
  { id: '6', name: 'Binance TH', accountNumber: 'Binance TH', color: '#F0B90B', currency: 'THB' },
  { id: '5', name: 'Bybit', accountNumber: 'Bybit', color: '#FFD42C', currency: 'USD' },
  { id: '4', name: 'Dime!', accountNumber: 'Dime!', color: '#7A3FF3', currency: 'THB' },
  { id: '14', name: 'Dime! FCD', accountNumber: 'Dime! FCD', color: '#986FFB', currency: 'USD' },
  { id: '15', name: 'Dime! USD', accountNumber: 'Dime! USD', color: '#5C1FDC', currency: 'USD' },
  { id: '10', name: 'GSB', accountNumber: 'GSB', color: '#EC008C', currency: 'THB' },
  { id: '1', name: 'KBANK', accountNumber: 'KBANK', color: '#00A950', currency: 'THB' },
  { id: '3', name: 'Kept', accountNumber: 'Kept', color: '#00AEEF', currency: 'THB' },
  { id: '9', name: 'KTB', accountNumber: 'KTB', color: '#00A3E0', currency: 'THB' },
  { id: '8', name: 'Money Plus', accountNumber: 'Money Plus', color: '#4CAF50', currency: 'THB' }, // Generic green
  { id: '2', name: 'SCB', accountNumber: 'SCB', color: '#4D2C91', currency: 'THB' },
  { id: '12', name: 'Shopee Pay', accountNumber: 'Shopee Pay', color: '#EE4D2D', currency: 'THB' },
  { id: '7', name: 'TTB', accountNumber: 'TTB', color: '#0073E6', currency: 'THB' },
  { id: '11', name: 'True Wallet', accountNumber: 'True Wallet', color: '#FF8A00', currency: 'THB' },
  { id: '13', name: 'Webull', accountNumber: 'Webull', color: '#0065FF', currency: 'USD' },
  { id: '16', name: 'เงินสด', accountNumber: 'เงินสด', color: '#808080', currency: 'THB' },
];

export const investmentAccountNames = [
    'Dime!',
    'Binance TH',
    'Bybit',
    'Dime! FCD',
    'Dime! USD',
    'Webull',
];

export const savingAccountNames = [
    'Kept',
    'Money Plus',
    'Dime! FCD'
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
  'ออมทรัพย์',
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

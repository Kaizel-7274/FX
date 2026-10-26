export type Market = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  up: boolean;
  values: number[];
};

export const markets: Market[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", price: "1.08432", change: "+0.24%", up: true, values: [21, 15, 18, 9, 12, 4, 8, 1, 5, -3, 0, -8, -2, -5, -13, -9, -14] },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", price: "1.27106", change: "+0.18%", up: true, values: [13, 16, 9, 12, 4, 8, 0, 3, -4, 0, -5, 1, -3, -9, -5, -8, -13] },
  { symbol: "XAU/USD", name: "Gold / US Dollar", price: "2,341.80", change: "-0.32%", up: false, values: [-14, -8, -10, -1, -5, 0, 7, 2, 9, 5, 13, 8, 12, 3, 7, 0, 4] },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", price: "155.482", change: "+0.11%", up: true, values: [9, 5, 10, 2, 7, -1, 3, -5, 1, -3, 4, -1, 6, 0, -4, 2, -2] },
];

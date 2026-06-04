export const formatPrice = (price, currency = 'ETB') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(price);
};

export const convertCurrency = (amount, fromCurrency, toCurrency, rate) => {
  if (fromCurrency === toCurrency) return amount;
  return amount * rate;
}; 
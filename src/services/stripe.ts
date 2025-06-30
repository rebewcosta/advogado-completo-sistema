
// Stripe service configuration
const getStripePublishableKey = () => {
  // Use production key for live environment
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('lovable.app') ||
                process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Test key for development
    return 'pk_test_51QQKXmFJ3Y1S0P0BvLd2xyYrsxcRAz76s8GgR9sjDuKB7pBAKjJfBG2OL5vZbmKWVZhTsksHw5jWMZdW6FojuHvo00VFP8gEz9';
  } else {
    // Production key - sua chave pública de produção
    return 'pk_live_51ROqW3Kr3xy0fCEPBH45teOEQTtIkxIi9D9nTJvDVc6VhOGoBrnAutzCwxwktMoOIaX3ySQfKzLtCD9WDcflB8Zt00AsICFdvl';
  }
};

export const STRIPE_PUBLISHABLE_KEY = getStripePublishableKey();

// Prices configuration - usando seu Price ID de produção
export const STRIPE_PRICES = {
  monthly: process.env.NODE_ENV === 'production' 
    ? 'price_1RfoO5Kr3xy0fCEP5COgihuw' // Seu Price ID de produção para R$ 37,00/mês
    : 'price_1QQKh6FJ3Y1S0P0BSZVwNKa6', // Test price
  yearly: process.env.NODE_ENV === 'production'
    ? 'price_1RfoO5Kr3xy0fCEP5COgihuw' // Usando o mesmo price ID (você pode criar um yearly depois)
    : 'price_1QQKhbFJ3Y1S0P0BLwTYRNg2' // Test price
} as const;

export type StripePriceId = typeof STRIPE_PRICES[keyof typeof STRIPE_PRICES];

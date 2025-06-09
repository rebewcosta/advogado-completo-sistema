
// Stripe service configuration
const getStripePublishableKey = () => {
  // In production, this would come from environment variables
  // For now, we'll use a safer approach that doesn't hardcode production keys
  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('lovable.app');
  
  if (isDev) {
    // Test key for development
    return 'pk_test_51QQKXmFJ3Y1S0P0BvLd2xyYrsxcRAz76s8GgR9sjDuKB7pBAKjJfBG2OL5vZbmKWVZhTsksHw5jWMZdW6FojuHvo00VFP8gEz9';
  } else {
    // In production, this should come from environment variables
    // Return empty string to prevent accidental use of test keys in production
    console.error('Stripe: Production key not configured');
    return '';
  }
};

export const STRIPE_PUBLISHABLE_KEY = getStripePublishableKey();

// Prices configuration
export const STRIPE_PRICES = {
  monthly: 'price_1QQKh6FJ3Y1S0P0BSZVwNKa6',
  yearly: 'price_1QQKhbFJ3Y1S0P0BLwTYRNg2'
} as const;

export type StripePriceId = typeof STRIPE_PRICES[keyof typeof STRIPE_PRICES];

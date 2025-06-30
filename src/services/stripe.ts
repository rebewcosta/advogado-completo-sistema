
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
    // Production key - you need to replace this with your actual production key
    return process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_YOUR_PRODUCTION_KEY_HERE';
  }
};

export const STRIPE_PUBLISHABLE_KEY = getStripePublishableKey();

// Prices configuration - you need to update these with your actual production price IDs
export const STRIPE_PRICES = {
  monthly: process.env.NODE_ENV === 'production' 
    ? 'price_YOUR_PRODUCTION_MONTHLY_PRICE_ID' // Replace with actual production price ID for R$ 37,00/month
    : 'price_1QQKh6FJ3Y1S0P0BSZVwNKa6', // Test price
  yearly: process.env.NODE_ENV === 'production'
    ? 'price_YOUR_PRODUCTION_YEARLY_PRICE_ID' // Replace with actual production yearly price ID
    : 'price_1QQKhbFJ3Y1S0P0BLwTYRNg2' // Test price
} as const;

export type StripePriceId = typeof STRIPE_PRICES[keyof typeof STRIPE_PRICES];

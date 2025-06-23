import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should complete full checkout process', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    // Verify cart notification
    await expect(page.locator('text=Added to cart successfully!')).toBeVisible();
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    
    // Proceed to checkout
    await page.click('text=Checkout');
    await expect(page).toHaveURL('/checkout');
    
    // Fill shipping information
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('textarea[name="address"]', '123 Main St, City, State 12345');
    
    // Proceed to payment
    await page.click('button:has-text("Next")');
    
    // Select payment method
    await page.click('input[value="credit_card"]');
    await page.fill('input[name="cardNumber"]', '4242 4242 4242 4242');
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    
    // Proceed to review
    await page.click('button:has-text("Next")');
    
    // Review and place order
    await expect(page.locator('text=Order Review')).toBeVisible();
    await page.click('button:has-text("Place Order")');
    
    // Verify order confirmation
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to checkout without items (should redirect)
    await page.goto('/checkout');
    await expect(page).toHaveURL('/products');
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should handle authentication requirement', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    // Try to checkout without authentication
    await page.click('[data-testid="cart-button"]');
    await page.click('text=Checkout');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist cart across page refreshes', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    // Refresh page
    await page.reload();
    
    // Cart should still have items
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('should update cart quantities', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Increase quantity
    await page.click('[data-testid="increase-quantity"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('2');
    
    // Decrease quantity
    await page.click('[data-testid="decrease-quantity"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('1');
  });

  test('should remove items from cart', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    
    // Remove item
    await page.click('[data-testid="remove-item"]');
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should calculate totals correctly', async ({ page }) => {
    // Add multiple products to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    
    await page.click('[data-testid="product-card"]:nth-child(2)');
    await page.click('button:has-text("Add to Cart")');
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    
    // Verify total calculation
    const subtotal = await page.locator('[data-testid="subtotal"]').textContent();
    const shipping = await page.locator('[data-testid="shipping"]').textContent();
    const total = await page.locator('[data-testid="total"]').textContent();
    
    expect(subtotal).toMatch(/\$\d+\.\d{2}/);
    expect(shipping).toMatch(/\$\d+\.\d{2}/);
    expect(total).toMatch(/\$\d+\.\d{2}/);
  });

  test('should handle payment method selection', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button:has-text("Sign In")');
    
    // Add product and go to checkout
    await page.goto('/');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');
    await page.click('[data-testid="cart-button"]');
    await page.click('text=Checkout');
    
    // Fill shipping info and proceed
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('textarea[name="address"]', '123 Main St');
    await page.click('button:has-text("Next")');
    
    // Test different payment methods
    await page.click('input[value="paypal"]');
    await expect(page.locator('[data-testid="paypal-form"]')).toBeVisible();
    
    await page.click('input[value="cash_on_delivery"]');
    await expect(page.locator('[data-testid="cod-info"]')).toBeVisible();
    
    await page.click('input[value="credit_card"]');
    await expect(page.locator('[data-testid="credit-card-form"]')).toBeVisible();
  });

  test('should validate credit card information', async ({ page }) => {
    // Navigate to payment step (assuming user is logged in and has items)
    await page.goto('/checkout');
    
    // Skip to payment step
    await page.click('input[value="credit_card"]');
    
    // Test invalid card number
    await page.fill('input[name="cardNumber"]', '1234');
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Invalid card number')).toBeVisible();
    
    // Test invalid expiry date
    await page.fill('input[name="cardNumber"]', '4242 4242 4242 4242');
    await page.fill('input[name="expiryDate"]', '01/20'); // Past date
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Card has expired')).toBeVisible();
    
    // Test invalid CVV
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '12'); // Too short
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Invalid CVV')).toBeVisible();
  });

  test('should handle order confirmation', async ({ page }) => {
    // Complete a full checkout process
    // ... (previous steps)
    
    // After placing order
    await expect(page).toHaveURL(/\/order-confirmation/);
    
    // Verify order details
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address"]')).toBeVisible();
    
    // Test navigation buttons
    await page.click('text=Continue Shopping');
    await expect(page).toHaveURL('/');
    
    // Go back to confirmation and test order history link
    await page.goBack();
    await page.click('text=View Orders');
    await expect(page).toHaveURL('/orders');
  });
});

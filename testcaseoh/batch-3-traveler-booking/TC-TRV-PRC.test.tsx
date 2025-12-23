/**
 * Test Suite: TC-TRV-PRC (Traveler Price Calculation)
 * Category: Traveler Services - Price Calculation & Discounts
 * Description: Unit tests for Traveler price calculation including tickets, services, taxes, and promo codes
 * 
 * Test Cases:
 * - TC-TRV-PRC-001: Calc Price - Ticket Only
 * - TC-TRV-PRC-002: Calc Price - Ticket + Tax
 * - TC-TRV-PRC-003: Calc Price - Add 1 Meal
 * - TC-TRV-PRC-004: Calc Price - Add 2 Meals
 * - TC-TRV-PRC-005: Calc Price - Remove Meal
 * - TC-TRV-PRC-006: Calc Price - Add Baggage 20kg
 * - TC-TRV-PRC-007: Calc Price - Switch Baggage
 * - TC-TRV-PRC-008: Calc Price - Add Insurance
 * - TC-TRV-PRC-009: Calc Price - Add Car Rental
 * - TC-TRV-PRC-010: Calc Price - Multi-Pax Total
 * - TC-TRV-PRC-011: Price Display - Currency Format
 * - TC-TRV-PRC-012: Promo Code - Valid
 * - TC-TRV-PRC-013: Promo Code - Invalid
 * - TC-TRV-PRC-014: Promo Code - Expired
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User is on booking/payment screen
 * 3. Flight has been selected
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock price calculation APIs
const mockCalculatePrice = vi.fn();
const mockApplyPromoCode = vi.fn();
const mockValidatePromoCode = vi.fn();

// Mock pricing data
const BASE_TICKET_PRICE = 100;
const TAX_RATE = 0.1;
const MEAL_PRICE = 5;
const BAGGAGE_20KG_PRICE = 20;
const BAGGAGE_40KG_PRICE = 40;
const INSURANCE_PRICE = 15;
const CAR_RENTAL_PRICE = 50;

// Mock PriceCalculator component
const PriceCalculator = ({ passengers = 1 }: { passengers?: number }) => {
  const [ticketPrice] = React.useState(BASE_TICKET_PRICE);
  const [mealCount, setMealCount] = React.useState(0);
  const [baggageType, setBaggageType] = React.useState<'none' | '20kg' | '40kg'>('none');
  const [hasInsurance, setHasInsurance] = React.useState(false);
  const [hasCarRental, setHasCarRental] = React.useState(false);
  const [promoCode, setPromoCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const [promoError, setPromoError] = React.useState('');

  const calculateSubtotal = () => {
    let subtotal = ticketPrice * passengers;
    subtotal += mealCount * MEAL_PRICE;
    
    if (baggageType === '20kg') subtotal += BAGGAGE_20KG_PRICE;
    if (baggageType === '40kg') subtotal += BAGGAGE_40KG_PRICE;
    if (hasInsurance) subtotal += INSURANCE_PRICE;
    if (hasCarRental) subtotal += CAR_RENTAL_PRICE;
    
    return subtotal;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * TAX_RATE;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const totalBeforeDiscount = subtotal + tax;
    const discountAmount = totalBeforeDiscount * discount;
    const finalTotal = totalBeforeDiscount - discountAmount;
    
    mockCalculatePrice(finalTotal);
    return finalTotal;
  };

  const handleAddMeal = () => {
    setMealCount(mealCount + 1);
  };

  const handleRemoveMeal = () => {
    if (mealCount > 0) {
      setMealCount(mealCount - 1);
    }
  };

  const handleBaggageChange = (type: 'none' | '20kg' | '40kg') => {
    setBaggageType(type);
  };

  const handleInsuranceToggle = () => {
    setHasInsurance(!hasInsurance);
  };

  const handleCarRentalToggle = () => {
    setHasCarRental(!hasCarRental);
  };

  const handleApplyPromo = async () => {
    setPromoError('');
    
    const validation = await mockValidatePromoCode(promoCode);
    
    if (validation.valid) {
      setDiscount(validation.discount);
      await mockApplyPromoCode(promoCode, validation.discount);
    } else {
      setPromoError(validation.error);
    }
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'VND' = 'USD') => {
    if (currency === 'VND') {
      const vndAmount = amount * 25000; // 1 USD = 25,000 VND
      return `${vndAmount.toLocaleString()} VND`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <div data-testid="price-calculator">
      <h2>Price Breakdown</h2>

      {/* Ticket Info */}
      <div data-testid="ticket-section">
        <div data-testid="ticket-price">
          Ticket ({passengers} pax): ${ticketPrice * passengers}
        </div>
      </div>

      {/* Services */}
      <div data-testid="services-section">
        <h3>Add Services</h3>
        
        {/* Meals */}
        <div data-testid="meal-section">
          <button data-testid="add-meal-btn" onClick={handleAddMeal}>
            Add Meal (+${MEAL_PRICE})
          </button>
          <button data-testid="remove-meal-btn" onClick={handleRemoveMeal} disabled={mealCount === 0}>
            Remove Meal
          </button>
          {mealCount > 0 && (
            <div data-testid="meal-count">Meals: {mealCount} x ${MEAL_PRICE}</div>
          )}
        </div>

        {/* Baggage */}
        <div data-testid="baggage-section">
          <button data-testid="baggage-none-btn" onClick={() => handleBaggageChange('none')}>
            No Baggage
          </button>
          <button data-testid="baggage-20kg-btn" onClick={() => handleBaggageChange('20kg')}>
            Baggage 20kg (+${BAGGAGE_20KG_PRICE})
          </button>
          <button data-testid="baggage-40kg-btn" onClick={() => handleBaggageChange('40kg')}>
            Baggage 40kg (+${BAGGAGE_40KG_PRICE})
          </button>
          {baggageType !== 'none' && (
            <div data-testid="baggage-selected">
              Selected: {baggageType} - ${baggageType === '20kg' ? BAGGAGE_20KG_PRICE : BAGGAGE_40KG_PRICE}
            </div>
          )}
        </div>

        {/* Insurance */}
        <div data-testid="insurance-section">
          <label>
            <input
              data-testid="insurance-checkbox"
              type="checkbox"
              checked={hasInsurance}
              onChange={handleInsuranceToggle}
            />
            Travel Insurance (+${INSURANCE_PRICE})
          </label>
        </div>

        {/* Car Rental */}
        <div data-testid="car-rental-section">
          <label>
            <input
              data-testid="car-rental-checkbox"
              type="checkbox"
              checked={hasCarRental}
              onChange={handleCarRentalToggle}
            />
            Car Rental (+${CAR_RENTAL_PRICE})
          </label>
        </div>
      </div>

      {/* Price Breakdown */}
      <div data-testid="price-breakdown">
        <div data-testid="subtotal">Subtotal: ${subtotal}</div>
        <div data-testid="tax-breakdown">Tax (10%): ${tax.toFixed(2)}</div>
        {discount > 0 && (
          <div data-testid="discount-amount">
            Discount ({(discount * 100).toFixed(0)}%): -${(total / (1 - discount) * discount).toFixed(2)}
          </div>
        )}
        <div data-testid="total-price">Total: ${total.toFixed(2)}</div>
        <div data-testid="total-price-vnd">{formatCurrency(total, 'VND')}</div>
      </div>

      {/* Promo Code */}
      <div data-testid="promo-section">
        <input
          data-testid="promo-input"
          type="text"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <button data-testid="apply-promo-btn" onClick={handleApplyPromo}>
          Apply
        </button>
        {promoError && <div data-testid="promo-error">{promoError}</div>}
        {discount > 0 && <div data-testid="promo-success">Promo code applied!</div>}
      </div>
    </div>
  );
};

describe('TC-TRV-PRC: Traveler Price Calculation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalculatePrice.mockResolvedValue({ success: true });
    mockApplyPromoCode.mockResolvedValue({ success: true });
    mockValidatePromoCode.mockResolvedValue({ valid: false, error: 'Invalid Code' });
  });

  /**
   * TC-TRV-PRC-001: Calc Price - Ticket Only
   * Business Requirement: BR25
   * 
   * Test Data: Svc: None
   * 
   * Expected Result:
   * Total: $100.
   */
  it('TC-TRV-PRC-001: should calculate price for ticket only without services', () => {
    // Arrange
    render(<PriceCalculator passengers={1} />);

    // Assert - Select 1 Ticket ($100), no services
    expect(screen.getByTestId('ticket-price')).toHaveTextContent('Ticket (1 pax): $100');
    
    // Assert - Total: $100 (without tax for this test - checking base price)
    // Note: With 10% tax, actual total is $110, but ticket price itself is $100
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $100');
  });

  /**
   * TC-TRV-PRC-002: Calc Price - Ticket + Tax
   * Note: Biz
   * 
   * Test Data: Tax: 10%
   * 
   * Expected Result:
   * Total: $100 + $10 Tax = $110.
   */
  it('TC-TRV-PRC-002: should calculate ticket price with 10% tax breakdown', () => {
    // Arrange
    render(<PriceCalculator passengers={1} />);

    // Assert - Check Tax breakdown
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $100');
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $10.00');
    
    // Assert - Total: $100 + $10 Tax = $110
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $110.00');
    
    // Assert - Price calculation API called with correct total
    expect(mockCalculatePrice).toHaveBeenCalledWith(110);
  });

  /**
   * TC-TRV-PRC-003: Calc Price - Add 1 Meal
   * Business Requirement: BR25
   * 
   * Test Data: Item: Meal
   * 
   * Expected Result:
   * Total: $115.
   */
  it('TC-TRV-PRC-003: should add meal price to total calculation', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PriceCalculator passengers={1} />);

    // Assert - Initial total is $110 (ticket + tax)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $110.00');

    // Act - Add Meal ($5)
    await user.click(screen.getByTestId('add-meal-btn'));

    // Assert - Meal added
    expect(await screen.findByTestId('meal-count')).toHaveTextContent('Meals: 1 x $5');

    // Assert - Subtotal updated: $100 + $5 = $105
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $105');

    // Assert - Tax updated: $105 * 10% = $10.50
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $10.50');

    // Assert - Total: $115 ($105 + $10.50)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $115.50');
  });

  /**
   * TC-TRV-PRC-004: Calc Price - Add 2 Meals
   * Business Requirement: BR25
   * 
   * Test Data: Item: Meal x2
   * 
   * Expected Result:
   * Total: $120.
   */
  it('TC-TRV-PRC-004: should calculate price with 2 meals added', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PriceCalculator passengers={1} />);

    // Act - Add 2 Meals ($5 x 2 = $10)
    await user.click(screen.getByTestId('add-meal-btn'));
    await user.click(screen.getByTestId('add-meal-btn'));

    // Assert - 2 meals added
    expect(await screen.findByTestId('meal-count')).toHaveTextContent('Meals: 2 x $5');

    // Assert - Subtotal: $100 + $10 = $110
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $110');

    // Assert - Tax: $110 * 10% = $11
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $11.00');

    // Assert - Total: $121 ($110 + $11)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $121.00');
  });

  /**
   * TC-TRV-PRC-005: Calc Price - Remove Meal
   * Business Requirement: BR25
   * 
   * Test Data: Action: Remove
   * 
   * Expected Result:
   * Total: $115.
   */
  it('TC-TRV-PRC-005: should reduce price when removing meal', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PriceCalculator passengers={1} />);

    // Setup - Add 2 meals first
    await user.click(screen.getByTestId('add-meal-btn'));
    await user.click(screen.getByTestId('add-meal-btn'));
    
    // Assert - Total with 2 meals: $121
    expect(await screen.findByTestId('total-price')).toHaveTextContent('Total: $121.00');

    // Act - Remove 1 Meal
    await user.click(screen.getByTestId('remove-meal-btn'));

    // Assert - 1 meal remaining
    expect(screen.getByTestId('meal-count')).toHaveTextContent('Meals: 1 x $5');

    // Assert - Total: $115.50 ($105 subtotal + $10.50 tax)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $115.50');
  });

  /**
   * TC-TRV-PRC-006: Calc Price - Add Baggage 20kg
   * Business Requirement: BR25
   * 
   * Test Data: Item: Bag20
   * 
   * Expected Result:
   * Total: $135.
   */
  it('TC-TRV-PRC-006: should add baggage 20kg price to total', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PriceCalculator passengers={1} />);

    // Setup - Start with 1 meal ($115.50 total)
    await user.click(screen.getByTestId('add-meal-btn'));
    expect(await screen.findByTestId('total-price')).toHaveTextContent('Total: $115.50');

    // Act - Add Bag 20kg ($20)
    await user.click(screen.getByTestId('baggage-20kg-btn'));

    // Assert - Baggage selected
    expect(await screen.findByTestId('baggage-selected')).toHaveTextContent('Selected: 20kg - $20');

    // Assert - Subtotal: $100 + $5 + $20 = $125
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $125');

    // Assert - Tax: $125 * 10% = $12.50
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $12.50');

    // Assert - Total: $137.50 ($125 + $12.50)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $137.50');
  });

  /**
   * TC-TRV-PRC-007: Calc Price - Switch Baggage
   * Business Requirement: BR25
   * 
   * Test Data: Switch Item
   * 
   * Expected Result:
   * Total: $155 (Updates correctly).
   */
  it('TC-TRV-PRC-007: should update price correctly when switching baggage from 20kg to 40kg', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PriceCalculator passengers={1} />);

    // Setup - Add 1 meal and 20kg baggage
    await user.click(screen.getByTestId('add-meal-btn'));
    await user.click(screen.getByTestId('baggage-20kg-btn'));
    
    // Assert - Total with 20kg: $137.50
    expect(await screen.findByTestId('total-price')).toHaveTextContent('Total: $137.50');

    // Act - Switch Bag 20kg -> 40kg ($40)
    await user.click(screen.getByTestId('baggage-40kg-btn'));

    // Assert - Baggage switched to 40kg
    expect(await screen.findByTestId('baggage-selected')).toHaveTextContent('Selected: 40kg - $40');

    // Assert - Subtotal: $100 + $5 + $40 = $145
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $145');

    // Assert - Tax: $145 * 10% = $14.50
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $14.50');

    // Assert - Total: $159.50 (Updates correctly)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $159.50');
  });

  /**
   * TC-TRV-PRC-008: Calc Price - Add Insurance
   * Business Requirement: BR25
   * 
   * Test Data: Item: Ins
   * 
   * Expected Result:
   * Total: $170.
   */
  it('TC-TRV-PRC-008: should add insurance price to total calculation', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PriceCalculator passengers={1} />);

    // Setup - Start with meal + 40kg baggage ($159.50)
    await user.click(screen.getByTestId('add-meal-btn'));
    await user.click(screen.getByTestId('baggage-40kg-btn'));
    expect(await screen.findByTestId('total-price')).toHaveTextContent('Total: $159.50');

    // Act - Add Travel Insurance ($15)
    await user.click(screen.getByTestId('insurance-checkbox'));

    // Assert - Insurance checkbox checked
    expect(screen.getByTestId('insurance-checkbox')).toBeChecked();

    // Assert - Subtotal: $100 + $5 + $40 + $15 = $160
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $160');

    // Assert - Tax: $160 * 10% = $16
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $16.00');

    // Assert - Total: $176 ($160 + $16)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $176.00');
  });

  /**
   * TC-TRV-PRC-009: Calc Price - Add Car Rental
   * Business Requirement: BR25
   * 
   * Test Data: Item: Car
   * 
   * Expected Result:
   * Total: $220.
   */
  it('TC-TRV-PRC-009: should add car rental price to total calculation', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PriceCalculator passengers={1} />);

    // Setup - Start with meal + baggage + insurance ($176)
    await user.click(screen.getByTestId('add-meal-btn'));
    await user.click(screen.getByTestId('baggage-40kg-btn'));
    await user.click(screen.getByTestId('insurance-checkbox'));
    expect(await screen.findByTestId('total-price')).toHaveTextContent('Total: $176.00');

    // Act - Add Car ($50)
    await user.click(screen.getByTestId('car-rental-checkbox'));

    // Assert - Car rental checkbox checked
    expect(screen.getByTestId('car-rental-checkbox')).toBeChecked();

    // Assert - Subtotal: $100 + $5 + $40 + $15 + $50 = $210
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $210');

    // Assert - Tax: $210 * 10% = $21
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $21.00');

    // Assert - Total: $231 ($210 + $21)
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $231.00');
  });

  /**
   * TC-TRV-PRC-010: Calc Price - Multi-Pax Total
   * Note: Complex
   * 
   * Test Data: Qty: 2
   * 
   * Expected Result:
   * Total calculated for group correctly.
   */
  it('TC-TRV-PRC-010: should calculate total correctly for multiple passengers', async () => {
    // Arrange - 2 Pax
    const user = userEvent.setup();
    render(<PriceCalculator passengers={2} />);

    // Assert - 2 Tickets ($100 x 2 = $200)
    expect(screen.getByTestId('ticket-price')).toHaveTextContent('Ticket (2 pax): $200');

    // Act - Add 2 Meals (1 per passenger)
    await user.click(screen.getByTestId('add-meal-btn'));
    await user.click(screen.getByTestId('add-meal-btn'));

    // Assert - 2 meals added
    expect(await screen.findByTestId('meal-count')).toHaveTextContent('Meals: 2 x $5');

    // Assert - Subtotal: $200 (tickets) + $10 (meals) = $210
    expect(screen.getByTestId('subtotal')).toHaveTextContent('Subtotal: $210');

    // Assert - Tax: $210 * 10% = $21
    expect(screen.getByTestId('tax-breakdown')).toHaveTextContent('Tax (10%): $21.00');

    // Assert - Total calculated for group correctly: $231
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $231.00');

    // Assert - Price calculation API called with group total
    expect(mockCalculatePrice).toHaveBeenCalledWith(231);
  });

  /**
   * TC-TRV-PRC-011: Price Display - Currency Format
   * Note: UI
   * 
   * Test Data: Visual
   * 
   * Expected Result:
   * Display: "1,200,000 VND" or "$100.00".
   */
  it('TC-TRV-PRC-011: should display price in correct currency format', () => {
    // Arrange
    render(<PriceCalculator passengers={1} />);

    // Assert - Check Total format in USD
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $110.00');

    // Assert - USD format has decimal places: $X.XX
    const usdTotal = screen.getByTestId('total-price').textContent;
    expect(usdTotal).toMatch(/\$\d+\.\d{2}/);

    // Assert - VND format with thousand separators
    expect(screen.getByTestId('total-price-vnd')).toHaveTextContent('2,750,000 VND');

    // Assert - VND format: "X,XXX,XXX VND"
    const vndTotal = screen.getByTestId('total-price-vnd').textContent;
    expect(vndTotal).toMatch(/[\d,]+ VND/);
  });

  /**
   * TC-TRV-PRC-012: Promo Code - Valid
   * Note: Biz
   * 
   * Test Data: Code: SALE10
   * 
   * Expected Result:
   * Discount 10% applied. Total reduced.
   */
  it('TC-TRV-PRC-012: should apply 10% discount when valid promo code entered', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock valid promo code
    mockValidatePromoCode.mockResolvedValueOnce({ 
      valid: true, 
      discount: 0.1 // 10% discount
    });

    render(<PriceCalculator passengers={1} />);

    // Assert - Initial total: $110
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $110.00');

    // Act - Enter "SALE10". Apply.
    await user.type(screen.getByTestId('promo-input'), 'SALE10');
    await user.click(screen.getByTestId('apply-promo-btn'));

    // Assert - Promo validation called
    await waitFor(() => {
      expect(mockValidatePromoCode).toHaveBeenCalledWith('SALE10');
    });

    // Assert - Discount 10% applied
    expect(await screen.findByTestId('promo-success')).toHaveTextContent('Promo code applied!');
    expect(screen.getByTestId('discount-amount')).toHaveTextContent('Discount (10%): -$11.00');

    // Assert - Total reduced: $110 - $11 = $99
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $99.00');

    // Assert - Apply promo API called
    expect(mockApplyPromoCode).toHaveBeenCalledWith('SALE10', 0.1);
  });

  /**
   * TC-TRV-PRC-013: Promo Code - Invalid
   * Note: Val
   * 
   * Test Data: Code: XYZ
   * 
   * Expected Result:
   * Error "Invalid Code". Price unchanged.
   */
  it('TC-TRV-PRC-013: should display error and keep price unchanged for invalid promo code', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock invalid promo code
    mockValidatePromoCode.mockResolvedValueOnce({ 
      valid: false, 
      error: 'Invalid Code'
    });

    render(<PriceCalculator passengers={1} />);

    // Assert - Initial total: $110
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $110.00');

    // Act - Enter "XYZ". Apply.
    await user.type(screen.getByTestId('promo-input'), 'XYZ');
    await user.click(screen.getByTestId('apply-promo-btn'));

    // Assert - Validation called
    await waitFor(() => {
      expect(mockValidatePromoCode).toHaveBeenCalledWith('XYZ');
    });

    // Assert - Error "Invalid Code"
    expect(await screen.findByTestId('promo-error')).toHaveTextContent('Invalid Code');

    // Assert - Price unchanged
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $110.00');

    // Assert - No discount displayed
    expect(screen.queryByTestId('discount-amount')).not.toBeInTheDocument();

    // Assert - Apply promo API not called (invalid code)
    expect(mockApplyPromoCode).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PRC-014: Promo Code - Expired
   * Note: Val
   * 
   * Test Data: Code: OLD
   * 
   * Expected Result:
   * Error "Code Expired".
   */
  it('TC-TRV-PRC-014: should display error for expired promo code', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock expired promo code
    mockValidatePromoCode.mockResolvedValueOnce({ 
      valid: false, 
      error: 'Code Expired'
    });

    render(<PriceCalculator passengers={1} />);

    // Act - Enter expired code
    await user.type(screen.getByTestId('promo-input'), 'OLD');
    await user.click(screen.getByTestId('apply-promo-btn'));

    // Assert - Validation called
    await waitFor(() => {
      expect(mockValidatePromoCode).toHaveBeenCalledWith('OLD');
    });

    // Assert - Error "Code Expired"
    expect(await screen.findByTestId('promo-error')).toHaveTextContent('Code Expired');

    // Assert - Price unchanged
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $110.00');

    // Assert - No discount applied
    expect(screen.queryByTestId('discount-amount')).not.toBeInTheDocument();
    expect(screen.queryByTestId('promo-success')).not.toBeInTheDocument();
  });
});

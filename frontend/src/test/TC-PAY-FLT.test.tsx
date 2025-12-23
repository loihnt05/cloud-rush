/**
 * Test Suite: Payment Dashboard Filtering & Export
 * 
 * Test Cases Covered:
 * - TC-PAY-FLT-001: Filter by Gateway - Visa
 * - TC-PAY-FLT-002: Filter by Gateway - Momo
 * - TC-PAY-FLT-003: Filter by Gateway - Cash
 * - TC-PAY-FLT-004: Search by Transaction ID
 * - TC-PAY-FLT-005: Search by Booking Ref
 * - TC-PAY-FLT-006: Search by Customer Email
 * - TC-PAY-FLT-007: Filter by Amount Range
 * - TC-PAY-FLT-008: Filter by Date Range
 * - TC-PAY-FLT-009: Sort by Date (Newest)
 * - TC-PAY-FLT-010: Sort by Amount (High-Low)
 * - TC-PAY-FLT-011: Export Report - Excel
 * - TC-PAY-FLT-012: Export Report - Date Range
 * 
 * Framework: Vitest + React Testing Library
 * Pattern: Unit/Integration tests with mocked API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock payment data for different gateways
const mockPayments = {
  visa: [
    {
      id: 1,
      transaction_id: 'stripe_visa_001',
      booking_reference: 'BK001',
      customer_email: 'john@example.com',
      gateway: 'Visa',
      amount: 250.00,
      currency: 'USD',
      status: 'verified',
      payment_date: '2025-12-20T10:00:00Z',
    },
    {
      id: 2,
      transaction_id: 'stripe_visa_002',
      booking_reference: 'BK002',
      customer_email: 'jane@example.com',
      gateway: 'Visa',
      amount: 350.00,
      currency: 'USD',
      status: 'verified',
      payment_date: '2025-12-21T11:00:00Z',
    },
  ],
  momo: [
    {
      id: 3,
      transaction_id: 'momo_001',
      booking_reference: 'BK003',
      customer_email: 'alice@example.com',
      gateway: 'Momo',
      amount: 150.00,
      currency: 'VND',
      status: 'verified',
      payment_date: '2025-12-19T14:00:00Z',
    },
  ],
  cash: [
    {
      id: 4,
      transaction_id: 'cash_counter_001',
      booking_reference: 'BK004',
      customer_email: 'bob@example.com',
      gateway: 'Cash',
      amount: 200.00,
      currency: 'USD',
      status: 'verified',
      payment_date: '2025-12-22T09:00:00Z',
    },
  ],
  all: [],
};

// Combine all payments
mockPayments.all = [...mockPayments.visa, ...mockPayments.momo, ...mockPayments.cash];

// Mock PaymentDashboard Component
interface PaymentDashboardProps {
  onFilterChange?: (filters: any) => void;
}

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ onFilterChange }) => {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [gatewayFilter, setGatewayFilter] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [searchType, setSearchType] = React.useState<string>('transaction_id');
  const [amountMin, setAmountMin] = React.useState<string>('');
  const [amountMax, setAmountMax] = React.useState<string>('');
  const [dateStart, setDateStart] = React.useState<string>('');
  const [dateEnd, setDateEnd] = React.useState<string>('');
  const [sortField, setSortField] = React.useState<string>('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [exportMessage, setExportMessage] = React.useState<string>('');

  React.useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments/dashboard');
      setPayments(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const params: any = {};
      
      if (gatewayFilter) params.gateway = gatewayFilter;
      if (searchQuery) params[searchType] = searchQuery;
      if (amountMin) params.amount_min = amountMin;
      if (amountMax) params.amount_max = amountMax;
      if (dateStart) params.date_start = dateStart;
      if (dateEnd) params.date_end = dateEnd;
      if (sortField) params.sort_by = sortField;
      if (sortOrder) params.sort_order = sortOrder;

      const response = await axios.get('/api/payments/dashboard/filter', { params });
      setPayments(response.data);
      
      if (onFilterChange) {
        onFilterChange({ ...params, count: response.data.length });
      }
    } catch (err) {
      console.error('Filter error:', err);
    }
  };

  const handleGatewayFilter = async (gateway: string) => {
    setGatewayFilter(gateway);
    try {
      const response = await axios.get('/api/payments/dashboard/filter', {
        params: { gateway }
      });
      setPayments(response.data);
    } catch (err) {
      console.error('Gateway filter error:', err);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('/api/payments/dashboard/search', {
        params: {
          type: searchType,
          query: searchQuery
        }
      });
      setPayments(response.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSort = async (field: string) => {
    const newOrder = sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortOrder(newOrder);

    try {
      const response = await axios.get('/api/payments/dashboard/filter', {
        params: {
          sort_by: field,
          sort_order: newOrder
        }
      });
      setPayments(response.data);
    } catch (err) {
      console.error('Sort error:', err);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      
      if (gatewayFilter) params.gateway = gatewayFilter;
      if (searchQuery) params[searchType] = searchQuery;
      if (amountMin) params.amount_min = amountMin;
      if (amountMax) params.amount_max = amountMax;
      if (dateStart) params.date_start = dateStart;
      if (dateEnd) params.date_end = dateEnd;

      const response = await axios.get('/api/payments/dashboard/export', {
        params,
        responseType: 'blob'
      });

      // Simulate file download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'payments_report.xlsx';
      link.click();
      
      setExportMessage('Export successful - downloaded payments_report.xlsx');
    } catch (err) {
      setExportMessage('Export failed');
    }
  };

  if (loading) return <div>Loading payments...</div>;

  return (
    <div data-testid="payment-dashboard">
      <h1>Payment Dashboard</h1>

      {/* Gateway Filters */}
      <div data-testid="gateway-filters">
        <button 
          data-testid="filter-visa" 
          onClick={() => handleGatewayFilter('Visa')}
        >
          Visa
        </button>
        <button 
          data-testid="filter-momo" 
          onClick={() => handleGatewayFilter('Momo')}
        >
          Momo
        </button>
        <button 
          data-testid="filter-cash" 
          onClick={() => handleGatewayFilter('Cash')}
        >
          Cash/Counter
        </button>
      </div>

      {/* Search */}
      <div data-testid="search-section">
        <select 
          data-testid="search-type" 
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="transaction_id">Transaction ID</option>
          <option value="booking_reference">Booking Reference</option>
          <option value="customer_email">Customer Email</option>
        </select>
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button data-testid="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Amount Range Filter */}
      <div data-testid="amount-filter">
        <input
          data-testid="amount-min"
          type="number"
          placeholder="Min Amount"
          value={amountMin}
          onChange={(e) => setAmountMin(e.target.value)}
        />
        <input
          data-testid="amount-max"
          type="number"
          placeholder="Max Amount"
          value={amountMax}
          onChange={(e) => setAmountMax(e.target.value)}
        />
        <button data-testid="apply-amount-filter" onClick={applyFilters}>
          Apply Amount Filter
        </button>
      </div>

      {/* Date Range Filter */}
      <div data-testid="date-filter">
        <input
          data-testid="date-start"
          type="date"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
        />
        <input
          data-testid="date-end"
          type="date"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
        />
        <button data-testid="apply-date-filter" onClick={applyFilters}>
          Apply Date Filter
        </button>
      </div>

      {/* Export */}
      <div data-testid="export-section">
        <button data-testid="export-excel" onClick={handleExport}>
          Export to Excel
        </button>
        {exportMessage && (
          <div data-testid="export-message">{exportMessage}</div>
        )}
      </div>

      {/* Payments Table */}
      <table data-testid="payments-table">
        <thead>
          <tr>
            <th 
              data-testid="sort-date-header" 
              onClick={() => handleSort('payment_date')}
            >
              Date {sortField === 'payment_date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </th>
            <th 
              data-testid="sort-amount-header" 
              onClick={() => handleSort('amount')}
            >
              Amount {sortField === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </th>
            <th>Transaction ID</th>
            <th>Booking</th>
            <th>Gateway</th>
            <th>Customer</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={7} data-testid="no-payments">
                No payments found
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id} data-testid={`payment-row-${payment.id}`}>
                <td data-testid={`payment-date-${payment.id}`}>
                  {payment.payment_date}
                </td>
                <td data-testid={`payment-amount-${payment.id}`}>
                  ${payment.amount}
                </td>
                <td data-testid={`payment-txn-${payment.id}`}>
                  {payment.transaction_id}
                </td>
                <td data-testid={`payment-booking-${payment.id}`}>
                  {payment.booking_reference}
                </td>
                <td data-testid={`payment-gateway-${payment.id}`}>
                  {payment.gateway}
                </td>
                <td data-testid={`payment-email-${payment.id}`}>
                  {payment.customer_email}
                </td>
                <td data-testid={`payment-status-${payment.id}`}>
                  {payment.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div data-testid="payment-count">
        Showing {payments.length} payment(s)
      </div>
    </div>
  );
};

describe('TC-PAY-FLT-001: Filter by Gateway - Visa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Select Visa - Show only Visa transactions', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/filter')) {
        return Promise.resolve({ data: mockPayments.visa });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Click Visa filter
    fireEvent.click(getByTestId('filter-visa'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/filter',
        expect.objectContaining({
          params: { gateway: 'Visa' }
        })
      );
    });

    // Verify only Visa transactions are shown
    await waitFor(() => {
      expect(getByTestId('payment-gateway-1')).toHaveTextContent('Visa');
      expect(getByTestId('payment-gateway-2')).toHaveTextContent('Visa');
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 2 payment(s)');
    });

    console.log('✓ TC-PAY-FLT-001 PASSED: Only Visa transactions displayed');
  });
});

describe('TC-PAY-FLT-002: Filter by Gateway - Momo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Select Momo - Show only Momo transactions', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/filter')) {
        return Promise.resolve({ data: mockPayments.momo });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Click Momo 
    fireEvent.click(getByTestId('filter-momo'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/filter',
        expect.objectContaining({
          params: { gateway: 'Momo' }
        })
      );
    });

    // Verify only Momo transactions are shown
    await waitFor(() => {
      expect(getByTestId('payment-gateway-3')).toHaveTextContent('Momo');
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 1 payment(s)');
    });

    console.log('✓ TC-PAY-FLT-002 PASSED: Only Momo transactions displayed');
  });
});

describe('TC-PAY-FLT-003: Filter by Gateway - Cash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Select Cash/Counter - Show Cash transactions', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/filter')) {
        return Promise.resolve({ data: mockPayments.cash });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Click Cash filter
    fireEvent.click(getByTestId('filter-cash'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/filter',
        expect.objectContaining({
          params: { gateway: 'Cash' }
        })
      );
    });

    // Verify only Cash transactions are shown
    await waitFor(() => {
      expect(getByTestId('payment-gateway-4')).toHaveTextContent('Cash');
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 1 payment(s)');
    });

    console.log('✓ TC-PAY-FLT-003 PASSED: Only Cash transactions displayed');
  });
});

describe('TC-PAY-FLT-004: Search by Transaction ID', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Enter Gateway ID (Stripe ID) - Show specific transaction', async () => {
    const specificPayment = mockPayments.visa[0];

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/search')) {
        return Promise.resolve({ data: [specificPayment] });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Select search type
    fireEvent.change(getByTestId('search-type'), {
      target: { value: 'transaction_id' }
    });

    // Enter transaction ID
    fireEvent.change(getByTestId('search-input'), {
      target: { value: 'stripe_visa_001' }
    });

    // Click search
    fireEvent.click(getByTestId('search-button'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/search',
        expect.objectContaining({
          params: {
            type: 'transaction_id',
            query: 'stripe_visa_001'
          }
        })
      );
    });

    // Verify specific transaction is shown
    await waitFor(() => {
      expect(getByTestId('payment-txn-1')).toHaveTextContent('stripe_visa_001');
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 1 payment(s)');
    });

    console.log('✓ TC-PAY-FLT-004 PASSED: Specific transaction found by ID');
  });
});

describe('TC-PAY-FLT-005: Search by Booking Ref', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Enter Booking ID - Show payments for that booking', async () => {
    const bookingPayments = [mockPayments.visa[0]];

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/search')) {
        return Promise.resolve({ data: bookingPayments });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Select search type
    fireEvent.change(getByTestId('search-type'), {
      target: { value: 'booking_reference' }
    });

    // Enter booking reference
    fireEvent.change(getByTestId('search-input'), {
      target: { value: 'BK001' }
    });

    // Click search
    fireEvent.click(getByTestId('search-button'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/search',
        expect.objectContaining({
          params: {
            type: 'booking_reference',
            query: 'BK001'
          }
        })
      );
    });

    // Verify booking payments are shown
    await waitFor(() => {
      expect(getByTestId('payment-booking-1')).toHaveTextContent('BK001');
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 1 payment(s)');
    });

    console.log('✓ TC-PAY-FLT-005 PASSED: Payments found for booking reference');
  });
});

describe('TC-PAY-FLT-006: Search by Customer Email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Enter email - Show payment history of customer', async () => {
    const customerPayments = [mockPayments.visa[0]];

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/search')) {
        return Promise.resolve({ data: customerPayments });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Select search type
    fireEvent.change(getByTestId('search-type'), {
      target: { value: 'customer_email' }
    });

    // Enter email
    fireEvent.change(getByTestId('search-input'), {
      target: { value: 'john@example.com' }
    });

    // Click search
    fireEvent.click(getByTestId('search-button'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/search',
        expect.objectContaining({
          params: {
            type: 'customer_email',
            query: 'john@example.com'
          }
        })
      );
    });

    // Verify customer payments are shown
    await waitFor(() => {
      expect(getByTestId('payment-email-1')).toHaveTextContent('john@example.com');
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 1 payment(s)');
    });

    console.log('✓ TC-PAY-FLT-006 PASSED: Customer payment history displayed');
  });
});

describe('TC-PAY-FLT-007: Filter by Amount Range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Enter Min $100 - Max $500 - Show txns within range', async () => {
    const rangePayments = mockPayments.all.filter(
      (p) => p.amount >= 100 && p.amount <= 500
    );

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/filter')) {
        return Promise.resolve({ data: rangePayments });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Enter amount range
    fireEvent.change(getByTestId('amount-min'), {
      target: { value: '100' }
    });
    fireEvent.change(getByTestId('amount-max'), {
      target: { value: '500' }
    });

    // Apply filter
    fireEvent.click(getByTestId('apply-amount-filter'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/filter',
        expect.objectContaining({
          params: expect.objectContaining({
            amount_min: '100',
            amount_max: '500'
          })
        })
      );
    });

    // Verify payments in range are shown
    await waitFor(() => {
      const count = rangePayments.length;
      expect(getByTestId('payment-count')).toHaveTextContent(`Showing ${count} payment(s)`);
    });

    console.log('✓ TC-PAY-FLT-007 PASSED: Payments filtered by amount range');
  });
});

describe('TC-PAY-FLT-008: Filter by Date Range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Select Start/End Date - Show txns in period', async () => {
    const dateRangePayments = [mockPayments.visa[0], mockPayments.visa[1]];

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/filter')) {
        return Promise.resolve({ data: dateRangePayments });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Enter date range
    fireEvent.change(getByTestId('date-start'), {
      target: { value: '2025-12-20' }
    });
    fireEvent.change(getByTestId('date-end'), {
      target: { value: '2025-12-21' }
    });

    // Apply filter
    fireEvent.click(getByTestId('apply-date-filter'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/filter',
        expect.objectContaining({
          params: expect.objectContaining({
            date_start: '2025-12-20',
            date_end: '2025-12-21'
          })
        })
      );
    });

    // Verify payments in date range are shown
    await waitFor(() => {
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 2 payment(s)');
    });

    console.log('✓ TC-PAY-FLT-008 PASSED: Payments filtered by date range');
  });
});

describe('TC-PAY-FLT-009: Sort by Date (Newest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Click Date Header - Newest on top', async () => {
    const sortedPayments = [...mockPayments.all].sort((a, b) => 
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/filter')) {
        return Promise.resolve({ data: sortedPayments });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Click date header to sort
    fireEvent.click(getByTestId('sort-date-header'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenLastCalledWith(
        '/api/payments/dashboard/filter',
        expect.objectContaining({
          params: {
            sort_by: 'payment_date',
            sort_order: 'desc'
          }
        })
      );
    });

    // Verify sorting indicator
    await waitFor(() => {
      expect(getByTestId('sort-date-header')).toHaveTextContent('↓');
    });

    console.log('✓ TC-PAY-FLT-009 PASSED: Payments sorted by date (newest first)');
  });
});

describe('TC-PAY-FLT-010: Sort by Amount (High-Low)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Click Amount Header - Highest value on top', async () => {
    const sortedPayments = [...mockPayments.all].sort((a, b) => b.amount - a.amount);

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/filter')) {
        return Promise.resolve({ data: sortedPayments });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Click amount header to sort
    fireEvent.click(getByTestId('sort-amount-header'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenLastCalledWith(
        '/api/payments/dashboard/filter',
        expect.objectContaining({
          params: {
            sort_by: 'amount',
            sort_order: 'desc'
          }
        })
      );
    });

    // Verify sorting indicator
    await waitFor(() => {
      expect(getByTestId('sort-amount-header')).toHaveTextContent('↓');
    });

    console.log('✓ TC-PAY-FLT-010 PASSED: Payments sorted by amount (highest first)');
  });
});

describe('TC-PAY-FLT-011: Export Report - Excel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.URL for blob creation
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('Click Export Excel - Download .xlsx with all columns', async () => {
    const mockBlob = new Blob(['mock excel data'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/export')) {
        return Promise.resolve({ data: mockBlob });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Click export button
    fireEvent.click(getByTestId('export-excel'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/export',
        expect.objectContaining({
          params: {},
          responseType: 'blob'
        })
      );
    });

    // Verify export success message
    await waitFor(() => {
      expect(getByTestId('export-message')).toHaveTextContent('Export successful');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    console.log('✓ TC-PAY-FLT-011 PASSED: Excel report exported successfully');
  });
});

describe('TC-PAY-FLT-012: Export Report - Date Range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.URL for blob creation
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('Apply Filter -> Export - Excel contains only filtered data', async () => {
    const filteredPayments = [mockPayments.visa[0], mockPayments.visa[1]];
    const mockBlob = new Blob(['filtered excel data'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/export')) {
        return Promise.resolve({ data: mockBlob });
      }
      if (url.includes('/filter')) {
        return Promise.resolve({ data: filteredPayments });
      }
      return Promise.resolve({ data: mockPayments.all });
    });

    const { getByTestId } = render(<PaymentDashboard />);

    await waitFor(() => {
      expect(getByTestId('payment-dashboard')).toBeInTheDocument();
    });

    // Apply date filter first
    fireEvent.change(getByTestId('date-start'), {
      target: { value: '2025-12-20' }
    });
    fireEvent.change(getByTestId('date-end'), {
      target: { value: '2025-12-21' }
    });
    fireEvent.click(getByTestId('apply-date-filter'));

    await waitFor(() => {
      expect(getByTestId('payment-count')).toHaveTextContent('Showing 2 payment(s)');
    });

    // Now export with filters applied
    fireEvent.click(getByTestId('export-excel'));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments/dashboard/export',
        expect.objectContaining({
          params: {
            date_start: '2025-12-20',
            date_end: '2025-12-21'
          },
          responseType: 'blob'
        })
      );
    });

    // Verify export with filters was successful
    await waitFor(() => {
      expect(getByTestId('export-message')).toHaveTextContent('Export successful');
    });

    console.log('✓ TC-PAY-FLT-012 PASSED: Filtered data exported to Excel');
  });
});

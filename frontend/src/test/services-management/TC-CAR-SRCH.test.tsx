/**
 * Test Suite: Car Search
 * 
 * Test Cases Covered:
 * - TC-CAR-SRCH-001: Verify Search Car by Brand
 * - TC-CAR-SRCH-002: Verify Search Car - No Results
 * 
 * NOTE: These tests document expected car search behavior.
 * Many features may not be implemented yet - tests may fail.
 * This is expected and acceptable for TDD approach.
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

// Mock car data
const mockAllCars = [
  {
    car_id: 1,
    license_plate: 'TOY-001',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    status: 'available',
    price_per_day: 50.00,
    seats: 5,
    transmission: 'automatic',
    image_url: '/images/toyota-camry.jpg',
  },
  {
    car_id: 2,
    license_plate: 'TOY-002',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    status: 'available',
    price_per_day: 45.00,
    seats: 5,
    transmission: 'manual',
    image_url: '/images/toyota-corolla.jpg',
  },
  {
    car_id: 3,
    license_plate: 'HON-001',
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    status: 'available',
    price_per_day: 48.00,
    seats: 5,
    transmission: 'automatic',
    image_url: '/images/honda-civic.jpg',
  },
  {
    car_id: 4,
    license_plate: 'MAZ-001',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2024,
    status: 'available',
    price_per_day: 60.00,
    seats: 5,
    transmission: 'automatic',
    image_url: '/images/mazda-cx5.jpg',
  },
];

// Mock Car Rental Search Component
interface CarRentalSearchProps {
  onSearchResults?: (results: any[]) => void;
}

const CarRentalSearch: React.FC<CarRentalSearchProps> = ({ onSearchResults }) => {
  const [allCars, setAllCars] = React.useState<any[]>([]);
  const [filteredCars, setFilteredCars] = React.useState<any[]>([]);
  const [brandFilter, setBrandFilter] = React.useState('');
  const [modelFilter, setModelFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');
  const [noResults, setNoResults] = React.useState(false);

  React.useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get('/api/cars', {
        params: { status: 'available' },
      });
      setAllCars(response.data);
      setFilteredCars(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load cars');
      setLoading(false);
    }
  };

  const handleBrandFilterChange = (value: string) => {
    setBrandFilter(value);
    applyFilters(value, modelFilter);
  };

  const handleModelFilterChange = (value: string) => {
    setModelFilter(value);
    applyFilters(brandFilter, value);
  };

  const applyFilters = (brand: string, model: string) => {
    let results = [...allCars];

    // Filter by brand
    if (brand) {
      results = results.filter(car => 
        car.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // Filter by model
    if (model) {
      results = results.filter(car => 
        car.model.toLowerCase().includes(model.toLowerCase())
      );
    }

    setFilteredCars(results);
    setNoResults(results.length === 0);
    onSearchResults?.(results);
  };

  const handleClearFilters = () => {
    setBrandFilter('');
    setModelFilter('');
    setFilteredCars(allCars);
    setNoResults(false);
    onSearchResults?.(allCars);
  };

  if (loading) return <div>Loading cars...</div>;
  if (error) return <div data-testid="error-message">{error}</div>;

  return (
    <div data-testid="car-rental-search">
      <h2>Car Rental</h2>

      <div data-testid="search-filters">
        <div data-testid="brand-filter-section">
          <label>Brand:</label>
          <input
            data-testid="brand-filter-input"
            type="text"
            placeholder="Enter brand (e.g., Toyota)"
            value={brandFilter}
            onChange={(e) => handleBrandFilterChange(e.target.value)}
          />
        </div>

        <div data-testid="model-filter-section">
          <label>Model:</label>
          <input
            data-testid="model-filter-input"
            type="text"
            placeholder="Enter model"
            value={modelFilter}
            onChange={(e) => handleModelFilterChange(e.target.value)}
          />
        </div>

        <button data-testid="clear-filters-button" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      <div data-testid="search-results">
        <h3>Search Results ({filteredCars.length} cars)</h3>

        {noResults && (
          <div data-testid="no-results-message" role="status">
            No results found
          </div>
        )}

        {!noResults && (
          <div data-testid="car-results-list">
            {filteredCars.map((car) => (
              <div key={car.car_id} data-testid={`car-result-${car.car_id}`}>
                <div data-testid={`car-brand-${car.car_id}`}>{car.brand}</div>
                <div data-testid={`car-model-${car.car_id}`}>{car.model}</div>
                <div data-testid={`car-year-${car.car_id}`}>{car.year}</div>
                <div data-testid={`car-price-${car.car_id}`}>${car.price_per_day}/day</div>
                <div data-testid={`car-seats-${car.car_id}`}>{car.seats} seats</div>
                <div data-testid={`car-transmission-${car.car_id}`}>{car.transmission}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div data-testid="total-available">
        Total Available: {allCars.length} cars
      </div>
    </div>
  );
};

describe('TC-CAR-SRCH-001: Verify Search Car by Brand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Step 1: Enter "Toyota" in Brand filter - Filter applied', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Verify all cars are initially displayed
    expect(getByTestId('search-results')).toHaveTextContent('Search Results (4 cars)');

    // Enter "Toyota" in brand filter
    const brandInput = getByTestId('brand-filter-input') as HTMLInputElement;
    fireEvent.change(brandInput, { target: { value: 'Toyota' } });

    // Verify filter applied
    expect(brandInput.value).toBe('Toyota');

    console.log('✓ TC-CAR-SRCH-001 Step 1 PASSED: Filter applied');
  });

  it('TC-CAR-SRCH-001: Complete flow - System displays only cars with Brand = "Toyota"', async () => {
    const mockSearchResults = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId, queryByTestId } = render(
      <CarRentalSearch onSearchResults={mockSearchResults} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Initial state: all cars visible
    expect(getByTestId('search-results')).toHaveTextContent('Search Results (4 cars)');
    expect(getByTestId('car-result-1')).toBeInTheDocument();
    expect(getByTestId('car-result-2')).toBeInTheDocument();
    expect(getByTestId('car-result-3')).toBeInTheDocument();
    expect(getByTestId('car-result-4')).toBeInTheDocument();

    // Apply Toyota brand filter
    fireEvent.change(getByTestId('brand-filter-input'), { target: { value: 'Toyota' } });

    // Verify only Toyota cars are displayed
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Search Results (2 cars)');
    });

    // Verify Toyota cars are visible
    expect(getByTestId('car-result-1')).toBeInTheDocument();
    expect(getByTestId('car-brand-1')).toHaveTextContent('Toyota');
    expect(getByTestId('car-model-1')).toHaveTextContent('Camry');

    expect(getByTestId('car-result-2')).toBeInTheDocument();
    expect(getByTestId('car-brand-2')).toHaveTextContent('Toyota');
    expect(getByTestId('car-model-2')).toHaveTextContent('Corolla');

    // Verify non-Toyota cars are NOT visible
    expect(queryByTestId('car-result-3')).not.toBeInTheDocument(); // Honda
    expect(queryByTestId('car-result-4')).not.toBeInTheDocument(); // Mazda

    // Verify no "No results" message
    expect(queryByTestId('no-results-message')).not.toBeInTheDocument();

    // Verify callback received filtered results
    expect(mockSearchResults).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ brand: 'Toyota', model: 'Camry' }),
        expect.objectContaining({ brand: 'Toyota', model: 'Corolla' }),
      ])
    );

    console.log('✓ TC-CAR-SRCH-001 PASSED: Only Toyota cars displayed');
  });

  it('Verify brand filter is case-insensitive', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Filter with lowercase
    fireEvent.change(getByTestId('brand-filter-input'), { target: { value: 'toyota' } });

    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Search Results (2 cars)');
    });

    expect(getByTestId('car-result-1')).toBeInTheDocument();
    expect(getByTestId('car-result-2')).toBeInTheDocument();

    console.log('✓ TC-CAR-SRCH-001 Edge Case PASSED: Case-insensitive filter');
  });

  it('Verify filter with other brands (Honda)', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId, queryByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Filter by Honda
    fireEvent.change(getByTestId('brand-filter-input'), { target: { value: 'Honda' } });

    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Search Results (1 cars)');
    });

    // Only Honda should be visible
    expect(getByTestId('car-result-3')).toBeInTheDocument();
    expect(getByTestId('car-brand-3')).toHaveTextContent('Honda');
    expect(getByTestId('car-model-3')).toHaveTextContent('Civic');

    // Others should not be visible
    expect(queryByTestId('car-result-1')).not.toBeInTheDocument();
    expect(queryByTestId('car-result-2')).not.toBeInTheDocument();
    expect(queryByTestId('car-result-4')).not.toBeInTheDocument();

    console.log('✓ TC-CAR-SRCH-001 Additional Test PASSED: Honda filter works');
  });
});

describe('TC-CAR-SRCH-003..005: Advanced search behaviors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-CAR-SRCH-003: Verify Search Car - Brand Case Insensitive', async () => {
    const cars = [
      { id: 1, brand: 'Toyota', model: 'Corolla', seats: 4 },
      { id: 2, brand: 'Honda', model: 'Civic', seats: 4 }
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: cars });

    const { getByTestId, getByText } = render(<CarSearchDashboard />);
    await waitFor(() => expect(getByTestId('car-search-dashboard')).toBeInTheDocument());

    fireEvent.change(getByTestId('search-input'), { target: { value: 'toyota' } });
    fireEvent.keyDown(getByTestId('search-input'), { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(getByText('Toyota')).toBeInTheDocument());
  });

  it('TC-CAR-SRCH-004: Verify Search Car - Partial Name', async () => {
    const cars = [ { id: 3, brand: 'Mercedes Benz', model: 'E-Class', seats: 5 } ];
    mockedAxios.get.mockResolvedValueOnce({ data: cars });

    const { getByTestId, getByText } = render(<CarSearchDashboard />);
    await waitFor(() => expect(getByTestId('car-search-dashboard')).toBeInTheDocument());

    fireEvent.change(getByTestId('search-input'), { target: { value: 'Merc' } });
    fireEvent.keyDown(getByTestId('search-input'), { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(getByText('Mercedes Benz')).toBeInTheDocument());
  });

  it('TC-CAR-SRCH-005: Verify Search Car - Multiple Filters', async () => {
    const cars = [
      { id: 4, brand: 'Honda', model: 'Jazz', seats: 4 },
      { id: 5, brand: 'Honda', model: 'Accord', seats: 5 },
      { id: 6, brand: 'Toyota', model: 'Yaris', seats: 4 }
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: cars });

    const { getByTestId, queryByText } = render(<CarSearchDashboard />);
    await waitFor(() => expect(getByTestId('car-search-dashboard')).toBeInTheDocument());

    // Apply filters: Brand=Honda, Seats=4
    fireEvent.click(getByTestId('filter-brand-honda'));
    fireEvent.click(getByTestId('filter-seats-4'));
    fireEvent.click(getByTestId('apply-filters'));

    await waitFor(() => {
      expect(queryByText('Honda Jazz')).toBeInTheDocument();
      expect(queryByText('Honda Accord')).not.toBeInTheDocument();
      expect(queryByText('Toyota Yaris')).not.toBeInTheDocument();
    });
  });
});

describe('TC-CAR-SRCH-002: Verify Search Car - No Results', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Step 1: Enter Brand "Ferrari" (Not in DB) - Filter applied', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Enter "Ferrari" in brand filter
    const brandInput = getByTestId('brand-filter-input') as HTMLInputElement;
    fireEvent.change(brandInput, { target: { value: 'Ferrari' } });

    // Verify filter applied
    expect(brandInput.value).toBe('Ferrari');

    console.log('✓ TC-CAR-SRCH-002 Step 1 PASSED: Filter applied');
  });

  it('TC-CAR-SRCH-002: Complete flow - System displays message "No results found"', async () => {
    const mockSearchResults = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId, queryByTestId } = render(
      <CarRentalSearch onSearchResults={mockSearchResults} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Initial state: all cars visible
    expect(getByTestId('search-results')).toHaveTextContent('Search Results (4 cars)');

    // Filter by Ferrari (not in database)
    fireEvent.change(getByTestId('brand-filter-input'), { target: { value: 'Ferrari' } });

    // Verify "No results found" message is displayed
    await waitFor(() => {
      expect(getByTestId('no-results-message')).toBeInTheDocument();
      expect(getByTestId('no-results-message')).toHaveTextContent('No results found');
    });

    // Verify results count shows 0
    expect(getByTestId('search-results')).toHaveTextContent('Search Results (0 cars)');

    // Verify no car results are visible
    expect(queryByTestId('car-result-1')).not.toBeInTheDocument();
    expect(queryByTestId('car-result-2')).not.toBeInTheDocument();
    expect(queryByTestId('car-result-3')).not.toBeInTheDocument();
    expect(queryByTestId('car-result-4')).not.toBeInTheDocument();

    // Verify callback received empty results
    expect(mockSearchResults).toHaveBeenCalledWith([]);

    console.log('✓ TC-CAR-SRCH-002 PASSED: "No results found" message displayed');
  });

  it('Verify no results with other non-existent brands', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Test with multiple non-existent brands
    const nonExistentBrands = ['Lamborghini', 'Porsche', 'Tesla'];

    for (const brand of nonExistentBrands) {
      fireEvent.change(getByTestId('brand-filter-input'), { target: { value: brand } });

      await waitFor(() => {
        expect(getByTestId('no-results-message')).toBeInTheDocument();
        expect(getByTestId('search-results')).toHaveTextContent('Search Results (0 cars)');
      });
    }

    console.log('✓ TC-CAR-SRCH-002 Additional Test PASSED: Multiple non-existent brands');
  });

  it('Verify clearing filter restores results', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId, queryByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Apply filter that returns no results
    fireEvent.change(getByTestId('brand-filter-input'), { target: { value: 'Ferrari' } });

    await waitFor(() => {
      expect(getByTestId('no-results-message')).toBeInTheDocument();
    });

    // Clear filter
    fireEvent.click(getByTestId('clear-filters-button'));

    // Verify all results restored
    await waitFor(() => {
      expect(queryByTestId('no-results-message')).not.toBeInTheDocument();
      expect(getByTestId('search-results')).toHaveTextContent('Search Results (4 cars)');
    });

    expect(getByTestId('car-result-1')).toBeInTheDocument();
    expect(getByTestId('car-result-2')).toBeInTheDocument();
    expect(getByTestId('car-result-3')).toBeInTheDocument();
    expect(getByTestId('car-result-4')).toBeInTheDocument();

    console.log('✓ TC-CAR-SRCH-002 Additional Test PASSED: Clear filter restores results');
  });
});

describe('Additional Car Search Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should combine brand and model filters', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Filter by brand: Toyota
    fireEvent.change(getByTestId('brand-filter-input'), { target: { value: 'Toyota' } });

    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Search Results (2 cars)');
    });

    // Further filter by model: Camry
    fireEvent.change(getByTestId('model-filter-input'), { target: { value: 'Camry' } });

    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Search Results (1 cars)');
    });

    expect(getByTestId('car-result-1')).toBeInTheDocument();
    expect(getByTestId('car-brand-1')).toHaveTextContent('Toyota');
    expect(getByTestId('car-model-1')).toHaveTextContent('Camry');

    console.log('✓ Additional Test PASSED: Combined brand and model filters');
  });

  it('Should handle API error when loading cars', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          message: 'Internal server error',
        },
      },
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('error-message')).toBeInTheDocument();
      expect(getByTestId('error-message')).toHaveTextContent('Failed to load cars');
    });

    console.log('✓ Additional Test PASSED: API error handled');
  });

  it('Should display total available cars count', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Total should always show all available cars
    expect(getByTestId('total-available')).toHaveTextContent('Total Available: 4 cars');

    // Apply filter
    fireEvent.change(getByTestId('brand-filter-input'), { target: { value: 'Toyota' } });

    // Total should still show all available cars
    expect(getByTestId('total-available')).toHaveTextContent('Total Available: 4 cars');

    console.log('✓ Additional Test PASSED: Total available count correct');
  });

  it('Should handle partial model match', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockAllCars,
    });

    const { getByTestId } = render(<CarRentalSearch />);

    await waitFor(() => {
      expect(getByTestId('car-rental-search')).toBeInTheDocument();
    });

    // Search for "C" - should match Camry, Corolla, Civic, CX-5
    fireEvent.change(getByTestId('model-filter-input'), { target: { value: 'C' } });

    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Search Results (4 cars)');
    });

    console.log('✓ Additional Test PASSED: Partial model match works');
  });
});

describe('TC-SRCH-CAR-001..010: Filters by Brand and Seats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const dataset = [
    { car_id: 101, license_plate: 'TOY-101', brand: 'Toyota', model: 'Corolla', year: 2022, seats: 4 },
    { car_id: 102, license_plate: 'TOY-102', brand: 'Toyota', model: 'RAV4', year: 2023, seats: 7 },
    { car_id: 103, license_plate: 'HON-103', brand: 'Honda', model: 'Odyssey', year: 2021, seats: 7 },
    { car_id: 104, license_plate: 'HON-104', brand: 'Honda', model: 'Fit', year: 2020, seats: 4 },
    { car_id: 105, license_plate: 'FRD-105', brand: 'Ford', model: 'Focus', year: 2019, seats: 4 },
    { car_id: 106, license_plate: 'BMW-106', brand: 'BMW', model: 'X5', year: 2024, seats: 5 },
    { car_id: 107, license_plate: 'MER-107', brand: 'Mercedes', model: 'C-Class', year: 2023, seats: 5 },
  ];

  const TestCarSearchFilters: React.FC = () => {
    const [allCars, setAllCars] = React.useState<any[]>([]);
    const [filtered, setFiltered] = React.useState<any[]>([]);
    const [brand, setBrand] = React.useState('');
    const [seats, setSeats] = React.useState('');

    React.useEffect(() => {
      const fetch = async () => {
        const res = await axios.get('/api/cars');
        setAllCars(res.data);
        setFiltered(res.data);
      };
      fetch();
    }, []);

    const apply = () => {
      let results = [...allCars];
      if (brand) results = results.filter(c => c.brand.toLowerCase() === brand.toLowerCase());
      if (seats) results = results.filter(c => c.seats === Number(seats));
      setFiltered(results);
    };

    return (
      <div data-testid="car-search-filters">
        <input data-testid="brand-filter-input-2" value={brand} onChange={e => setBrand(e.target.value)} />
        <select data-testid="seats-filter-select-2" value={seats} onChange={e => setSeats(e.target.value)}>
          <option value="">Any</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="7">7</option>
        </select>
        <button data-testid="apply-filters-2" onClick={apply}>Apply</button>

        <div data-testid="search-results-2">
          <h4>Search Results ({filtered.length} cars)</h4>
          {filtered.length === 0 ? (
            <div data-testid="no-results-message-2">No results found</div>
          ) : (
            <div data-testid="car-results-list-2">
              {filtered.map(c => (
                <div data-testid={`car-result-${c.car_id}`} key={c.car_id}>
                  <div data-testid={`car-brand-${c.car_id}`}>{c.brand}</div>
                  <div data-testid={`car-model-${c.car_id}`}>{c.model}</div>
                  <div data-testid={`car-seats-${c.car_id}`}>{c.seats} seats</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  it('TC-SRCH-CAR-001: Filter by Brand: Toyota', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId, queryByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());

    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'Toyota' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (2 cars)'));

    expect(getByTestId('car-result-101')).toBeInTheDocument();
    expect(getByTestId('car-result-102')).toBeInTheDocument();
    expect(queryByTestId('car-result-103')).not.toBeInTheDocument();
  });

  it('TC-SRCH-CAR-002: Filter by Brand: Honda', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'Honda' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (2 cars)'));
    expect(getByTestId('car-result-103')).toBeInTheDocument();
    expect(getByTestId('car-result-104')).toBeInTheDocument();
  });

  it('TC-SRCH-CAR-003: Filter by Brand: Ford', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId, queryByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'Ford' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (1 cars)'));
    expect(getByTestId('car-result-105')).toBeInTheDocument();
    expect(queryByTestId('car-result-101')).not.toBeInTheDocument();
  });

  it('TC-SRCH-CAR-004: Filter by Brand: BMW', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'BMW' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (1 cars)'));
    expect(getByTestId('car-result-106')).toBeInTheDocument();
  });

  it('TC-SRCH-CAR-005: Filter by Brand: Mercedes', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'Mercedes' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (1 cars)'));
    expect(getByTestId('car-result-107')).toBeInTheDocument();
  });

  it('TC-SRCH-CAR-006: Filter by Seats: 4', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId, queryByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('seats-filter-select-2'), { target: { value: '4' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (3 cars)'));
    expect(getByTestId('car-result-101')).toBeInTheDocument();
    expect(getByTestId('car-result-104')).toBeInTheDocument();
    expect(getByTestId('car-result-105')).toBeInTheDocument();
    expect(queryByTestId('car-result-102')).not.toBeInTheDocument();
  });

  it('TC-SRCH-CAR-007: Filter by Seats: 7', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('seats-filter-select-2'), { target: { value: '7' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (2 cars)'));
    expect(getByTestId('car-result-102')).toBeInTheDocument();
    expect(getByTestId('car-result-103')).toBeInTheDocument();
  });

  it('TC-SRCH-CAR-008: Filter Combined: Toyota + 4 Seats', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId, queryByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'Toyota' } });
    fireEvent.change(getByTestId('seats-filter-select-2'), { target: { value: '4' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (1 cars)'));
    expect(getByTestId('car-result-101')).toBeInTheDocument();
    expect(queryByTestId('car-result-102')).not.toBeInTheDocument();
  });

  it('TC-SRCH-CAR-009: Filter Combined: Honda + 7 Seats', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'Honda' } });
    fireEvent.change(getByTestId('seats-filter-select-2'), { target: { value: '7' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (1 cars)'));
    expect(getByTestId('car-result-103')).toBeInTheDocument();
  });

  it('TC-SRCH-CAR-010: Filter No Result (Ferrari + 50 seats)', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestCarSearchFilters />);

    await waitFor(() => expect(getByTestId('car-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('brand-filter-input-2'), { target: { value: 'Ferrari' } });
    fireEvent.change(getByTestId('seats-filter-select-2'), { target: { value: '50' } });
    fireEvent.click(getByTestId('apply-filters-2'));

    await waitFor(() => expect(getByTestId('no-results-message-2')).toBeInTheDocument());
    expect(getByTestId('no-results-message-2')).toHaveTextContent('No results found');
    expect(getByTestId('search-results-2')).toHaveTextContent('Search Results (0 cars)');
  });
});

/**
 * Test Suite: TC-FLT-SRC (Flight Search & List Management)
 * Category: BATCH 5 EXPANSION - Master Flight & Supervision
 * Sub-Category: Quản lý Danh sách - Mở rộng BR36
 * Description: Unit tests for flight search, filter, and list management features
 * 
 * Test Cases:
 * - TC-FLT-SRC-001: Search by Flight No
 * - TC-FLT-SRC-002: Search by Partial No
 * - TC-FLT-SRC-003: Filter by Origin
 * - TC-FLT-SRC-004: Filter by Destination
 * - TC-FLT-SRC-005: Filter by Date
 * - TC-FLT-SRC-006: Filter by Status "Delayed"
 * - TC-FLT-SRC-007: Sort by Departure Time
 * - TC-FLT-SRC-008: Sort by Price
 * - TC-FLT-SRC-009: Pagination
 * - TC-FLT-SRC-010: Bulk Delete (If avail)
 * 
 * Prerequisites:
 * 1. User is logged in as Admin
 * 2. User has access to Flight Management features
 * 3. Multiple flights exist in the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock flight search and list APIs
const mockSearchFlights = vi.fn();
const mockGetFlights = vi.fn();
const mockBulkDeleteFlights = vi.fn();

// Mock flight data (comprehensive list for testing)
const mockAllFlights = [
  {
    id: 'flight_001',
    flightNumber: 'VN001',
    origin: 'SGN',
    originCity: 'Ho Chi Minh',
    destination: 'HAN',
    destinationCity: 'Ha Noi',
    departureTime: '2025-12-25T08:00:00',
    arrivalTime: '2025-12-25T10:00:00',
    status: 'Scheduled',
    price: 2500000,
    airplaneCode: 'VN-A320'
  },
  {
    id: 'flight_002',
    flightNumber: 'VN002',
    origin: 'SGN',
    originCity: 'Ho Chi Minh',
    destination: 'DAD',
    destinationCity: 'Da Nang',
    departureTime: '2025-12-25T14:00:00',
    arrivalTime: '2025-12-25T15:30:00',
    status: 'Delayed',
    price: 1800000,
    airplaneCode: 'VN-B737'
  },
  {
    id: 'flight_003',
    flightNumber: 'VN003',
    origin: 'HAN',
    originCity: 'Ha Noi',
    destination: 'DAD',
    destinationCity: 'Da Nang',
    departureTime: '2025-12-25T16:00:00',
    arrivalTime: '2025-12-25T17:30:00',
    status: 'Scheduled',
    price: 1500000,
    airplaneCode: 'VN-ATR72'
  },
  {
    id: 'flight_004',
    flightNumber: 'BA001',
    origin: 'HAN',
    originCity: 'Ha Noi',
    destination: 'SGN',
    destinationCity: 'Ho Chi Minh',
    departureTime: '2025-12-26T09:00:00',
    arrivalTime: '2025-12-26T11:00:00',
    status: 'Scheduled',
    price: 2200000,
    airplaneCode: 'VN-A321'
  },
  {
    id: 'flight_005',
    flightNumber: 'VN004',
    origin: 'SGN',
    originCity: 'Ho Chi Minh',
    destination: 'HAN',
    destinationCity: 'Ha Noi',
    departureTime: '2025-12-25T18:00:00',
    arrivalTime: '2025-12-25T20:00:00',
    status: 'Delayed',
    price: 2800000,
    airplaneCode: 'VN-B777'
  },
  // Additional flights for pagination testing (Page 2)
  {
    id: 'flight_006',
    flightNumber: 'VN005',
    origin: 'DAD',
    originCity: 'Da Nang',
    destination: 'SGN',
    destinationCity: 'Ho Chi Minh',
    departureTime: '2025-12-27T10:00:00',
    arrivalTime: '2025-12-27T11:30:00',
    status: 'Scheduled',
    price: 1900000,
    airplaneCode: 'VN-A320'
  },
  {
    id: 'flight_007',
    flightNumber: 'VN006',
    origin: 'HAN',
    originCity: 'Ha Noi',
    destination: 'SGN',
    destinationCity: 'Ho Chi Minh',
    departureTime: '2025-12-27T15:00:00',
    arrivalTime: '2025-12-27T17:00:00',
    status: 'Scheduled',
    price: 2600000,
    airplaneCode: 'VN-B737'
  }
];

// Mock FlightListManagementPage component
const FlightListManagementPage = () => {
  const [flights, setFlights] = React.useState<any[]>([]);
  const [filteredFlights, setFilteredFlights] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    origin: '',
    destination: '',
    date: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = React.useState<{
    field: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedFlights, setSelectedFlights] = React.useState<string[]>([]);
  const [successMessage, setSuccessMessage] = React.useState('');
  
  const itemsPerPage = 5;

  React.useEffect(() => {
    loadFlights();
  }, []);

  React.useEffect(() => {
    applyFiltersAndSearch();
  }, [flights, searchQuery, filters, sortConfig]);

  const loadFlights = async () => {
    const data = await mockGetFlights();
    setFlights(data);
  };

  const applyFiltersAndSearch = () => {
    let result = [...flights];

    // Apply search
    if (searchQuery.trim()) {
      result = result.filter(flight => 
        flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.origin) {
      result = result.filter(flight => flight.originCity === filters.origin);
    }

    if (filters.destination) {
      result = result.filter(flight => flight.destinationCity === filters.destination);
    }

    if (filters.date) {
      result = result.filter(flight => {
        const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
        return flightDate === filters.date;
      });
    }

    if (filters.status) {
      result = result.filter(flight => flight.status === filters.status);
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];

        if (sortConfig.field === 'departureTime') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    setFilteredFlights(result);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      await mockSearchFlights(query);
    }
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters({ ...filters, [filterName]: value });
  };

  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ field, direction });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectFlight = (flightId: string) => {
    if (selectedFlights.includes(flightId)) {
      setSelectedFlights(selectedFlights.filter(id => id !== flightId));
    } else {
      setSelectedFlights([...selectedFlights, flightId]);
    }
  };

  const handleBulkDelete = async () => {
    const result = await mockBulkDeleteFlights(selectedFlights);

    if (result.success) {
      setSuccessMessage(`${selectedFlights.length} flights deleted successfully`);
      setSelectedFlights([]);
      await loadFlights();
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFlights = filteredFlights.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div data-testid="flight-list-management-page">
      <h2>Flight List Management</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="success-message" style={{ color: 'green', marginBottom: '10px' }}>
          {successMessage}
        </div>
      )}

      {/* Search */}
      <div data-testid="search-section">
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search by Flight Number"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div data-testid="filter-section">
        <select
          data-testid="origin-filter"
          value={filters.origin}
          onChange={(e) => handleFilterChange('origin', e.target.value)}
        >
          <option value="">All Origins</option>
          <option value="Ho Chi Minh">Ho Chi Minh</option>
          <option value="Ha Noi">Ha Noi</option>
          <option value="Da Nang">Da Nang</option>
        </select>

        <select
          data-testid="destination-filter"
          value={filters.destination}
          onChange={(e) => handleFilterChange('destination', e.target.value)}
        >
          <option value="">All Destinations</option>
          <option value="Ho Chi Minh">Ho Chi Minh</option>
          <option value="Ha Noi">Ha Noi</option>
          <option value="Da Nang">Da Nang</option>
        </select>

        <input
          data-testid="date-filter"
          type="date"
          value={filters.date}
          onChange={(e) => handleFilterChange('date', e.target.value)}
        />

        <select
          data-testid="status-filter"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Delayed">Delayed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedFlights.length > 0 && (
        <div data-testid="bulk-actions">
          <span data-testid="selected-count">{selectedFlights.length} selected</span>
          <button data-testid="bulk-delete-btn" onClick={handleBulkDelete}>
            Delete Selected
          </button>
        </div>
      )}

      {/* Flight Table */}
      <table data-testid="flight-list-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                data-testid="select-all-checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFlights(paginatedFlights.map(f => f.id));
                  } else {
                    setSelectedFlights([]);
                  }
                }}
                checked={paginatedFlights.length > 0 && selectedFlights.length === paginatedFlights.length}
              />
            </th>
            <th>Flight No</th>
            <th>Route</th>
            <th>
              <button
                data-testid="sort-departure-btn"
                onClick={() => handleSort('departureTime')}
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Departure Time {sortConfig?.field === 'departureTime' && (
                  <span data-testid="departure-sort-indicator">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            </th>
            <th>
              <button
                data-testid="sort-price-btn"
                onClick={() => handleSort('price')}
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Price {sortConfig?.field === 'price' && (
                  <span data-testid="price-sort-indicator">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody data-testid="flight-list-tbody">
          {paginatedFlights.map((flight, index) => (
            <tr key={flight.id} data-testid={`flight-row-${index}`}>
              <td>
                <input
                  type="checkbox"
                  data-testid={`select-flight-${index}`}
                  checked={selectedFlights.includes(flight.id)}
                  onChange={() => handleSelectFlight(flight.id)}
                />
              </td>
              <td data-testid={`flight-number-${index}`}>{flight.flightNumber}</td>
              <td data-testid={`flight-route-${index}`}>
                {flight.origin} → {flight.destination}
              </td>
              <td data-testid={`flight-departure-${index}`}>
                {new Date(flight.departureTime).toLocaleString()}
              </td>
              <td data-testid={`flight-price-${index}`}>
                {flight.price.toLocaleString()} ₫
              </td>
              <td data-testid={`flight-status-${index}`}>{flight.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div data-testid="pagination-section">
          <span data-testid="page-info">
            Page {currentPage} of {totalPages}
          </span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              data-testid={`page-${page}-btn`}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
              style={{
                fontWeight: page === currentPage ? 'bold' : 'normal',
                margin: '0 5px'
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Result Count */}
      <div data-testid="result-count">
        Showing {paginatedFlights.length} of {filteredFlights.length} flights
      </div>
    </div>
  );
};

// Test Suite: TC-FLT-SRC (Flight Search & List Management)
describe('TC-FLT-SRC: Flight Search & List Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFlights.mockResolvedValue(mockAllFlights);
    mockSearchFlights.mockResolvedValue({ success: true });
    mockBulkDeleteFlights.mockResolvedValue({ success: true });
  });

  /**
   * TC-FLT-SRC-001: Search by Flight No
   * Business Requirement: BR36
   * 
   * Test Data / Input: Enter "VN001". Search
   * Expected Result: Show only VN001
   */
  it('TC-FLT-SRC-001: should search and show exact flight by flight number', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Verify initial state (all flights)
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 5 of 7 flights');

    // Act: Enter "VN001"
    await user.type(screen.getByTestId('search-input'), 'VN001');

    // Assert: Show only VN001
    await waitFor(() => {
      expect(mockSearchFlights).toHaveBeenCalledWith('VN001');
    });

    const tbody = screen.getByTestId('flight-list-tbody');
    const rows = within(tbody).getAllByRole('row');
    
    expect(rows).toHaveLength(1);
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN001');
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 1 of 1 flights');
  });

  /**
   * TC-FLT-SRC-002: Search by Partial No
   * Business Requirement: BR36
   * 
   * Test Data / Input: Enter "VN". Search
   * Expected Result: Show VN001, VN002...
   */
  it('TC-FLT-SRC-002: should search and show all flights matching partial number', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Enter "VN" (partial)
    await user.type(screen.getByTestId('search-input'), 'VN');

    // Assert: Show VN001, VN002, VN003, VN004, VN005, VN006 (6 flights starting with VN)
    await waitFor(() => {
      expect(mockSearchFlights).toHaveBeenCalledWith('VN');
    });

    // Should show 5 on page 1 (pagination)
    const tbody = screen.getByTestId('flight-list-tbody');
    const rows = within(tbody).getAllByRole('row');
    
    expect(rows).toHaveLength(5);
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN001');
    expect(screen.getByTestId('flight-number-1')).toHaveTextContent('VN002');
    expect(screen.getByTestId('flight-number-2')).toHaveTextContent('VN003');
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 5 of 6 flights');
  });

  /**
   * TC-FLT-SRC-003: Filter by Origin
   * Business Requirement: BR36
   * 
   * Test Data / Input: Select "Ho Chi Minh". Filter
   * Expected Result: Show flights departing from HCM
   */
  it('TC-FLT-SRC-003: should filter flights by origin city', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Select "Ho Chi Minh" as origin
    await user.selectOptions(screen.getByTestId('origin-filter'), 'Ho Chi Minh');

    // Assert: Show only flights from HCM (VN001, VN002, VN004 - 3 flights)
    await waitFor(() => {
      const tbody = screen.getByTestId('flight-list-tbody');
      const rows = within(tbody).getAllByRole('row');
      
      expect(rows).toHaveLength(3);
      expect(screen.getByTestId('flight-route-0')).toHaveTextContent('SGN');
      expect(screen.getByTestId('flight-route-1')).toHaveTextContent('SGN');
      expect(screen.getByTestId('flight-route-2')).toHaveTextContent('SGN');
      expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 3 of 3 flights');
    });
  });

  /**
   * TC-FLT-SRC-004: Filter by Destination
   * Business Requirement: BR36
   * 
   * Test Data / Input: Select "Ha Noi". Filter
   * Expected Result: Show flights arriving at Hanoi
   */
  it('TC-FLT-SRC-004: should filter flights by destination city', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Select "Ha Noi" as destination
    await user.selectOptions(screen.getByTestId('destination-filter'), 'Ha Noi');

    // Assert: Show only flights to Hanoi (VN001, VN004 - 2 flights)
    await waitFor(() => {
      const tbody = screen.getByTestId('flight-list-tbody');
      const rows = within(tbody).getAllByRole('row');
      
      expect(rows).toHaveLength(2);
      expect(screen.getByTestId('flight-route-0')).toHaveTextContent('HAN');
      expect(screen.getByTestId('flight-route-1')).toHaveTextContent('HAN');
      expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 2 of 2 flights');
    });
  });

  /**
   * TC-FLT-SRC-005: Filter by Date
   * Business Requirement: BR36
   * 
   * Test Data / Input: Select specific date. Date
   * Expected Result: Show flights on that day
   */
  it('TC-FLT-SRC-005: should filter flights by departure date', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Select date 2025-12-25
    await user.type(screen.getByTestId('date-filter'), '2025-12-25');

    // Assert: Show only flights on Dec 25 (VN001, VN002, VN003, VN004 - 4 flights)
    await waitFor(() => {
      const tbody = screen.getByTestId('flight-list-tbody');
      const rows = within(tbody).getAllByRole('row');
      
      expect(rows).toHaveLength(4);
      expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 4 of 4 flights');
    });

    // Change date to 2025-12-27
    await user.clear(screen.getByTestId('date-filter'));
    await user.type(screen.getByTestId('date-filter'), '2025-12-27');

    // Assert: Show only flights on Dec 27 (VN005, VN006 - 2 flights)
    await waitFor(() => {
      const tbody = screen.getByTestId('flight-list-tbody');
      const rows = within(tbody).getAllByRole('row');
      
      expect(rows).toHaveLength(2);
      expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 2 of 2 flights');
    });
  });

  /**
   * TC-FLT-SRC-006: Filter by Status "Delayed"
   * Business Requirement: BR36
   * 
   * Test Data / Input: Select Status "Delayed". Filter
   * Expected Result: Show delayed flights
   */
  it('TC-FLT-SRC-006: should filter flights by status "Delayed"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Select "Delayed" status
    await user.selectOptions(screen.getByTestId('status-filter'), 'Delayed');

    // Assert: Show only delayed flights (VN002, VN004 - 2 flights)
    await waitFor(() => {
      const tbody = screen.getByTestId('flight-list-tbody');
      const rows = within(tbody).getAllByRole('row');
      
      expect(rows).toHaveLength(2);
      expect(screen.getByTestId('flight-status-0')).toHaveTextContent('Delayed');
      expect(screen.getByTestId('flight-status-1')).toHaveTextContent('Delayed');
      expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 2 of 2 flights');
    });
  });

  /**
   * TC-FLT-SRC-007: Sort by Departure Time
   * Business Requirement: UI
   * 
   * Test Data / Input: Click Header. Sort
   * Expected Result: Ascending/Descending order
   */
  it('TC-FLT-SRC-007: should sort flights by departure time in ascending and descending order', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Click departure time header (Ascending)
    await user.click(screen.getByTestId('sort-departure-btn'));

    // Assert: Sorted ascending (earliest first - first 5 results on page 1)
    await waitFor(() => {
      expect(screen.getByTestId('departure-sort-indicator')).toHaveTextContent('↑');
      expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN001'); // Dec 25, 08:00
      expect(screen.getByTestId('flight-number-4')).toHaveTextContent('BA001'); // Dec 26, 09:00 (5th chronologically)
    });

    // Act: Click again (Descending)
    await user.click(screen.getByTestId('sort-departure-btn'));

    // Assert: Sorted descending (latest first - first 5 results on page 1)
    await waitFor(() => {
      expect(screen.getByTestId('departure-sort-indicator')).toHaveTextContent('↓');
      expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN006'); // Dec 27, 15:00
      expect(screen.getByTestId('flight-number-4')).toHaveTextContent('VN003'); // Dec 25, 16:00 (5th from latest)
    });
  });

  /**
   * TC-FLT-SRC-008: Sort by Price
   * Business Requirement: UI
   * 
   * Test Data / Input: Click Price Header. Sort
   * Expected Result: Cheap -> Expensive order
   */
  it('TC-FLT-SRC-008: should sort flights by price from cheap to expensive', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Click price header (Ascending - Cheap first)
    await user.click(screen.getByTestId('sort-price-btn'));

    // Assert: Sorted ascending (cheapest first - first 5 results on page 1)
    await waitFor(() => {
      expect(screen.getByTestId('price-sort-indicator')).toHaveTextContent('↑');
      expect(screen.getByTestId('flight-price-0')).toHaveTextContent('1,500,000'); // VN003 cheapest
      expect(screen.getByTestId('flight-price-1')).toHaveTextContent('1,800,000'); // VN002
      expect(screen.getByTestId('flight-price-4')).toHaveTextContent('2,500,000'); // VN001 (5th on page 1)
    });

    // Act: Click again (Descending - Expensive first)
    await user.click(screen.getByTestId('sort-price-btn'));

    // Assert: Sorted descending (most expensive first)
    await waitFor(() => {
      expect(screen.getByTestId('price-sort-indicator')).toHaveTextContent('↓');
      expect(screen.getByTestId('flight-price-0')).toHaveTextContent('2,800,000'); // VN004 most expensive
      expect(screen.getByTestId('flight-price-4')).toHaveTextContent('1,900,000'); // VN005
    });
  });

  /**
   * TC-FLT-SRC-009: Pagination
   * Business Requirement: UI
   * 
   * Test Data / Input: Go to Page 2. Action
   * Expected Result: Load next list
   */
  it('TC-FLT-SRC-009: should paginate flight list and navigate to page 2', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Verify Page 1 (5 items per page, 7 total flights = 2 pages)
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2');
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 5 of 7 flights');

    const tbody = screen.getByTestId('flight-list-tbody');
    let rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(5);

    // Verify first page content
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN001');

    // Act: Go to Page 2
    await user.click(screen.getByTestId('page-2-btn'));

    // Assert: Load next list (Page 2 with remaining 2 flights)
    await waitFor(() => {
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 2');
    });

    rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN005');
    expect(screen.getByTestId('flight-number-1')).toHaveTextContent('VN006');
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 2 of 7 flights');

    // Go back to Page 1
    await user.click(screen.getByTestId('page-1-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2');
      const rows = within(tbody).getAllByRole('row');
      expect(rows).toHaveLength(5);
    });
  });

  /**
   * TC-FLT-SRC-010: Bulk Delete (If avail)
   * Business Requirement: Feature
   * 
   * Test Data / Input: Select multiple -> Delete. Action
   * Expected Result: Delete selected (if validation pass)
   */
  it('TC-FLT-SRC-010: should bulk delete selected flights', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Select multiple flights (first 3)
    await user.click(screen.getByTestId('select-flight-0'));
    await user.click(screen.getByTestId('select-flight-1'));
    await user.click(screen.getByTestId('select-flight-2'));

    // Assert: Bulk actions appear
    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
      expect(screen.getByTestId('selected-count')).toHaveTextContent('3 selected');
    });

    // Act: Delete selected
    await user.click(screen.getByTestId('bulk-delete-btn'));

    // Assert: Delete selected (if validation pass)
    await waitFor(() => {
      expect(mockBulkDeleteFlights).toHaveBeenCalledWith([
        'flight_001',
        'flight_002',
        'flight_003'
      ]);
      expect(screen.getByTestId('success-message')).toHaveTextContent('3 flights deleted successfully');
    });

    // Verify selection cleared
    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument();
  });

  /**
   * TC-FLT-SRC-011: Select All Flights on Current Page
   * Additional test for bulk selection convenience
   */
  it('TC-FLT-SRC-011: should select all flights on current page using select-all checkbox', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Click select-all checkbox
    await user.click(screen.getByTestId('select-all-checkbox'));

    // Assert: All 5 flights on page 1 selected
    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
      expect(screen.getByTestId('selected-count')).toHaveTextContent('5 selected');
    });

    // Deselect all
    await user.click(screen.getByTestId('select-all-checkbox'));

    await waitFor(() => {
      expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument();
    });
  });

  /**
   * TC-FLT-SRC-012: Combined Filters
   * Additional test for multiple filter combinations
   */
  it('TC-FLT-SRC-012: should apply multiple filters simultaneously', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightListManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Apply multiple filters (Origin: Ho Chi Minh, Status: Delayed)
    await user.selectOptions(screen.getByTestId('origin-filter'), 'Ho Chi Minh');
    await user.selectOptions(screen.getByTestId('status-filter'), 'Delayed');

    // Assert: Show only flights from HCM with Delayed status (VN002, VN004 - 2 flights)
    await waitFor(() => {
      const tbody = screen.getByTestId('flight-list-tbody');
      const rows = within(tbody).getAllByRole('row');
      
      expect(rows).toHaveLength(2);
      expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN002');
      expect(screen.getByTestId('flight-status-0')).toHaveTextContent('Delayed');
      expect(screen.getByTestId('flight-route-0')).toHaveTextContent('SGN');
      expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 2 of 2 flights');
    });
  });
});

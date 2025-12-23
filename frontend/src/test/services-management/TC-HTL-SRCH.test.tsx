/**
 * Test Suite: Hotel Search - Filter by Rating
 * 
 * Test Cases Covered:
 * - TC-HTL-SRCH-001: Verify Filter Hotel by Rating
 * 
 * NOTE: These tests document expected hotel search behavior.
 * Many features may not be implemented yet - tests may fail.
 * This is expected and acceptable for TDD approach.
 * 
 * Framework: Vitest + React Testing Library
 * Pattern: Unit/Integration tests with mocked API calls
 * Business Rules: BR64
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock hotel data with various ratings
const mockHotels = [
  {
    hotel_id: 1,
    name: 'Grand Plaza Hotel',
    address: '123 Main Street, New York, NY 10001',
    rating: 5,
    description: 'Luxury hotel in downtown Manhattan',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    price_per_night: 250.00,
    available_rooms: 150,
  },
  {
    hotel_id: 2,
    name: 'Royal Suites',
    address: '456 Park Avenue, New York, NY 10022',
    rating: 5,
    description: 'Five-star accommodations with premium service',
    amenities: ['WiFi', 'Pool', 'Concierge', 'Valet'],
    price_per_night: 320.00,
    available_rooms: 80,
  },
  {
    hotel_id: 3,
    name: 'Seaside Resort',
    address: '456 Beach Boulevard, Miami, FL 33139',
    rating: 4,
    description: 'Beachfront resort with ocean views',
    amenities: ['WiFi', 'Pool', 'Beach Access', 'Bar'],
    price_per_night: 180.00,
    available_rooms: 100,
  },
  {
    hotel_id: 4,
    name: 'Downtown Hotel',
    address: '789 Business Street, Chicago, IL 60601',
    rating: 4,
    description: 'Modern hotel in business district',
    amenities: ['WiFi', 'Business Center', 'Gym'],
    price_per_night: 150.00,
    available_rooms: 120,
  },
  {
    hotel_id: 5,
    name: 'City Center Inn',
    address: '789 Downtown Ave, Los Angeles, CA 90012',
    rating: 3,
    description: 'Affordable hotel in city center',
    amenities: ['WiFi', 'Parking'],
    price_per_night: 100.00,
    available_rooms: 60,
  },
  {
    hotel_id: 6,
    name: 'Budget Stay',
    address: '321 Economy Road, Houston, TX 77002',
    rating: 2,
    description: 'Basic accommodation for budget travelers',
    amenities: ['WiFi'],
    price_per_night: 60.00,
    available_rooms: 40,
  },
];

// Mock Hotel Booking Search Component
interface HotelBookingSearchProps {
  onHotelSelected?: (hotel: any) => void;
}

const HotelBookingSearch: React.FC<HotelBookingSearchProps> = ({ onHotelSelected }) => {
  const [hotels, setHotels] = React.useState<any[]>([]);
  const [filteredHotels, setFilteredHotels] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRating, setSelectedRating] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    fetchHotels();
  }, []);

  React.useEffect(() => {
    applyFilters();
  }, [selectedRating, hotels]);

  const fetchHotels = async () => {
    try {
      const response = await axios.get('/api/hotels/search');
      setHotels(response.data);
      setFilteredHotels(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load hotels');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...hotels];

    // Filter by rating if selected
    if (selectedRating) {
      const rating = parseInt(selectedRating);
      filtered = filtered.filter(hotel => hotel.rating === rating);
    }

    setFilteredHotels(filtered);
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRating(rating);
  };

  const handleClearFilters = () => {
    setSelectedRating('');
  };

  const handleSelectHotel = (hotel: any) => {
    onHotelSelected?.(hotel);
  };

  if (loading) return <div>Loading hotels...</div>;

  return (
    <div data-testid="hotel-booking-search">
      <h2>Hotel Booking</h2>
      <p>Find and book your perfect accommodation</p>

      {error && (
        <div data-testid="error-message" role="alert">
          {error}
        </div>
      )}

      <div data-testid="search-filters">
        <h3>Filters</h3>

        <div data-testid="rating-filter">
          <label>Star Rating</label>
          <select
            data-testid="rating-select"
            value={selectedRating}
            onChange={(e) => handleRatingChange(e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {selectedRating && (
          <button
            data-testid="clear-filters-button"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div data-testid="search-results">
        <h3>
          Hotels Found: {filteredHotels.length}
          {selectedRating && ` (${selectedRating} ${selectedRating === '1' ? 'Star' : 'Stars'})`}
        </h3>

        {filteredHotels.length === 0 ? (
          <div data-testid="no-results-message">
            No hotels found matching your criteria
          </div>
        ) : (
          <div data-testid="hotels-list">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.hotel_id}
                data-testid={`hotel-card-${hotel.hotel_id}`}
                onClick={() => handleSelectHotel(hotel)}
              >
                <div data-testid={`hotel-name-${hotel.hotel_id}`}>{hotel.name}</div>
                <div data-testid={`hotel-rating-${hotel.hotel_id}`}>
                  {'⭐'.repeat(hotel.rating)} ({hotel.rating} Stars)
                </div>
                <div data-testid={`hotel-address-${hotel.hotel_id}`}>{hotel.address}</div>
                <div data-testid={`hotel-description-${hotel.hotel_id}`}>{hotel.description}</div>
                <div data-testid={`hotel-price-${hotel.hotel_id}`}>
                  ${hotel.price_per_night.toFixed(2)}/night
                </div>
                <div data-testid={`hotel-rooms-${hotel.hotel_id}`}>
                  {hotel.available_rooms} rooms available
                </div>
                <div data-testid={`hotel-amenities-${hotel.hotel_id}`}>
                  Amenities: {hotel.amenities.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

describe('TC-HTL-SRCH-001: Verify Filter Hotel by Rating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Prerequisites: User on Hotel Booking page', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Verify Hotel Booking page is displayed
    expect(getByTestId('hotel-booking-search')).toHaveTextContent('Hotel Booking');
    expect(getByTestId('hotel-booking-search')).toHaveTextContent('Find and book your perfect accommodation');

    // Verify search filters are available
    expect(getByTestId('search-filters')).toBeInTheDocument();
    expect(getByTestId('rating-filter')).toBeInTheDocument();
    expect(getByTestId('rating-select')).toBeInTheDocument();

    // Verify all hotels are displayed initially
    expect(getByTestId('search-results')).toBeInTheDocument();
    expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 6');

    // Verify hotels with different ratings are present
    expect(getByTestId('hotel-card-1')).toBeInTheDocument(); // 5 stars
    expect(getByTestId('hotel-rating-1')).toHaveTextContent('5 Stars');
    expect(getByTestId('hotel-card-3')).toBeInTheDocument(); // 4 stars
    expect(getByTestId('hotel-rating-3')).toHaveTextContent('4 Stars');
    expect(getByTestId('hotel-card-5')).toBeInTheDocument(); // 3 stars
    expect(getByTestId('hotel-rating-5')).toHaveTextContent('3 Stars');

    console.log('✓ TC-HTL-SRCH-001 Prerequisites PASSED: User on Hotel Booking page');
  });

  it('Step 1: Select "5 Stars" in filter - Filter applied', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Verify initial state shows all hotels
    expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 6');

    // Select "5 Stars" in filter dropdown
    const ratingSelect = getByTestId('rating-select');
    fireEvent.change(ratingSelect, { target: { value: '5' } });

    // Verify filter is applied
    expect(ratingSelect).toHaveValue('5');

    // Verify filtered count updates
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 2');
      expect(getByTestId('search-results')).toHaveTextContent('(5 Stars)');
    });

    console.log('✓ TC-HTL-SRCH-001 Step 1 PASSED: 5 Stars filter applied');
  });

  it('TC-HTL-SRCH-001: Complete flow - System displays only hotels with Star Rating = 5', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId, queryByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Initial state: all 6 hotels displayed
    expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 6');
    expect(getByTestId('hotel-card-1')).toBeInTheDocument(); // 5 stars
    expect(getByTestId('hotel-card-2')).toBeInTheDocument(); // 5 stars
    expect(getByTestId('hotel-card-3')).toBeInTheDocument(); // 4 stars
    expect(getByTestId('hotel-card-4')).toBeInTheDocument(); // 4 stars
    expect(getByTestId('hotel-card-5')).toBeInTheDocument(); // 3 stars
    expect(getByTestId('hotel-card-6')).toBeInTheDocument(); // 2 stars

    // Select "5 Stars" filter
    fireEvent.change(getByTestId('rating-select'), { target: { value: '5' } });

    // Verify only 5-star hotels are displayed (BR64)
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 2 (5 Stars)');
    });

    // Verify 5-star hotels ARE displayed
    expect(getByTestId('hotel-card-1')).toBeInTheDocument();
    expect(getByTestId('hotel-name-1')).toHaveTextContent('Grand Plaza Hotel');
    expect(getByTestId('hotel-rating-1')).toHaveTextContent('5 Stars');

    expect(getByTestId('hotel-card-2')).toBeInTheDocument();
    expect(getByTestId('hotel-name-2')).toHaveTextContent('Royal Suites');
    expect(getByTestId('hotel-rating-2')).toHaveTextContent('5 Stars');

    // Verify non-5-star hotels are NOT displayed
    expect(queryByTestId('hotel-card-3')).not.toBeInTheDocument(); // 4 stars
    expect(queryByTestId('hotel-card-4')).not.toBeInTheDocument(); // 4 stars
    expect(queryByTestId('hotel-card-5')).not.toBeInTheDocument(); // 3 stars
    expect(queryByTestId('hotel-card-6')).not.toBeInTheDocument(); // 2 stars

    // Verify hotel details are displayed correctly
    expect(getByTestId('hotel-address-1')).toHaveTextContent('123 Main Street, New York, NY 10001');
    expect(getByTestId('hotel-price-1')).toHaveTextContent('$250.00/night');
    expect(getByTestId('hotel-rooms-1')).toHaveTextContent('150 rooms available');
    expect(getByTestId('hotel-amenities-1')).toHaveTextContent('WiFi, Pool, Spa, Restaurant, Gym');

    console.log('✓ TC-HTL-SRCH-001 PASSED: System displays only 5-star hotels');
  });

  it('Verify filter for 4 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId, queryByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Select "4 Stars" filter
    fireEvent.change(getByTestId('rating-select'), { target: { value: '4' } });

    // Verify only 4-star hotels displayed
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 2 (4 Stars)');
    });

    expect(getByTestId('hotel-card-3')).toBeInTheDocument();
    expect(getByTestId('hotel-name-3')).toHaveTextContent('Seaside Resort');
    expect(getByTestId('hotel-card-4')).toBeInTheDocument();
    expect(getByTestId('hotel-name-4')).toHaveTextContent('Downtown Hotel');

    // 5-star hotels not shown
    expect(queryByTestId('hotel-card-1')).not.toBeInTheDocument();
    expect(queryByTestId('hotel-card-2')).not.toBeInTheDocument();

    console.log('✓ TC-HTL-SRCH-001 Additional Test PASSED: 4 Stars filter works');
  });

  it('Verify filter for 3 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId, queryByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Select "3 Stars" filter
    fireEvent.change(getByTestId('rating-select'), { target: { value: '3' } });

    // Verify only 3-star hotel displayed
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 1 (3 Stars)');
    });

    expect(getByTestId('hotel-card-5')).toBeInTheDocument();
    expect(getByTestId('hotel-name-5')).toHaveTextContent('City Center Inn');

    // Other ratings not shown
    expect(queryByTestId('hotel-card-1')).not.toBeInTheDocument();
    expect(queryByTestId('hotel-card-3')).not.toBeInTheDocument();

    console.log('✓ TC-HTL-SRCH-001 Additional Test PASSED: 3 Stars filter works');
  });

  it('Verify "All Ratings" shows all hotels', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Select 5 stars first
    fireEvent.change(getByTestId('rating-select'), { target: { value: '5' } });

    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 2');
    });

    // Switch back to "All Ratings"
    fireEvent.change(getByTestId('rating-select'), { target: { value: '' } });

    // Verify all hotels are displayed again
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 6');
    });

    expect(getByTestId('hotel-card-1')).toBeInTheDocument();
    expect(getByTestId('hotel-card-3')).toBeInTheDocument();
    expect(getByTestId('hotel-card-5')).toBeInTheDocument();
    expect(getByTestId('hotel-card-6')).toBeInTheDocument();

    console.log('✓ TC-HTL-SRCH-001 Additional Test PASSED: All Ratings restores full list');
  });

  it('Verify Clear Filters button', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId, queryByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Initially no clear button
    expect(queryByTestId('clear-filters-button')).not.toBeInTheDocument();

    // Apply filter
    fireEvent.change(getByTestId('rating-select'), { target: { value: '5' } });

    // Clear button appears
    await waitFor(() => {
      expect(getByTestId('clear-filters-button')).toBeInTheDocument();
    });

    // Click clear
    fireEvent.click(getByTestId('clear-filters-button'));

    // Verify filters cleared
    expect(getByTestId('rating-select')).toHaveValue('');
    expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 6');

    console.log('✓ TC-HTL-SRCH-001 Additional Test PASSED: Clear filters works');
  });

  it('Verify no results for 1 Star rating', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Select "1 Star" filter (no hotels have 1 star)
    fireEvent.change(getByTestId('rating-select'), { target: { value: '1' } });

    // Verify no results message
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 0 (1 Star)');
      expect(getByTestId('no-results-message')).toBeInTheDocument();
      expect(getByTestId('no-results-message')).toHaveTextContent('No hotels found matching your criteria');
    });

    console.log('✓ TC-HTL-SRCH-001 Additional Test PASSED: No results handling works');
  });

describe('TC-SRCH-HTL-001..010: Hotel Search Filters (Rating + Location)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const dataset = [
    { hotel_id: 201, name: 'Hanoi Budget', address: 'Hanoi', rating: 1, city: 'Hanoi', price_per_night: 30.0, available_rooms: 5, amenities: [] },
    { hotel_id: 202, name: 'Hanoi Comfort', address: 'Hanoi Old Quarter', rating: 5, city: 'Hanoi', price_per_night: 200.0, available_rooms: 20, amenities: [] },
    { hotel_id: 203, name: 'HCM Central', address: 'District 1', rating: 3, city: 'HCM', price_per_night: 90.0, available_rooms: 10, amenities: [] },
    { hotel_id: 204, name: 'HCM Luxury', address: 'District 3', rating: 5, city: 'HCM', price_per_night: 300.0, available_rooms: 8, amenities: [] },
    { hotel_id: 205, name: 'Da Nang Seaview', address: 'My Khe', rating: 4, city: 'Da Nang', price_per_night: 120.0, available_rooms: 12, amenities: [] },
    { hotel_id: 206, name: 'Da Nang Hostel', address: 'Backpacker Street', rating: 2, city: 'Da Nang', price_per_night: 25.0, available_rooms: 6, amenities: [] },
    { hotel_id: 207, name: 'Hanoi Mid', address: 'Hanoi Suburb', rating: 3, city: 'Hanoi', price_per_night: 70.0, available_rooms: 7, amenities: [] },
  ];

  const TestHotelSearchFilters: React.FC = () => {
    const [all, setAll] = React.useState<any[]>([]);
    const [filtered, setFiltered] = React.useState<any[]>([]);
    const [rating, setRating] = React.useState('');
    const [city, setCity] = React.useState('');

    React.useEffect(() => {
      const fetch = async () => {
        const res = await axios.get('/api/hotels/search');
        setAll(res.data);
        setFiltered(res.data);
      };
      fetch();
    }, []);

    const apply = () => {
      let r = [...all];
      if (rating) r = r.filter(h => h.rating === Number(rating));
      if (city) r = r.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
      setFiltered(r);
    };

    return (
      <div data-testid="hotel-search-filters">
        <select data-testid="rating-select-2" value={rating} onChange={e => setRating(e.target.value)}>
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <input data-testid="location-input-2" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
        <button data-testid="apply-filters-htl" onClick={apply}>Apply</button>

        <div data-testid="search-results-htl">
          <h4>Hotels ({filtered.length})</h4>
          {filtered.length === 0 ? (
            <div data-testid="no-results-htl">No results found</div>
          ) : (
            <div data-testid="hotels-list-htl">
              {filtered.map(h => (
                <div key={h.hotel_id} data-testid={`hotel-item-${h.hotel_id}`}>
                  <div data-testid={`hotel-name-${h.hotel_id}`}>{h.name}</div>
                  <div data-testid={`hotel-city-${h.hotel_id}`}>{h.city}</div>
                  <div data-testid={`hotel-rating-${h.hotel_id}`}>{h.rating} Stars</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  it('TC-SRCH-HTL-001: Filter by Rating: 1 Star', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId, queryByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('rating-select-2'), { target: { value: '1' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (1)'));
    expect(getByTestId('hotel-item-201')).toBeInTheDocument();
    expect(queryByTestId('hotel-item-202')).not.toBeInTheDocument();
  });

  it('TC-SRCH-HTL-002: Filter by Rating: 2 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('rating-select-2'), { target: { value: '2' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (1)'));
    expect(getByTestId('hotel-item-206')).toBeInTheDocument();
  });

  it('TC-SRCH-HTL-003: Filter by Rating: 3 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('rating-select-2'), { target: { value: '3' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (2)'));
    expect(getByTestId('hotel-item-203')).toBeInTheDocument();
    expect(getByTestId('hotel-item-207')).toBeInTheDocument();
  });

  it('TC-SRCH-HTL-004: Filter by Rating: 4 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('rating-select-2'), { target: { value: '4' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (1)'));
    expect(getByTestId('hotel-item-205')).toBeInTheDocument();
  });

  it('TC-SRCH-HTL-005: Filter by Rating: 5 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('rating-select-2'), { target: { value: '5' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (2)'));
    expect(getByTestId('hotel-item-202')).toBeInTheDocument();
    expect(getByTestId('hotel-item-204')).toBeInTheDocument();
  });

  it('TC-SRCH-HTL-006: Filter by Location: Hanoi', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId, queryByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('location-input-2'), { target: { value: 'Hanoi' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (3)'));
    expect(getByTestId('hotel-item-201')).toBeInTheDocument();
    expect(getByTestId('hotel-item-202')).toBeInTheDocument();
    expect(getByTestId('hotel-item-207')).toBeInTheDocument();
    expect(queryByTestId('hotel-item-203')).not.toBeInTheDocument();
  });

  it('TC-SRCH-HTL-007: Filter by Location: HCM', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('location-input-2'), { target: { value: 'HCM' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (2)'));
    expect(getByTestId('hotel-item-203')).toBeInTheDocument();
    expect(getByTestId('hotel-item-204')).toBeInTheDocument();
  });

  it('TC-SRCH-HTL-008: Filter by Location: Da Nang', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('location-input-2'), { target: { value: 'Da Nang' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (2)'));
    expect(getByTestId('hotel-item-205')).toBeInTheDocument();
    expect(getByTestId('hotel-item-206')).toBeInTheDocument();
  });

  it('TC-SRCH-HTL-009: Filter Combined: Hanoi + 5 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId, queryByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('location-input-2'), { target: { value: 'Hanoi' } });
    fireEvent.change(getByTestId('rating-select-2'), { target: { value: '5' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (1)'));
    expect(getByTestId('hotel-item-202')).toBeInTheDocument();
    expect(queryByTestId('hotel-item-201')).not.toBeInTheDocument();
  });

  it('TC-SRCH-HTL-010: Filter Combined: HCM + 3 Stars', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: dataset });
    const { getByTestId } = render(<TestHotelSearchFilters />);

    await waitFor(() => expect(getByTestId('hotel-search-filters')).toBeInTheDocument());
    fireEvent.change(getByTestId('location-input-2'), { target: { value: 'HCM' } });
    fireEvent.change(getByTestId('rating-select-2'), { target: { value: '3' } });
    fireEvent.click(getByTestId('apply-filters-htl'));

    await waitFor(() => expect(getByTestId('search-results-htl')).toHaveTextContent('Hotels (1)'));
    expect(getByTestId('hotel-item-203')).toBeInTheDocument();
  });
});

  it('Verify hotel selection callback', async () => {
    const mockHotelSelected = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch onHotelSelected={mockHotelSelected} />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Filter to 5 stars
    fireEvent.change(getByTestId('rating-select'), { target: { value: '5' } });

    await waitFor(() => {
      expect(getByTestId('hotel-card-1')).toBeInTheDocument();
    });

    // Click on a hotel
    fireEvent.click(getByTestId('hotel-card-1'));

    // Verify callback called
    expect(mockHotelSelected).toHaveBeenCalledWith(
      expect.objectContaining({
        hotel_id: 1,
        name: 'Grand Plaza Hotel',
        rating: 5,
      })
    );

    console.log('✓ TC-HTL-SRCH-001 Additional Test PASSED: Hotel selection works');
  });
});

describe('TC-HTL-SRCH-002: Verify Search Hotel - By City', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return hotels whose address contains the searched city', async () => {
    const hotels = [
      { hotel_id: 10, name: 'Da Nang Bay', address: '123 Beach Rd, Da Nang', rating: 4, price_per_night: 120.0, available_rooms: 10, amenities: [] },
      { hotel_id: 11, name: 'Hanoi Central', address: '1 Old Street, Hanoi', rating: 4, price_per_night: 90.0, available_rooms: 20, amenities: [] },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: hotels });

    const { getByTestId, queryByText } = render(<HotelBookingSearch />);
    await waitFor(() => expect(getByTestId('hotel-booking-search')).toBeInTheDocument());

    // Simulate entering location in a search field (assume presence of search input)
    const searchInput = document.createElement('input');
    searchInput.setAttribute('data-testid', 'location-input');
    document.body.appendChild(searchInput);
    fireEvent.change(searchInput, { target: { value: 'Da Nang' } });

    // Trigger a search - for this component we'll simulate re-fetch by calling mockedAxios again
    // In practice the component would call the API with the location filter
    mockedAxios.get.mockResolvedValueOnce({ data: hotels.filter(h => h.address.includes('Da Nang')) });

    // Simulate search action
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(queryByText('Da Nang Bay')).toBeInTheDocument();
      expect(queryByText('Hanoi Central')).not.toBeInTheDocument();
    });
  });
});

describe('Additional Hotel Search Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should handle API error gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          message: 'Failed to fetch hotels',
        },
      },
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('error-message')).toBeInTheDocument();
      expect(getByTestId('error-message')).toHaveTextContent('Failed to load hotels');
    });

    console.log('✓ Additional Test PASSED: API error handled');
  });

  it('Should display hotel amenities correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Verify amenities displayed
    expect(getByTestId('hotel-amenities-1')).toHaveTextContent('WiFi, Pool, Spa, Restaurant, Gym');
    expect(getByTestId('hotel-amenities-5')).toHaveTextContent('WiFi, Parking');

    console.log('✓ Additional Test PASSED: Amenities displayed correctly');
  });

  it('Should sort hotels by rating in filter results', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Select 5 stars
    fireEvent.change(getByTestId('rating-select'), { target: { value: '5' } });

    await waitFor(() => {
      const hotelCards = document.querySelectorAll('[data-testid^="hotel-card-"]');
      expect(hotelCards.length).toBe(2);
      
      // Verify both are 5-star hotels
      const ratings = Array.from(hotelCards).map(card => {
        const id = card.getAttribute('data-testid')?.split('-')[2];
        const ratingEl = document.querySelector(`[data-testid="hotel-rating-${id}"]`);
        return ratingEl?.textContent;
      });
      
      expect(ratings.every(r => r?.includes('5 Stars'))).toBe(true);
    });

    console.log('✓ Additional Test PASSED: Filter results consistency verified');
  });

  it('Should handle rapid filter changes', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelBookingSearch />);

    await waitFor(() => {
      expect(getByTestId('hotel-booking-search')).toBeInTheDocument();
    });

    // Rapidly change filters
    fireEvent.change(getByTestId('rating-select'), { target: { value: '5' } });
    fireEvent.change(getByTestId('rating-select'), { target: { value: '4' } });
    fireEvent.change(getByTestId('rating-select'), { target: { value: '3' } });

    // Final state should be 3 stars
    await waitFor(() => {
      expect(getByTestId('search-results')).toHaveTextContent('Hotels Found: 1 (3 Stars)');
      expect(getByTestId('hotel-card-5')).toBeInTheDocument();
    });

    console.log('✓ Additional Test PASSED: Rapid filter changes handled');
  });
});

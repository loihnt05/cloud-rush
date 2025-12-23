/**
 * Test Suite: TC-ADM-USR - Admin User Management UI (Danh sách User)
 * 
 * Sub-Category: Admin User Management UI
 * Description: Mở rộng cho Admin Operations (BR14, BR15) - Quản lý danh sách người dùng.
 * 
 * Business Requirements Coverage:
 * - BR14: Admin role management operations
 * - BR15: User list management and filtering
 * - User search and filtering capabilities
 * - Pagination for large user lists
 * - User details view
 * - User account status management (ban/deactivate)
 * 
 * Test Cases:
 * - TC-ADM-USR-001: Verify User List - Load
 * - TC-ADM-USR-002: Verify Filter - By Role (Traveler)
 * - TC-ADM-USR-003: Verify Filter - By Role (CSA)
 * - TC-ADM-USR-004: Verify Search - By Email
 * - TC-ADM-USR-005: Verify Search - Partial Name
 * - TC-ADM-USR-006: Verify Search - No Result
 * - TC-ADM-USR-007: Verify Pagination - Next Page
 * - TC-ADM-USR-008: Verify Pagination - Items per Page
 * - TC-ADM-USR-009: Verify User Details View
 * - TC-ADM-USR-010: Verify Ban User
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ==================== MOCK API FUNCTIONS ====================

const mockGetUserList = vi.fn();
const mockGetUserDetails = vi.fn();
const mockBanUser = vi.fn();
const mockUnbanUser = vi.fn();
const mockNavigateToUserDetails = vi.fn();

// ==================== CONSTANTS ====================

const USER_ROLES = ['All', 'Traveler', 'CSA', 'Agent', 'Admin'] as const;
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

// ==================== MOCK DATA ====================

const mockUsers = [
  {
    id: 'user_001',
    name: 'Nguyen Van A',
    email: 'nguyen.a@example.com',
    role: 'Traveler',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-12-20T08:30:00Z',
  },
  {
    id: 'user_002',
    name: 'Nguyen Thi B',
    email: 'nguyen.b@example.com',
    role: 'Traveler',
    status: 'active',
    createdAt: '2024-02-10T14:20:00Z',
    lastLogin: '2024-12-22T15:45:00Z',
  },
  {
    id: 'user_003',
    name: 'Tran Van C',
    email: 'tran.c@example.com',
    role: 'CSA',
    status: 'active',
    createdAt: '2024-03-05T09:15:00Z',
    lastLogin: '2024-12-23T07:20:00Z',
  },
  {
    id: 'user_004',
    name: 'Le Thi D',
    email: 'le.d@example.com',
    role: 'CSA',
    status: 'active',
    createdAt: '2024-04-12T11:30:00Z',
    lastLogin: '2024-12-21T16:10:00Z',
  },
  {
    id: 'user_005',
    name: 'Pham Van E',
    email: 'pham.e@example.com',
    role: 'Agent',
    status: 'active',
    createdAt: '2024-05-20T13:45:00Z',
    lastLogin: '2024-12-19T12:00:00Z',
  },
  {
    id: 'user_006',
    name: 'Hoang Thi F',
    email: 'hoang.f@example.com',
    role: 'Traveler',
    status: 'banned',
    createdAt: '2024-06-08T08:00:00Z',
    lastLogin: '2024-12-10T10:30:00Z',
  },
  {
    id: 'user_007',
    name: 'Vu Van G',
    email: 'vu.g@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-12-23T09:00:00Z',
  },
];

// Generate more users for pagination testing
const generateMockUsers = (count: number) => {
  const users = [...mockUsers];
  for (let i = users.length; i < count; i++) {
    users.push({
      id: `user_${String(i + 1).padStart(3, '0')}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['Traveler', 'CSA', 'Agent'][i % 3] as any,
      status: i % 10 === 0 ? 'banned' : 'active',
      createdAt: new Date(2024, 0, i % 28 + 1).toISOString(),
      lastLogin: new Date(2024, 11, (i % 28) + 1).toISOString(),
    });
  }
  return users;
};

// ==================== MOCK COMPONENTS ====================

/**
 * User Management Page Component
 * - Display list of users with filtering and search
 * - Pagination support
 * - Role filtering
 * - Search by name or email
 * - User actions (view details, ban/unban)
 */
interface UserManagementPageProps {
  currentUserRole: string;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ currentUserRole }) => {
  const [users, setUsers] = React.useState<typeof mockUsers>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('All');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);

  React.useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, currentPage, itemsPerPage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await mockGetUserList({
        search: searchQuery,
        role: roleFilter === 'All' ? undefined : roleFilter,
        page: currentPage,
        limit: itemsPerPage,
      });
      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (err) {
      console.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleBanUser = async (userId: string) => {
    try {
      await mockBanUser(userId);
      // Reload users after ban
      loadUsers();
    } catch (err) {
      console.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await mockUnbanUser(userId);
      // Reload users after unban
      loadUsers();
    } catch (err) {
      console.error('Failed to unban user');
    }
  };

  const handleViewDetails = (userId: string) => {
    mockNavigateToUserDetails(userId);
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (loading) {
    return <div data-testid="loading">Loading users...</div>;
  }

  return (
    <div data-testid="user-management-page">
      <h1>User Management</h1>
      
      {/* Search and Filter Section */}
      <div data-testid="search-filter-section">
        {/* Search Input */}
        <div data-testid="search-section">
          <label htmlFor="search">Search:</label>
          <input
            id="search"
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            data-testid="search-input"
          />
        </div>

        {/* Role Filter */}
        <div data-testid="role-filter-section">
          <label htmlFor="role-filter">Filter by Role:</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            data-testid="role-filter"
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User Count */}
      <div data-testid="user-count">
        Total Users: {totalUsers}
      </div>

      {/* User List Table */}
      {users.length === 0 ? (
        <div data-testid="no-users-message">No users found</div>
      ) : (
        <table data-testid="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} data-testid={`user-row-${user.id}`}>
                <td data-testid={`user-id-${user.id}`}>
                  <button
                    onClick={() => handleViewDetails(user.id)}
                    data-testid={`view-details-${user.id}`}
                    style={{ color: 'blue', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {user.id}
                  </button>
                </td>
                <td data-testid={`user-name-${user.id}`}>{user.name}</td>
                <td data-testid={`user-email-${user.id}`}>{user.email}</td>
                <td data-testid={`user-role-${user.id}`}>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td data-testid={`user-status-${user.id}`}>
                  <span className={`status-badge status-${user.status}`}>
                    {user.status.toUpperCase()}
                  </span>
                </td>
                <td data-testid={`user-lastlogin-${user.id}`}>
                  {new Date(user.lastLogin).toLocaleString()}
                </td>
                <td data-testid={`user-actions-${user.id}`}>
                  {user.status === 'active' ? (
                    <button
                      onClick={() => handleBanUser(user.id)}
                      data-testid={`ban-button-${user.id}`}
                      style={{ backgroundColor: 'red', color: 'white' }}
                    >
                      Ban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnbanUser(user.id)}
                      data-testid={`unban-button-${user.id}`}
                      style={{ backgroundColor: 'green', color: 'white' }}
                    >
                      Unban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Section */}
      <div data-testid="pagination-section">
        {/* Items Per Page Selector */}
        <div data-testid="items-per-page-section">
          <label htmlFor="items-per-page">Items per page:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            data-testid="items-per-page-select"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Page Navigation */}
        <div data-testid="page-navigation">
          <span data-testid="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            data-testid="prev-page-button"
          >
            &lt; Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            data-testid="next-page-button"
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * User Details Modal/Page Component
 * - Display detailed user information
 * - Show user activity history
 * - Admin actions
 */
interface UserDetailsPageProps {
  userId: string;
  onClose?: () => void;
}

const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ userId, onClose }) => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const userData = await mockGetUserDetails(userId);
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    loadUserDetails();
  }, [userId]);

  if (loading) {
    return <div data-testid="details-loading">Loading user details...</div>;
  }

  if (!user) {
    return <div data-testid="details-error">User not found</div>;
  }

  return (
    <div data-testid="user-details-page">
      <h2>User Details</h2>
      
      <div data-testid="user-details-content">
        <div data-testid="detail-user-id">
          <strong>User ID:</strong> {user.id}
        </div>
        <div data-testid="detail-name">
          <strong>Name:</strong> {user.name}
        </div>
        <div data-testid="detail-email">
          <strong>Email:</strong> {user.email}
        </div>
        <div data-testid="detail-role">
          <strong>Role:</strong> {user.role}
        </div>
        <div data-testid="detail-status">
          <strong>Status:</strong> {user.status}
        </div>
        <div data-testid="detail-created">
          <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}
        </div>
        <div data-testid="detail-lastlogin">
          <strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}
        </div>
      </div>

      {onClose && (
        <button onClick={onClose} data-testid="close-details-button">
          Close
        </button>
      )}
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-ADM-USR: Admin User Management UI (Danh sách User)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-ADM-USR-001: Verify User List - Load
   * 
   * Objective: Verify that admin can access user management and see user list
   * 
   * Prerequisites: Admin is logged in
   * 
   * Steps:
   * 1. Access "User Management" page
   * 
   * Expected Result:
   * - User management page loads successfully
   * - User list is displayed in table format
   * - All users are shown with their details (ID, name, email, role, status, last login)
   */
  it('TC-ADM-USR-001: Should load and display user list on accessing User Management', async () => {
    mockGetUserList.mockResolvedValue({
      users: mockUsers,
      total: mockUsers.length,
    });

    render(<UserManagementPage currentUserRole="Admin" />);

    // Verify loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for users to load
    await waitFor(() => {
      expect(mockGetUserList).toHaveBeenCalledWith({
        search: '',
        role: undefined,
        page: 1,
        limit: 10,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Verify user table is displayed
    expect(screen.getByTestId('user-table')).toBeInTheDocument();

    // Verify user count
    expect(screen.getByTestId('user-count')).toHaveTextContent(`Total Users: ${mockUsers.length}`);

    // Verify first user is displayed
    expect(screen.getByTestId('user-row-user_001')).toBeInTheDocument();
    expect(screen.getByTestId('user-name-user_001')).toHaveTextContent('Nguyen Van A');
    expect(screen.getByTestId('user-email-user_001')).toHaveTextContent('nguyen.a@example.com');
    expect(screen.getByTestId('user-role-user_001')).toHaveTextContent('Traveler');
    expect(screen.getByTestId('user-status-user_001')).toHaveTextContent('ACTIVE');
  });

  /**
   * TC-ADM-USR-002: Verify Filter - By Role (Traveler)
   * 
   * Objective: Verify that filtering by "Traveler" role shows only travelers
   * 
   * Prerequisites: User Management Page loaded
   * 
   * Steps:
   * 1. Select "Traveler" from role filter dropdown
   * 
   * Expected Result:
   * - User list is filtered to show only users with "Traveler" role
   * - User count updates to show filtered count
   * - Only travelers are visible in the table
   */
  it('TC-ADM-USR-002: Should filter users by Traveler role', async () => {
    const travelersOnly = mockUsers.filter(u => u.role === 'Traveler');
    
    mockGetUserList.mockResolvedValueOnce({
      users: mockUsers,
      total: mockUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Select Traveler role filter
    mockGetUserList.mockResolvedValueOnce({
      users: travelersOnly,
      total: travelersOnly.length,
    });

    const roleFilter = screen.getByTestId('role-filter');
    await user.selectOptions(roleFilter, 'Traveler');

    // Verify API is called with role filter
    await waitFor(() => {
      expect(mockGetUserList).toHaveBeenCalledWith({
        search: '',
        role: 'Traveler',
        page: 1,
        limit: 10,
      });
    });

    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByTestId('user-count')).toHaveTextContent(`Total Users: ${travelersOnly.length}`);
    });

    // Verify only travelers are shown
    expect(screen.getByTestId('user-row-user_001')).toBeInTheDocument();
    expect(screen.getByTestId('user-role-user_001')).toHaveTextContent('Traveler');
    
    // Verify CSA user is not shown
    expect(screen.queryByTestId('user-row-user_003')).not.toBeInTheDocument();
  });

  /**
   * TC-ADM-USR-003: Verify Filter - By Role (CSA)
   * 
   * Objective: Verify that filtering by "CSA" role shows only CSA users
   * 
   * Prerequisites: User Management Page loaded
   * 
   * Steps:
   * 1. Select "CSA" from role filter dropdown
   * 
   * Expected Result:
   * - User list is filtered to show only users with "CSA" role
   * - User count updates appropriately
   * - Only CSA users are visible
   */
  it('TC-ADM-USR-003: Should filter users by CSA role', async () => {
    const csaOnly = mockUsers.filter(u => u.role === 'CSA');
    
    mockGetUserList.mockResolvedValueOnce({
      users: mockUsers,
      total: mockUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Select CSA role filter
    mockGetUserList.mockResolvedValueOnce({
      users: csaOnly,
      total: csaOnly.length,
    });

    const roleFilter = screen.getByTestId('role-filter');
    await user.selectOptions(roleFilter, 'CSA');

    // Verify API is called with CSA filter
    await waitFor(() => {
      expect(mockGetUserList).toHaveBeenCalledWith({
        search: '',
        role: 'CSA',
        page: 1,
        limit: 10,
      });
    });

    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByTestId('user-count')).toHaveTextContent(`Total Users: ${csaOnly.length}`);
    });

    // Verify only CSA users are shown
    expect(screen.getByTestId('user-row-user_003')).toBeInTheDocument();
    expect(screen.getByTestId('user-role-user_003')).toHaveTextContent('CSA');
    
    expect(screen.getByTestId('user-row-user_004')).toBeInTheDocument();
    expect(screen.getByTestId('user-role-user_004')).toHaveTextContent('CSA');
  });

  /**
   * TC-ADM-USR-004: Verify Search - By Email
   * 
   * Objective: Verify that searching by specific email returns matching user
   * 
   * Prerequisites: User Management Page loaded
   * 
   * Steps:
   * 1. Enter specific email address in search box
   * 
   * Expected Result:
   * - Search is performed with email query
   * - Only user(s) with matching email are displayed
   * - User count shows number of matches
   */
  it('TC-ADM-USR-004: Should search users by specific email address', async () => {
    const searchEmail = 'nguyen.a@example.com';
    const searchResult = mockUsers.filter(u => u.email === searchEmail);
    
    mockGetUserList.mockResolvedValueOnce({
      users: mockUsers,
      total: mockUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Perform search
    mockGetUserList.mockResolvedValueOnce({
      users: searchResult,
      total: searchResult.length,
    });

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, searchEmail);

    // Wait for the full text to be typed
    await waitFor(() => {
      expect(searchInput).toHaveValue(searchEmail);
    });

    // Verify API is called with search query (check last call since typing triggers on each keystroke)
    const calls = mockGetUserList.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toEqual({
      search: searchEmail,
      role: undefined,
      page: 1,
      limit: 10,
    });

    // Verify search results
    await waitFor(() => {
      expect(screen.getByTestId('user-count')).toHaveTextContent('Total Users: 1');
    });

    expect(screen.getByTestId('user-email-user_001')).toHaveTextContent(searchEmail);
  });

  /**
   * TC-ADM-USR-005: Verify Search - Partial Name
   * 
   * Objective: Verify that partial name search returns all matching users
   * 
   * Prerequisites: User Management Page loaded
   * 
   * Steps:
   * 1. Enter "Nguyen" in search box
   * 
   * Expected Result:
   * - Search returns all users with "Nguyen" in their name
   * - Multiple results are displayed
   * - User count reflects number of matches
   */
  it('TC-ADM-USR-005: Should search users by partial name', async () => {
    const searchQuery = 'Nguyen';
    const searchResult = mockUsers.filter(u => u.name.includes(searchQuery));
    
    mockGetUserList.mockResolvedValueOnce({
      users: mockUsers,
      total: mockUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Perform partial name search
    mockGetUserList.mockResolvedValueOnce({
      users: searchResult,
      total: searchResult.length,
    });

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, searchQuery);

    // Wait for the full text to be typed
    await waitFor(() => {
      expect(searchInput).toHaveValue(searchQuery);
    });

    // Verify API is called with search query (check last call since typing triggers on each keystroke)
    const calls = mockGetUserList.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toEqual({
      search: searchQuery,
      role: undefined,
      page: 1,
      limit: 10,
    });

    // Verify multiple results
    await waitFor(() => {
      expect(screen.getByTestId('user-count')).toHaveTextContent(`Total Users: ${searchResult.length}`);
    });

    // Verify results contain "Nguyen"
    expect(screen.getByTestId('user-name-user_001')).toHaveTextContent('Nguyen Van A');
    expect(screen.getByTestId('user-name-user_002')).toHaveTextContent('Nguyen Thi B');
  });

  /**
   * TC-ADM-USR-006: Verify Search - No Result
   * 
   * Objective: Verify that search with no matches displays "No users found"
   * 
   * Prerequisites: User Management Page loaded
   * 
   * Steps:
   * 1. Enter "XYZ123" (non-existent search term)
   * 
   * Expected Result:
   * - Search returns empty result set
   * - "No users found" message is displayed
   * - User table is not shown
   */
  it('TC-ADM-USR-006: Should display no users found message when search has no results', async () => {
    const searchQuery = 'XYZ123';
    
    mockGetUserList.mockResolvedValueOnce({
      users: mockUsers,
      total: mockUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Perform search with no results
    mockGetUserList.mockResolvedValueOnce({
      users: [],
      total: 0,
    });

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, searchQuery);

    // Wait for the full text to be typed
    await waitFor(() => {
      expect(searchInput).toHaveValue(searchQuery);
    });

    // Verify API is called (check last call since typing triggers on each keystroke)
    const calls = mockGetUserList.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toEqual({
      search: searchQuery,
      role: undefined,
      page: 1,
      limit: 10,
    });

    // Verify "No users found" message
    await waitFor(() => {
      expect(screen.getByTestId('no-users-message')).toBeInTheDocument();
      expect(screen.getByTestId('no-users-message')).toHaveTextContent('No users found');
    });

    // Verify user table is not shown
    expect(screen.queryByTestId('user-table')).not.toBeInTheDocument();

    // Verify user count shows 0
    expect(screen.getByTestId('user-count')).toHaveTextContent('Total Users: 0');
  });

  /**
   * TC-ADM-USR-007: Verify Pagination - Next Page
   * 
   * Objective: Verify that clicking "Next >" loads the next page of users
   * 
   * Prerequisites: User Management Page with multiple pages of data
   * 
   * Steps:
   * 1. Click "Next >" button
   * 
   * Expected Result:
   * - Current page increments
   * - Next set of users is loaded and displayed
   * - Page info updates (e.g., "Page 2 of 5")
   */
  it('TC-ADM-USR-007: Should load next page when clicking Next button', async () => {
    const allUsers = generateMockUsers(25); // 25 users for 3 pages (10 per page)
    const page1Users = allUsers.slice(0, 10);
    const page2Users = allUsers.slice(10, 20);
    
    mockGetUserList.mockResolvedValueOnce({
      users: page1Users,
      total: allUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Verify page 1 info
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');

    // Verify first user on page 1
    expect(screen.getByTestId('user-row-user_001')).toBeInTheDocument();

    // Click Next button
    mockGetUserList.mockResolvedValueOnce({
      users: page2Users,
      total: allUsers.length,
    });

    const nextButton = screen.getByTestId('next-page-button');
    await user.click(nextButton);

    // Verify API is called with page 2
    await waitFor(() => {
      expect(mockGetUserList).toHaveBeenCalledWith({
        search: '',
        role: undefined,
        page: 2,
        limit: 10,
      });
    });

    // Verify page info updates
    await waitFor(() => {
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');
    });

    // Verify page 2 users are displayed
    await waitFor(() => {
      expect(screen.getByTestId('user-row-user_011')).toBeInTheDocument();
    });
  });

  /**
   * TC-ADM-USR-008: Verify Pagination - Items per Page
   * 
   * Objective: Verify that changing items per page from 10 to 50 updates the display
   * 
   * Prerequisites: User Management Page loaded
   * 
   * Steps:
   * 1. Change items per page dropdown from 10 to 50
   * 
   * Expected Result:
   * - Page reloads with 50 items per page
   * - More users are displayed in single page
   * - Page count updates (fewer pages needed)
   */
  it('TC-ADM-USR-008: Should update display when changing items per page', async () => {
    const allUsers = generateMockUsers(60); // 60 users
    const first10Users = allUsers.slice(0, 10);
    const first50Users = allUsers.slice(0, 50);
    
    mockGetUserList.mockResolvedValueOnce({
      users: first10Users,
      total: allUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Verify initial state (10 items per page, 6 pages total)
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 6');

    // Change to 50 items per page
    mockGetUserList.mockResolvedValueOnce({
      users: first50Users,
      total: allUsers.length,
    });

    const itemsPerPageSelect = screen.getByTestId('items-per-page-select');
    await user.selectOptions(itemsPerPageSelect, '50');

    // Verify API is called with new limit
    await waitFor(() => {
      expect(mockGetUserList).toHaveBeenCalledWith({
        search: '',
        role: undefined,
        page: 1,
        limit: 50,
      });
    });

    // Verify page info updates (now 2 pages total)
    await waitFor(() => {
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2');
    });

    // Verify more users are displayed
    await waitFor(() => {
      expect(screen.getByTestId('user-row-user_050')).toBeInTheDocument();
    });
  });

  /**
   * TC-ADM-USR-009: Verify User Details View
   * 
   * Objective: Verify that clicking on User ID opens detailed view
   * 
   * Prerequisites: User Management Page with users displayed
   * 
   * Steps:
   * 1. Click on a User ID link in the table
   * 
   * Expected Result:
   * - User details page/modal is displayed
   * - All user information is shown (ID, name, email, role, status, created date, last login)
   * - Navigation callback is triggered
   */
  it('TC-ADM-USR-009: Should open user details view when clicking User ID', async () => {
    mockGetUserList.mockResolvedValueOnce({
      users: mockUsers,
      total: mockUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Click on user ID to view details
    const viewDetailsButton = screen.getByTestId('view-details-user_001');
    await user.click(viewDetailsButton);

    // Verify navigation callback was called
    expect(mockNavigateToUserDetails).toHaveBeenCalledWith('user_001');

    // Render user details page
    mockGetUserDetails.mockResolvedValue(mockUsers[0]);
    const { container } = render(<UserDetailsPage userId="user_001" />);

    // Wait for details to load
    await waitFor(() => {
      expect(mockGetUserDetails).toHaveBeenCalledWith('user_001');
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details-page')).toBeInTheDocument();
    });

    // Verify all details are displayed
    expect(screen.getByTestId('detail-user-id')).toHaveTextContent('user_001');
    expect(screen.getByTestId('detail-name')).toHaveTextContent('Nguyen Van A');
    expect(screen.getByTestId('detail-email')).toHaveTextContent('nguyen.a@example.com');
    expect(screen.getByTestId('detail-role')).toHaveTextContent('Traveler');
    expect(screen.getByTestId('detail-status')).toHaveTextContent('active');
  });

  /**
   * TC-ADM-USR-010: Verify Ban User
   * 
   * Objective: Verify that admin can ban/deactivate a user
   * 
   * Prerequisites: User Management Page with active users
   * 
   * Steps:
   * 1. Click "Ban" / "Deactivate" button for an active user
   * 
   * Expected Result:
   * - Ban user API is called
   * - User list is refreshed
   * - User status changes to "banned"
   * - Button changes from "Ban" to "Unban"
   */
  it('TC-ADM-USR-010: Should ban user when clicking Ban button', async () => {
    const initialUsers = mockUsers;
    const updatedUsers = mockUsers.map(u => 
      u.id === 'user_001' ? { ...u, status: 'banned' } : u
    );

    mockGetUserList.mockResolvedValueOnce({
      users: initialUsers,
      total: initialUsers.length,
    });

    const user = userEvent.setup();
    render(<UserManagementPage currentUserRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
    });

    // Verify initial state - Ban button is present
    const banButton = screen.getByTestId('ban-button-user_001');
    expect(banButton).toBeInTheDocument();
    expect(banButton).toHaveTextContent('Ban');

    // Click Ban button
    mockBanUser.mockResolvedValue({ success: true });
    mockGetUserList.mockResolvedValueOnce({
      users: updatedUsers,
      total: updatedUsers.length,
    });

    await user.click(banButton);

    // Verify ban API was called
    await waitFor(() => {
      expect(mockBanUser).toHaveBeenCalledWith('user_001');
    });

    // Verify user list is reloaded
    await waitFor(() => {
      expect(mockGetUserList).toHaveBeenCalledTimes(2);
    });

    // Verify user status changed to banned
    await waitFor(() => {
      expect(screen.getByTestId('user-status-user_001')).toHaveTextContent('BANNED');
    });

    // Verify button changed to Unban
    await waitFor(() => {
      expect(screen.getByTestId('unban-button-user_001')).toBeInTheDocument();
      expect(screen.getByTestId('unban-button-user_001')).toHaveTextContent('Unban');
    });
  });
});

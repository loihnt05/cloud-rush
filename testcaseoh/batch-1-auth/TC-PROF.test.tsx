/**
 * Test Suite: TC-PROF - User Profile Management (Cập nhật thông tin)
 * 
 * Sub-Category: User Profile Management
 * Description: Mở rộng BR49: Người dùng tự quản lý thông tin cá nhân.
 * 
 * Business Requirements Coverage:
 * - BR49: User self-service profile management
 * - Profile viewing and editing capabilities
 * - Avatar upload with validation (file type, size)
 * - Phone number format validation
 * - Email field protection (non-editable)
 * - Account deletion with confirmation
 * 
 * Test Cases:
 * - TC-PROF-001: Verify View Profile
 * - TC-PROF-002: Verify Edit Name - Success
 * - TC-PROF-003: Verify Edit Name - Empty
 * - TC-PROF-004: Verify Change Avatar - Valid Img
 * - TC-PROF-005: Verify Change Avatar - Large File
 * - TC-PROF-006: Verify Change Avatar - Invalid Type
 * - TC-PROF-007: Verify Change Phone - Format
 * - TC-PROF-008: Verify Change Email (Restricted)
 * - TC-PROF-009: Verify Delete Account - Prompt
 * - TC-PROF-010: Verify Delete Account - Success
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ==================== MOCK API FUNCTIONS ====================

const mockGetUserProfile = vi.fn();
const mockUpdateProfile = vi.fn();
const mockUploadAvatar = vi.fn();
const mockDeleteAccount = vi.fn();
const mockNavigate = vi.fn();

// ==================== CONSTANTS ====================

const MAX_AVATAR_SIZE_MB = 10;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// ==================== MOCK DATA ====================

const mockUserProfile = {
  id: 'user_001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  avatar: 'https://example.com/avatar.jpg',
  role: 'Traveler',
  createdAt: '2024-01-01T00:00:00Z',
};

// ==================== MOCK COMPONENTS ====================

/**
 * Avatar Menu Component
 * - User avatar dropdown in header
 * - Navigation to profile page
 */
interface AvatarMenuProps {
  user: typeof mockUserProfile;
  onProfileClick: () => void;
}

const AvatarMenu: React.FC<AvatarMenuProps> = ({ user, onProfileClick }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div data-testid="avatar-menu">
      <button
        data-testid="avatar-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <img
          src={user.avatar}
          alt={user.name}
          data-testid="avatar-image"
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        />
      </button>
      {isOpen && (
        <div data-testid="avatar-dropdown">
          <button
            data-testid="profile-menu-item"
            onClick={() => {
              setIsOpen(false);
              onProfileClick();
            }}
          >
            Profile
          </button>
          <div data-testid="user-info">
            <div>{user.name}</div>
            <div>{user.email}</div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Profile Page Component
 * - View and edit user profile information
 * - Avatar upload with validation
 * - Phone number validation
 * - Email field is read-only (restricted)
 * - Account deletion with confirmation
 */
interface ProfilePageProps {
  userId: string;
  onDeleteAccount?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onDeleteAccount }) => {
  const [profile, setProfile] = React.useState<typeof mockUserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await mockGetUserProfile(userId);
        setProfile(data);
        setFormData({
          name: data.name,
          phone: data.phone || '',
        });
      } catch (err) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const validatePhone = (phone: string): boolean => {
    // Phone must contain only numbers, spaces, dashes, and optional + prefix
    const phoneRegex = /^[\+]?[\d\s\-]+$/;
    if (phone && !phoneRegex.test(phone)) {
      setErrors(prev => ({ ...prev, phone: 'Invalid phone number format. Use only numbers, spaces, and dashes.' }));
      return false;
    }
    return true;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors(prev => ({ ...prev, avatar: '' }));

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        avatar: 'Invalid file type. Please upload JPG, PNG, GIF, or WEBP image.' 
      }));
      return;
    }

    // Check file size
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setErrors(prev => ({ 
        ...prev, 
        avatar: `File is too large. Maximum size is ${MAX_AVATAR_SIZE_MB}MB.` 
      }));
      return;
    }

    setUploadingAvatar(true);
    try {
      const avatarUrl = await mockUploadAvatar(file);
      setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, avatar: err.message || 'Failed to upload avatar' }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setErrors({});

    // Validate name
    if (!formData.name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }));
      return;
    }

    // Validate phone
    if (!validatePhone(formData.phone)) {
      return;
    }

    setSaveLoading(true);
    try {
      const updated = await mockUpdateProfile(userId, formData);
      setProfile(updated);
      setEditing(false);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, general: err.message || 'Failed to update profile' }));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await mockDeleteAccount(userId);
      if (onDeleteAccount) {
        onDeleteAccount();
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, general: 'Failed to delete account' }));
    }
  };

  if (loading) {
    return <div data-testid="profile-loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div data-testid="profile-error">Failed to load profile</div>;
  }

  return (
    <div data-testid="profile-page">
      <h1>My Profile</h1>

      {/* Avatar Section */}
      <div data-testid="avatar-section">
        <img
          src={profile.avatar}
          alt="User avatar"
          data-testid="profile-avatar"
          style={{ width: '120px', height: '120px', borderRadius: '50%' }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          data-testid="avatar-upload-input"
          disabled={uploadingAvatar}
        />
        {uploadingAvatar && <div data-testid="avatar-uploading">Uploading...</div>}
        {errors.avatar && <div data-testid="avatar-error">{errors.avatar}</div>}
      </div>

      {/* Profile Form */}
      <div data-testid="profile-form">
        {/* Name Field */}
        <div data-testid="name-field">
          <label htmlFor="name">Name:</label>
          {editing ? (
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              data-testid="name-input"
            />
          ) : (
            <div data-testid="name-display">{profile.name}</div>
          )}
          {errors.name && <div data-testid="name-error">{errors.name}</div>}
        </div>

        {/* Email Field (Read-only) */}
        <div data-testid="email-field">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={profile.email}
            data-testid="email-input"
            disabled
            readOnly
            title="Email cannot be changed"
          />
          <div data-testid="email-restriction-note">
            Email cannot be changed for security reasons
          </div>
        </div>

        {/* Phone Field */}
        <div data-testid="phone-field">
          <label htmlFor="phone">Phone:</label>
          {editing ? (
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              data-testid="phone-input"
            />
          ) : (
            <div data-testid="phone-display">{profile.phone || 'Not provided'}</div>
          )}
          {errors.phone && <div data-testid="phone-error">{errors.phone}</div>}
        </div>

        {/* Action Buttons */}
        {editing ? (
          <div data-testid="edit-actions">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              data-testid="save-button"
            >
              {saveLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({ name: profile.name, phone: profile.phone || '' });
                setErrors({});
              }}
              data-testid="cancel-button"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            data-testid="edit-button"
          >
            Edit Profile
          </button>
        )}

        {errors.general && <div data-testid="general-error">{errors.general}</div>}
      </div>

      {/* Delete Account Section */}
      <div data-testid="danger-zone">
        <h2>Danger Zone</h2>
        <button
          onClick={() => setShowDeleteDialog(true)}
          data-testid="delete-account-button"
          style={{ backgroundColor: 'red', color: 'white' }}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DeleteAccountDialog
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
};

/**
 * Delete Account Confirmation Dialog
 * - Shows warning about account deletion
 * - Requires explicit confirmation
 */
interface DeleteAccountDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ onConfirm, onCancel }) => {
  return (
    <div data-testid="delete-account-dialog" role="dialog">
      <h2>Delete Account</h2>
      <p data-testid="delete-warning">
        Are you sure you want to delete your account? This action cannot be undone.
        All your data will be permanently removed.
      </p>
      <div data-testid="dialog-actions">
        <button
          onClick={onConfirm}
          data-testid="confirm-delete-button"
          style={{ backgroundColor: 'red', color: 'white' }}
        >
          Yes, Delete My Account
        </button>
        <button
          onClick={onCancel}
          data-testid="cancel-delete-button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-PROF: User Profile Management (Cập nhật thông tin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
  });

  /**
   * TC-PROF-001: Verify View Profile
   * 
   * Objective: Verify that user can navigate to profile page from avatar menu
   * 
   * Prerequisites: User is logged in
   * 
   * Steps:
   * 1. Click on avatar in header
   * 2. Click "Profile" menu item
   * 
   * Expected Result:
   * - Avatar menu opens with user info
   * - Profile page is displayed with user data
   */
  it('TC-PROF-001: Should navigate to profile page when clicking avatar menu', async () => {
    const user = userEvent.setup();
    const handleProfileClick = vi.fn();

    render(<AvatarMenu user={mockUserProfile} onProfileClick={handleProfileClick} />);

    // Click avatar button
    const avatarButton = screen.getByTestId('avatar-button');
    await user.click(avatarButton);

    // Verify dropdown opens
    expect(screen.getByTestId('avatar-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('user-info')).toHaveTextContent(mockUserProfile.name);
    expect(screen.getByTestId('user-info')).toHaveTextContent(mockUserProfile.email);

    // Click Profile menu item
    const profileMenuItem = screen.getByTestId('profile-menu-item');
    await user.click(profileMenuItem);

    // Verify navigation callback is called
    expect(handleProfileClick).toHaveBeenCalled();

    // Render profile page
    render(<ProfilePage userId={mockUserProfile.id} />);

    // Wait for profile to load
    await waitFor(() => {
      expect(mockGetUserProfile).toHaveBeenCalledWith(mockUserProfile.id);
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Verify profile data is displayed
    expect(screen.getByTestId('name-display')).toHaveTextContent(mockUserProfile.name);
    expect(screen.getByTestId('email-input')).toHaveValue(mockUserProfile.email);
    expect(screen.getByTestId('phone-display')).toHaveTextContent(mockUserProfile.phone);
  });

  /**
   * TC-PROF-002: Verify Edit Name - Success
   * 
   * Objective: Verify that user can successfully change their name
   * 
   * Prerequisites: Profile Page
   * 
   * Steps:
   * 1. Click "Edit Profile" button
   * 2. Change name field
   * 3. Click "Save"
   * 
   * Expected Result:
   * - Edit mode is activated
   * - Name is updated successfully
   * - New name is displayed
   */
  it('TC-PROF-002: Should successfully update name', async () => {
    const user = userEvent.setup();
    const newName = 'Jane Smith';
    mockUpdateProfile.mockResolvedValue({ ...mockUserProfile, name: newName });

    render(<ProfilePage userId={mockUserProfile.id} />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Click Edit button
    const editButton = screen.getByTestId('edit-button');
    await user.click(editButton);

    // Verify edit mode
    expect(screen.getByTestId('name-input')).toBeInTheDocument();

    // Change name
    const nameInput = screen.getByTestId('name-input');
    await user.clear(nameInput);
    await user.type(nameInput, newName);

    // Click Save
    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    // Verify update API call
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUserProfile.id, {
        name: newName,
        phone: mockUserProfile.phone,
      });
    });

    // Verify name is updated
    await waitFor(() => {
      expect(screen.getByTestId('name-display')).toHaveTextContent(newName);
    });
  });

  /**
   * TC-PROF-003: Verify Edit Name - Empty
   * 
   * Objective: Verify that empty name shows validation error
   * 
   * Prerequisites: Profile Page in edit mode
   * 
   * Steps:
   * 1. Click "Edit Profile"
   * 2. Clear name field
   * 3. Click "Save"
   * 
   * Expected Result:
   * - Validation error displayed: "Name is required"
   * - Profile is NOT updated
   */
  it('TC-PROF-003: Should show validation error when name is empty', async () => {
    const user = userEvent.setup();

    render(<ProfilePage userId={mockUserProfile.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Click Edit button
    await user.click(screen.getByTestId('edit-button'));

    // Clear name
    const nameInput = screen.getByTestId('name-input');
    await user.clear(nameInput);

    // Try to save
    await user.click(screen.getByTestId('save-button'));

    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toHaveTextContent(/name is required/i);
    });

    // Verify update was NOT called
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  /**
   * TC-PROF-004: Verify Change Avatar - Valid Img
   * 
   * Objective: Verify that valid image upload succeeds
   * 
   * Prerequisites: Profile Page
   * 
   * Steps:
   * 1. Select a JPG file < 2MB
   * 2. Upload file
   * 
   * Expected Result:
   * - File validation passes
   * - Avatar is uploaded successfully
   * - New avatar is displayed
   */
  it('TC-PROF-004: Should successfully upload valid image avatar', async () => {
    const newAvatarUrl = 'https://example.com/new-avatar.jpg';
    mockUploadAvatar.mockResolvedValue(newAvatarUrl);

    render(<ProfilePage userId={mockUserProfile.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Create a valid image file (1MB JPG)
    const file = new File(['a'.repeat(1024 * 1024)], 'avatar.jpg', { type: 'image/jpeg' });

    const fileInput = screen.getByTestId('avatar-upload-input');
    await userEvent.upload(fileInput, file);

    // Verify upload was called
    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalledWith(file);
    });

    // Verify new avatar is displayed
    await waitFor(() => {
      const avatarImg = screen.getByTestId('profile-avatar');
      expect(avatarImg).toHaveAttribute('src', newAvatarUrl);
    });
  });

  /**
   * TC-PROF-005: Verify Change Avatar - Large File
   * 
   * Objective: Verify that file > 10MB is rejected
   * 
   * Prerequisites: Profile Page
   * 
   * Steps:
   * 1. Select an image file > 10MB
   * 2. Try to upload
   * 
   * Expected Result:
   * - File size validation fails
   * - Error message: "File is too large. Maximum size is 10MB."
   * - Upload is NOT performed
   */
  it('TC-PROF-005: Should reject avatar file larger than 10MB', async () => {
    render(<ProfilePage userId={mockUserProfile.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Create a file larger than 10MB (11MB)
    const largeFile = new File(
      ['a'.repeat(11 * 1024 * 1024)],
      'large-avatar.jpg',
      { type: 'image/jpeg' }
    );

    const fileInput = screen.getByTestId('avatar-upload-input');
    await userEvent.upload(fileInput, largeFile);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('avatar-error')).toHaveTextContent(/file is too large/i);
      expect(screen.getByTestId('avatar-error')).toHaveTextContent(/maximum size is 10mb/i);
    });

    // Verify upload was NOT called
    expect(mockUploadAvatar).not.toHaveBeenCalled();
  });

  /**
   * TC-PROF-006: Verify Change Avatar - Invalid Type
   * 
   * Objective: Verify that non-image files (.TXT, .EXE) are rejected
   * 
   * Prerequisites: Profile Page
   * 
   * Steps:
   * 1. Select a .TXT or .EXE file
   * 2. Try to upload
   * 
   * Expected Result:
   * - File type validation fails
   * - Error message: "Invalid file type. Please upload JPG, PNG, GIF, or WEBP image."
   * - Upload is NOT performed
   */
  it('TC-PROF-006: Should reject non-image file types', async () => {
    render(<ProfilePage userId={mockUserProfile.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Test with .txt file (non-image)
    const textFile = new File(['some text'], 'document.txt', { type: 'text/plain' });

    const fileInput = screen.getByTestId('avatar-upload-input') as HTMLInputElement;
    
    // Use fireEvent to bypass browser accept attribute
    Object.defineProperty(fileInput, 'files', {
      value: [textFile],
      writable: false,
    });
    fireEvent.change(fileInput);

    // Verify error message for invalid file type
    await waitFor(() => {
      expect(screen.getByTestId('avatar-error')).toHaveTextContent(/invalid file type/i);
      expect(screen.getByTestId('avatar-error')).toHaveTextContent(/upload jpg, png, gif, or webp/i);
    });

    // Verify upload API was not called
    expect(mockUploadAvatar).not.toHaveBeenCalled();
  });

  /**
   * TC-PROF-007: Verify Change Phone - Format
   * 
   * Objective: Verify that invalid phone format shows validation error
   * 
   * Prerequisites: Profile Page in edit mode
   * 
   * Steps:
   * 1. Click "Edit Profile"
   * 2. Enter "abc" in phone field
   * 3. Click "Save"
   * 
   * Expected Result:
   * - Phone validation fails
   * - Error message: "Invalid phone number format"
   * - Profile is NOT updated
   */
  it('TC-PROF-007: Should show validation error for invalid phone format', async () => {
    const user = userEvent.setup();

    render(<ProfilePage userId={mockUserProfile.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Click Edit
    await user.click(screen.getByTestId('edit-button'));

    // Enter invalid phone
    const phoneInput = screen.getByTestId('phone-input');
    await user.clear(phoneInput);
    await user.type(phoneInput, 'abc');

    // Try to save
    await user.click(screen.getByTestId('save-button'));

    // Verify error message
    await waitFor(() => {
      expect(screen.getByTestId('phone-error')).toHaveTextContent(/invalid phone number format/i);
    });

    // Verify update was NOT called
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  /**
   * TC-PROF-008: Verify Change Email (Restricted)
   * 
   * Objective: Verify that email field is disabled and cannot be edited
   * 
   * Prerequisites: Profile Page
   * 
   * Steps:
   * 1. Navigate to profile page
   * 2. Try to edit email field
   * 
   * Expected Result:
   * - Email input is disabled
   * - Email input is read-only
   * - Restriction note is displayed
   */
  it('TC-PROF-008: Should prevent email editing (field is disabled)', async () => {
    render(<ProfilePage userId={mockUserProfile.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;

    // Verify email field is disabled and read-only
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveAttribute('readonly');

    // Verify restriction note is displayed
    expect(screen.getByTestId('email-restriction-note')).toHaveTextContent(
      /email cannot be changed for security reasons/i
    );

    // Verify email value is displayed but cannot be changed
    expect(emailInput.value).toBe(mockUserProfile.email);
  });

  /**
   * TC-PROF-009: Verify Delete Account - Prompt
   * 
   * Objective: Verify that delete account button shows confirmation dialog
   * 
   * Prerequisites: Profile Page
   * 
   * Steps:
   * 1. Scroll to "Danger Zone"
   * 2. Click "Delete Account" button
   * 
   * Expected Result:
   * - Confirmation dialog is displayed
   * - Warning message about permanent deletion is shown
   * - "Yes, Delete My Account" and "Cancel" buttons are available
   */
  it('TC-PROF-009: Should show confirmation dialog when clicking delete account', async () => {
    const user = userEvent.setup();

    render(<ProfilePage userId={mockUserProfile.id} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Click Delete Account button
    const deleteButton = screen.getByTestId('delete-account-button');
    await user.click(deleteButton);

    // Verify dialog is shown
    await waitFor(() => {
      expect(screen.getByTestId('delete-account-dialog')).toBeInTheDocument();
    });

    // Verify warning message
    expect(screen.getByTestId('delete-warning')).toHaveTextContent(/cannot be undone/i);
    expect(screen.getByTestId('delete-warning')).toHaveTextContent(/permanently removed/i);

    // Verify action buttons
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-delete-button')).toBeInTheDocument();
  });

  /**
   * TC-PROF-010: Verify Delete Account - Success
   * 
   * Objective: Verify that confirming account deletion deletes the account
   * 
   * Prerequisites: Profile Page with delete dialog open
   * 
   * Steps:
   * 1. Click "Delete Account" button
   * 2. Click "Yes, Delete My Account" in dialog
   * 
   * Expected Result:
   * - Delete account API is called
   * - Account is deleted successfully
   * - User is logged out / redirected
   */
  it('TC-PROF-010: Should delete account when confirming deletion', async () => {
    const user = userEvent.setup();
    const handleDeleteCallback = vi.fn();
    mockDeleteAccount.mockResolvedValue({ success: true });

    render(<ProfilePage userId={mockUserProfile.id} onDeleteAccount={handleDeleteCallback} />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    // Click Delete Account button
    await user.click(screen.getByTestId('delete-account-button'));

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByTestId('delete-account-dialog')).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByTestId('confirm-delete-button');
    await user.click(confirmButton);

    // Verify delete API was called
    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledWith(mockUserProfile.id);
    });

    // Verify callback was called (e.g., redirect to login)
    expect(handleDeleteCallback).toHaveBeenCalled();
  });
});

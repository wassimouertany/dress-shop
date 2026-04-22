import { User } from '../src/models';
import { updateUserProfile } from '../src/services/userService';
import { Role } from '../src/types';

jest.mock('../src/models', () => ({
  User: {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  }
}));

describe('UserService - Liskov Substitution Principle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully pass subclass-specific fields to the update payload (Testing LSP Substitutability)', async () => {
    // 1. Mock the user returned by findById to simulate a subclass that IS NOT a Client,
    // but still has its own fields like fullName and numTel.
    const mockUser = {
      id: '123',
      role: 'TEST_DRIVER', // Subclass role that is not Role.Client
      fullName: 'Old Name',
      numTel: '0000',
    };

    (User.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser)
    });

    (User.findOneAndUpdate as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockUser,
        fullName: 'New Name',
        numTel: '1111',
      })
    });

    // 2. Attempt to update it using the base service method
    await updateUserProfile(
      '123',
      {
        username: 'testdriver_updated',
        email: 'driver@test.com',
        fullName: 'New Name',
        numTel: '1111'
      },
      'TEST_DRIVER' as Role
    );

    // 3. Verify that the properties were correctly passed to the update function.
    // In the PRE-FIX version, this will FAIL because the service explicitly checks 
    // `if (user.role === Role.Client)` before adding fullName/numTel to the payload.
    // In the POST-FIX version, this will PASS because the service respects LSP and 
    // passes all properties, letting the subclass's schema handle validation.
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '123' },
      expect.objectContaining({
        fullName: 'New Name',
        numTel: '1111'
      }),
      expect.any(Object)
    );
  });
});

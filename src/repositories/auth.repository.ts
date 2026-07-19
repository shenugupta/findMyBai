import User, { UserDocument } from "../models/user.model";


export class AuthRepository {
  /**
   * Create User
   */


  /**
   * Find User By Email
   */

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email }).select("+password");
  }
  
  async createUser(data: Partial<UserDocument>): Promise<UserDocument> {
    const user = new User(data);
    return user.save();
  }
  /**
   * Find User By Phone
   */
  async findByPhone(phone: string): Promise<UserDocument | null> {
    return await User.findOne({ phone }).select("+password");
  }

  /**
   * Find User By Id
   */

  /**
   * Check if Email Exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await User.exists({ email });
    return !!user;
  }

  /**
   * Check if Phone Exists
   */
  async phoneExists(phone: string): Promise<boolean> {
    const user = await User.exists({ phone });
    return !!user;
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId);
  }

  /**
   * Update Verification Status
   */
  async verifyUser(userId: string): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );
  }

  /**
   * Update Password
   */
  async updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );
  }

  /**
   * Update Last Login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  }
}
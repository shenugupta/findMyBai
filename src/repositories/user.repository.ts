import User from "../models/user.model";


export class UserRepository {
  getUsers() {
    return User.find().select("-password -refreshTokens");
  }

  getUserById(id: string) {
    return User.findById(id).select("-password -refreshTokens");
  }

  async updateUser(id: string, data: any) {
    console.log("Repository ID:", id);
    console.log("Repository Data:", data);

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new Error("Invalid User ID");
      }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password -refreshTokens");

    console.log("Updated User:", updatedUser);

    return updatedUser;
  }

  deleteUser(id: string) {
    return User.findByIdAndDelete(id);
  }

  updateStatus(id: string, isActive: boolean) {
    return User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password -refreshTokens");
  }
}
import User from "../models/user.model";

import { connect } from "../mongodb/mongoose";

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
) => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await connect();
    console.log("MongoDB connected, creating/updating user...");
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          profilePicture: image_url,
          email: email_addresses[0].email_address,
        },
      },
      { upsert: true, new: true },
    );
    console.log("User created/updated successfully:", user);
    return user;
  } catch (error) {
    console.log("Error: Could not create or update user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    console.log("Attempting to delete user:", id);
    await connect();
    await User.findOneAndDelete({ clerkId: id });
    console.log("User deleted:", result);
  } catch (error) {
    console.log("Error: Could not delete user:", error);
    throw error;
  }
};

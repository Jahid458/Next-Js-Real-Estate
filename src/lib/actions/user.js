import { connect } from '@/mongodb/mongoose';
import User from '@/models/user.model';

export const createOrUpdateUser = async (id, firstName, lastName, profilePicture, emails) => {
  try {
    await connect();
    const email = emails[0]?.emailAddress || '';
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: { firstName, lastName, profilePicture, email },
      },
      { upsert: true, new: true }
    );
    console.log('User saved/updated:', user);
    return user;
  } catch (error) {
    console.log('Error creating/updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();
    await User.findOneAndDelete({ clerkId: id });
    console.log('User deleted:', id);
  } catch (error) {
    console.log('Error deleting user:', error);
    throw error;
  }
};

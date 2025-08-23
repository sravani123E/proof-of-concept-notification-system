import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true },
    displayName: { type: String, required: true },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);


import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, 'cannot be blank'],
      match: [/\S+@\S+.\S+/, 'is valid'],
      index: true,
    },
    hashedPassword: {
      type: String,
      required: [true, 'cannot be blank'],
    },
  },
  { timestamps: true },
);

AdminSchema.methods.setPassword = async function (password) {
  const saltRounds = 10;
  this.hashedPassword = await bcrypt.hash(password, saltRounds);
};

AdminSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.hashedPassword);
};

export const Admin = mongoose.model('Admin', AdminSchema);

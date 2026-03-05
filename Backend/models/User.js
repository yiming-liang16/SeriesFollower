import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: 3 },

  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true },

  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },

  name: { type: String },
  avatarUrl: { type: String, default: '' },
  bio: { type: String },

  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('validate', function () {
    if (this.authProvider === 'local' && !this.password) {
        this.invalidate('password', 'Password is required');
    }
});

const User = mongoose.model('User', userSchema);
export default User;
   
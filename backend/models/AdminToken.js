import mongoose from 'mongoose';

const adminTokenSchema = new mongoose.Schema({
  email: String,
  token: String,
  expiresAt: Date,
});

export default mongoose.model('AdminToken', adminTokenSchema);

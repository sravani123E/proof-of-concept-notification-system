import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['like', 'follow', 'comment'], required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);


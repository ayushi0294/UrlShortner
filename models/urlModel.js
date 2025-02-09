import { Schema, model } from 'mongoose';

const urlSchema = new Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, unique: true },
    clicks: { type: Number, default: 0 },
    expirationDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

export default model('URL', urlSchema);

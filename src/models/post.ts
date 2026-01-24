import mongoose, { Schema } from 'mongoose';

const postSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String },
    userName: { type: String, required: true },
});

export default mongoose.model('Posts', postSchema);

import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        duration: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, required: true, trim: true },
        available: { type: Boolean, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                return ret;
            },
        },
    }
);

export default mongoose.model("Service", serviceSchema);
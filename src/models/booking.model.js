import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        clientName: { type: String, required: true, trim: true },
        clientEmail: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
        services: [
            {
                _id: false,
                service: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Service",
                    required: true,
                },
                quantity: { type: Number, default: 1, min: 1 },
            },
        ],
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

export default mongoose.model("Booking", bookingSchema);

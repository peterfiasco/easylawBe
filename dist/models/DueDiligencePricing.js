const mongoose = require('mongoose');
const dueDiligencePricingSchema = new mongoose.Schema({
    investigation_type: {
        type: String,
        required: true,
        enum: ['individual', 'company', 'asset', 'comprehensive']
    },
    priority: {
        type: String,
        required: true,
        enum: ['standard', 'express', 'urgent']
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    features: [{
            type: String
        }],
    is_active: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
// Compound index to ensure unique pricing per investigation_type + priority
dueDiligencePricingSchema.index({ investigation_type: 1, priority: 1 }, { unique: true });
module.exports = mongoose.model('DueDiligencePricing', dueDiligencePricingSchema);

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const BusinessServicePricing_1 = __importDefault(require("../models/BusinessServicePricing"));
const User_1 = __importDefault(require("../models/User"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const seedPricingData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if MONGODB_CONNECTION_LINK exists (use your actual env variable name)
        const mongoUrl = process.env.MONGODB_CONNECTION_LINK || process.env.DATABASE_URL;
        if (!mongoUrl) {
            throw new Error('MONGODB_CONNECTION_LINK environment variable is not set');
        }
        console.log('🔌 Connecting to database...');
        // Connect to database
        yield mongoose_1.default.connect(mongoUrl);
        console.log('✅ Connected to database successfully');
        // Find an admin user for created_by field
        console.log('👤 Looking for admin user...');
        const adminUser = yield User_1.default.findOne({ role: 'admin' });
        if (!adminUser) {
            throw new Error('No admin user found. Please create an admin user first.');
        }
        console.log(`✅ Found admin user: ${adminUser.email}`);
        // Default pricing data
        const pricingData = [
            // Incorporation
            { service_type: 'incorporation', priority: 'standard', price: 50000, duration: '14-21 business days', description: 'Standard processing for business incorporation' },
            { service_type: 'incorporation', priority: 'express', price: 85000, duration: '7-10 business days', description: 'Express processing for business incorporation' },
            { service_type: 'incorporation', priority: 'urgent', price: 150000, duration: '3-5 business days', description: 'Urgent processing for business incorporation' },
            // Annual Returns
            { service_type: 'annual_returns', priority: 'standard', price: 15000, duration: '5-7 business days', description: 'Standard annual returns filing' },
            { service_type: 'annual_returns', priority: 'express', price: 25000, duration: '2-3 business days', description: 'Express annual returns filing' },
            { service_type: 'annual_returns', priority: 'urgent', price: 35000, duration: '1-2 business days', description: 'Urgent annual returns filing' },
            // Name Change
            { service_type: 'name_change', priority: 'standard', price: 30000, duration: '10-14 business days', description: 'Standard business name change' },
            { service_type: 'name_change', priority: 'express', price: 50000, duration: '5-7 business days', description: 'Express business name change' },
            { service_type: 'name_change', priority: 'urgent', price: 75000, duration: '2-3 business days', description: 'Urgent business name change' },
            // Address Change
            { service_type: 'address_change', priority: 'standard', price: 25000, duration: '7-10 business days', description: 'Standard address change' },
            { service_type: 'address_change', priority: 'express', price: 40000, duration: '3-5 business days', description: 'Express address change' },
            { service_type: 'address_change', priority: 'urgent', price: 60000, duration: '1-2 business days', description: 'Urgent address change' },
            // Capital Increase
            { service_type: 'increase_capital', priority: 'standard', price: 40000, duration: '14-21 business days', description: 'Standard capital increase' },
            { service_type: 'increase_capital', priority: 'express', price: 65000, duration: '7-10 business days', description: 'Express capital increase' },
            { service_type: 'increase_capital', priority: 'urgent', price: 95000, duration: '3-5 business days', description: 'Urgent capital increase' }
        ];
        console.log('🗑️ Clearing existing pricing data...');
        // Clear existing pricing data
        const deletedCount = yield BusinessServicePricing_1.default.deleteMany({});
        console.log(`✅ Deleted ${deletedCount.deletedCount} existing pricing records`);
        console.log('💾 Inserting new pricing data...');
        // Insert new pricing data
        const pricingDocuments = pricingData.map(data => (Object.assign(Object.assign({}, data), { created_by: adminUser._id, is_active: true })));
        const insertedDocs = yield BusinessServicePricing_1.default.insertMany(pricingDocuments);
        console.log(`✅ Inserted ${insertedDocs.length} pricing records`);
        console.log('✅ Business service pricing seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding pricing data:', error);
        process.exit(1);
    }
});
seedPricingData();

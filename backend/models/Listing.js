const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    default: 0
  },
  location: {
    address: {
      type: String,
      required: true
    },
    district: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    nearbyUniversities: [{
      name: String,
      distance: Number // in km
    }]
  },
  roomDetails: {
    area: Number, // m2
    capacity: Number,
    bedrooms: Number,
    bathrooms: Number,
    floor: Number,
    roomType: {
      type: String,
      enum: ['single', 'shared', 'apartment', 'house']
    }
  },
  amenities: [{
    type: String
  }],
  utilities: {
    electricity: {
      included: Boolean,
      price: Number
    },
    water: {
      included: Boolean,
      price: Number
    },
    internet: {
      included: Boolean,
      price: Number
    },
    parking: {
      available: Boolean,
      price: Number
    }
  },
  images: [{
    type: String
  }],
  videos: [{
    type: String
  }],
  rules: {
    type: String
  },
  availableFrom: {
    type: Date
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'hidden', 'pending'],
    default: 'available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  viewsHistory: [{
    date: Date,
    count: Number
  }],
  saves: {
    type: Number,
    default: 0
  },
  searchKeywords: [{
    keyword: String,
    count: Number
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better search performance
listingSchema.index({ 'location.coordinates': '2dsphere' });
listingSchema.index({ price: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', listingSchema);


const express = require('express');
const router = express.Router();
const MapData = require('../models/MapData');
const Listing = require('../models/Listing');
const { auth } = require('../middleware/auth');

// Get map data for an area
router.get('/area-data', async (req, res) => {
  try {
    const { bounds, dataType } = req.query;
    
    // bounds format: [swLng, swLat, neLng, neLat]
    const query = {};
    
    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);
      
      query.coordinates = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }

    const mapData = await MapData.find(query);

    res.json({ mapData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get listings with coordinates for map display
router.get('/listings', async (req, res) => {
  try {
    const { bounds, minPrice, maxPrice, roomType } = req.query;
    const query = { status: 'available' };

    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(Number);
      
      query['location.coordinates'] = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (roomType) {
      query['roomDetails.roomType'] = roomType;
    }

    const listings = await Listing.find(query)
      .select('title price location images roomDetails rating')
      .limit(500);

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update map data (community contribution)
router.post('/update-area', auth, async (req, res) => {
  try {
    const { area, coordinates, data } = req.body;

    let mapData = await MapData.findOne({ area });

    if (mapData) {
      // Update existing data
      Object.assign(mapData.data, data);
      mapData.contributors.push({
        user: req.userId,
        date: new Date()
      });
    } else {
      // Create new area data
      mapData = new MapData({
        area,
        coordinates,
        data,
        contributors: [{
          user: req.userId,
          date: new Date()
        }]
      });
    }

    await mapData.save();

    res.json({ message: 'Map data updated successfully', mapData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get heatmap data by type
router.get('/heatmap/:type', async (req, res) => {
  try {
    const { type } = req.params; // price, security, amenities, flood
    const { bounds } = req.query;

    let data;

    switch(type) {
      case 'price':
        // Get average prices by area
        const priceData = await MapData.find({})
          .select('area coordinates data.averagePrice data.priceLevel');
        data = priceData;
        break;

      case 'security':
        const securityData = await MapData.find({})
          .select('area coordinates data.security');
        data = securityData;
        break;

      case 'amenities':
        const amenitiesData = await MapData.find({})
          .select('area coordinates data.studentAmenities');
        data = amenitiesData;
        break;

      case 'flood':
        const floodData = await MapData.find({})
          .select('area coordinates data.floodRisk');
        data = floodData;
        break;

      default:
        return res.status(400).json({ error: 'Invalid heatmap type' });
    }

    res.json({ type, data });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { auth, isLandlord } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      roomType,
      city,
      district,
      university,
      status = 'available',
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const query = { status };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Room type
    if (roomType) {
      query['roomDetails.roomType'] = roomType;
    }

    // Location
    if (city) query['location.city'] = city;
    if (district) query['location.district'] = district;

    // Nearby university
    if (university) {
      query['location.nearbyUniversities.name'] = { $regex: university, $options: 'i' };
    }

    const listings = await Listing.find(query)
      .populate('landlord', 'name avatar verifiedBadge')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landlord', 'name email phone avatar verifiedBadge');
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment views
    listing.views += 1;
    
    // Update views history
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const viewToday = listing.viewsHistory.find(v => 
      v.date.getTime() === today.getTime()
    );
    
    if (viewToday) {
      viewToday.count += 1;
    } else {
      listing.viewsHistory.push({ date: today, count: 1 });
    }
    
    await listing.save();

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create listing (Landlord only)
router.post('/', auth, isLandlord, upload.array('media', 10), async (req, res) => {
  try {
    const listingData = JSON.parse(req.body.data);
    
    // Process uploaded files
    const images = [];
    const videos = [];
    
    if (req.files) {
      req.files.forEach(file => {
        const filePath = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('image')) {
          images.push(filePath);
        } else if (file.mimetype.startsWith('video')) {
          videos.push(filePath);
        }
      });
    }

    const listing = new Listing({
      ...listingData,
      landlord: req.userId,
      images,
      videos
    });

    await listing.save();

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update listing
router.put('/:id', auth, isLandlord, upload.array('media', 10), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = req.body.data ? JSON.parse(req.body.data) : req.body;

    // Process new uploaded files
    if (req.files && req.files.length > 0) {
      const newImages = [];
      const newVideos = [];
      
      req.files.forEach(file => {
        const filePath = `/uploads/${file.filename}`;
        if (file.mimetype.startsWith('image')) {
          newImages.push(filePath);
        } else if (file.mimetype.startsWith('video')) {
          newVideos.push(filePath);
        }
      });

      if (newImages.length > 0) {
        updates.images = [...(listing.images || []), ...newImages];
      }
      if (newVideos.length > 0) {
        updates.videos = [...(listing.videos || []), ...newVideos];
      }
    }

    Object.assign(listing, updates);
    await listing.save();

    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete listing
router.delete('/:id', auth, isLandlord, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await listing.deleteOne();

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update listing status (hide/show)
router.patch('/:id/status', auth, isLandlord, async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    listing.status = status;
    await listing.save();

    res.json({ message: 'Listing status updated', listing });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Track search keyword
router.post('/:id/track-keyword', async (req, res) => {
  try {
    const { keyword } = req.body;
    const listing = await Listing.findById(req.params.id);
    
    if (listing && keyword) {
      const existingKeyword = listing.searchKeywords.find(k => k.keyword === keyword);
      
      if (existingKeyword) {
        existingKeyword.count += 1;
      } else {
        listing.searchKeywords.push({ keyword, count: 1 });
      }
      
      await listing.save();
    }

    res.json({ message: 'Keyword tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get landlord's listings
router.get('/landlord/:landlordId', async (req, res) => {
  try {
    const listings = await Listing.find({ 
      landlord: req.params.landlordId 
    }).sort('-createdAt');

    res.json({ listings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


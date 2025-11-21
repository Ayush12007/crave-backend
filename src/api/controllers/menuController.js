import MenuItem from '../../models/MenuItem.js';

export const getMenu = async (req, res) => {
  const menuItems = await MenuItem.find({ isAvailable: true });
  res.json(menuItems);
};

export const addMenuItem = async (req, res) => {
  const { name, description, price, category, variants, image } = req.body; // Added image to destructuring
  const menuItem = await MenuItem.create({
    name, description, price, category, variants, image
  });
  res.status(201).json(menuItem);
};

// [NEW] Create Review
export const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const menuItem = await MenuItem.findById(req.params.id);

  if (menuItem) {
    // Check if user already reviewed
    const alreadyReviewed = menuItem.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this dish' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    menuItem.reviews.push(review);
    menuItem.numReviews = menuItem.reviews.length;
    
    // Calculate Average
    menuItem.rating =
      menuItem.reviews.reduce((acc, item) => item.rating + acc, 0) /
      menuItem.reviews.length;

    await menuItem.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
};
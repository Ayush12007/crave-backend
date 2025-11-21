import jwt from 'jsonwebtoken';
import User from '../../models/User.js';


const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    // CRUCIAL: Set to true in production for HTTPS
    secure: isProduction, 
    // FIX: Must use 'None' for cross-domain (Vercel -> Render) deployment, but requires secure:true.
    sameSite: 'None', 
    // Domain should be left blank or set to the specific API domain for deployment if using Vercel/Render. 
    // Leaving it blank often works best in these environments.
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({ name, email, password, role });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins // Return coins on register
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins // Return coins on login
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out' });
};

// [NEW] Get User Profile (For refreshing coins)
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
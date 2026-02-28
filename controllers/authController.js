import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';
import config from '../config/env.js';

/**
 * Generate JWT token for authenticated guardian
 */
const generateToken = (guardianId) => {
  return jwt.sign({ guardianId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Register a new guardian
 * POST /api/auth/register
 */
export const registerGuardian = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const { data: existingGuardian } = await supabase
      .from('guardians')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingGuardian) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newGuardian, error } = await supabase
      .from('guardians')
      .insert([{
        name,
        email,
        password: hashedPassword,
        phone
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const token = generateToken(newGuardian.id);

    const guardianResponse = {
      id: newGuardian.id,
      name: newGuardian.name,
      email: newGuardian.email,
      phone: newGuardian.phone,
      createdAt: newGuardian.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Guardian registered successfully',
      data: {
        guardian: guardianResponse,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering guardian',
      error: error.message
    });
  }
};

/**
 * Login guardian
 * POST /api/auth/login
 */
export const loginGuardian = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: guardian, error } = await supabase
      .from('guardians')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !guardian) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, guardian.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(guardian.id);

    const guardianResponse = {
      id: guardian.id,
      name: guardian.name,
      email: guardian.email,
      phone: guardian.phone,
      createdAt: guardian.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        guardian: guardianResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

/**
 * Get current guardian profile
 * GET /api/auth/me
 */
export const getGuardianProfile = async (req, res) => {
  try {
    const { data: guardian, error } = await supabase
      .from('guardians')
      .select('id, name, email, phone, created_at')
      .eq('id', req.guardianId)
      .single();

    if (error || !guardian) {
      return res.status(404).json({
        success: false,
        message: 'Guardian not found'
      });
    }

    res.status(200).json({
      success: true,
      data: guardian
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

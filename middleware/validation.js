/**
 * Validation Middleware
 * Validates request data against defined rules
 */

export const validateGuardianRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: name, email, password, phone'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  next();
};

export const validateGuardianLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  next();
};

export const validatePatient = (req, res, next) => {
  const { name, age, medicalCondition, guardianPhone, address } = req.body;

  if (!name || !age || !medicalCondition || !guardianPhone || !address) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: name, age, medicalCondition, guardianPhone, address'
    });
  }

  if (age < 0 || age > 150) {
    return res.status(400).json({
      success: false,
      message: 'Invalid age value'
    });
  }

  next();
};

export const validateLocation = (req, res, next) => {
  const { patientId, latitude, longitude } = req.body;

  if (!patientId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: patientId, latitude, longitude'
    });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid latitude or longitude values'
    });
  }

  next();
};

export const validateSchedule = (req, res, next) => {
  const { patientId, title, scheduleTime, type } = req.body;

  if (!patientId || !title || !scheduleTime || !type) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: patientId, title, scheduleTime, type'
    });
  }

  const validTypes = ['medicine', 'meal', 'sleep', 'other'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid type. Must be one of: medicine, meal, sleep, other'
    });
  }

  next();
};

export const validateEmergencyContact = (req, res, next) => {
  const { patientId, name, phone, relationship } = req.body;

  if (!patientId || !name || !phone || !relationship) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: patientId, name, phone, relationship'
    });
  }

  next();
};

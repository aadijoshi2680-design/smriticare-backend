import supabase from '../config/database.js';

/**
 * Update patient location
 * POST /api/location/update
 */
export const updateLocation = async (req, res) => {
  try {
    const { patientId, latitude, longitude } = req.body;
    const guardianId = req.guardianId;

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or unauthorized'
      });
    }

    const { data: location, error } = await supabase
      .from('locations')
      .insert([{
        patient_id: patientId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        id: location.id,
        patientId: location.patient_id,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        timestamp: location.timestamp
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
};

/**
 * Get latest location for a patient
 * GET /api/location/:patientId
 */
export const getLatestLocation = async (req, res) => {
  try {
    const { patientId } = req.params;
    const guardianId = req.guardianId;

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or unauthorized'
      });
    }

    const { data: location, error } = await supabase
      .from('locations')
      .select('*')
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location data found for this patient'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: location.id,
        patientId: location.patient_id,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        timestamp: location.timestamp
      }
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message
    });
  }
};

/**
 * Get location history for a patient
 * GET /api/location/history/:patientId
 */
export const getLocationHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const guardianId = req.guardianId;
    const { limit = 50, offset = 0 } = req.query;

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or unauthorized'
      });
    }

    const { data: locations, error, count } = await supabase
      .from('locations')
      .select('*', { count: 'exact' })
      .eq('patient_id', patientId)
      .order('timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    const formattedLocations = locations.map(location => ({
      id: location.id,
      patientId: location.patient_id,
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
      timestamp: location.timestamp
    }));

    res.status(200).json({
      success: true,
      count: formattedLocations.length,
      total: count,
      data: formattedLocations
    });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location history',
      error: error.message
    });
  }
};

import supabase from '../config/database.js';

/**
 * Get patient emergency info by QR code ID
 * GET /api/qr/:qrCodeId
 * This endpoint is public for emergency responders to access
 */
export const getPatientByQRCode = async (req, res) => {
  try {
    const { qrCodeId } = req.params;

    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        id,
        name,
        age,
        medical_condition,
        guardian_phone,
        address,
        photo_url
      `)
      .eq('qr_code_id', qrCodeId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const { data: emergencyContacts } = await supabase
      .from('emergency_contacts')
      .select('name, phone, relationship, priority')
      .eq('patient_id', patient.id)
      .order('priority', { ascending: true });

    const { data: latestLocation } = await supabase
      .from('locations')
      .select('latitude, longitude, timestamp')
      .eq('patient_id', patient.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    res.status(200).json({
      success: true,
      data: {
        patient: {
          name: patient.name,
          age: patient.age,
          medicalCondition: patient.medical_condition,
          guardianPhone: patient.guardian_phone,
          address: patient.address,
          photoUrl: patient.photo_url
        },
        emergencyContacts: emergencyContacts || [],
        lastKnownLocation: latestLocation ? {
          latitude: parseFloat(latestLocation.latitude),
          longitude: parseFloat(latestLocation.longitude),
          timestamp: latestLocation.timestamp
        } : null,
        message: 'This person has Alzheimer\'s disease. Please contact the guardian or emergency contacts immediately.'
      }
    });
  } catch (error) {
    console.error('QR code lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient information',
      error: error.message
    });
  }
};

/**
 * Get QR code ID for a patient
 * GET /api/qr/patient/:patientId
 */
export const getQRCodeForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const guardianId = req.guardianId;

    const { data: patient, error } = await supabase
      .from('patients')
      .select('id, qr_code_id, name')
      .eq('id', patientId)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        patientId: patient.id,
        patientName: patient.name,
        qrCodeId: patient.qr_code_id,
        qrUrl: `${req.protocol}://${req.get('host')}/api/qr/${patient.qr_code_id}`
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving QR code',
      error: error.message
    });
  }
};

/**
 * Regenerate QR code ID for a patient
 * POST /api/qr/regenerate/:patientId
 */
export const regenerateQRCode = async (req, res) => {
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

    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update({
        qr_code_id: crypto.randomUUID(),
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)
      .select('qr_code_id, name')
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'QR code regenerated successfully',
      data: {
        patientId: patient.id,
        patientName: updatedPatient.name,
        qrCodeId: updatedPatient.qr_code_id,
        qrUrl: `${req.protocol}://${req.get('host')}/api/qr/${updatedPatient.qr_code_id}`
      }
    });
  } catch (error) {
    console.error('Regenerate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating QR code',
      error: error.message
    });
  }
};

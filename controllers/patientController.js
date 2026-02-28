import supabase from '../config/database.js';

/**
 * Create a new patient
 * POST /api/patients
 */
export const createPatient = async (req, res) => {
  try {
    const { name, age, medicalCondition, guardianPhone, address, photoUrl, emergencyContacts } = req.body;
    const guardianId = req.guardianId;

    const { data: patient, error } = await supabase
      .from('patients')
      .insert([{
        guardian_id: guardianId,
        name,
        age,
        medical_condition: medicalCondition,
        guardian_phone: guardianPhone,
        address,
        photo_url: photoUrl || ''
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (emergencyContacts && Array.isArray(emergencyContacts) && emergencyContacts.length > 0) {
      const contactsToInsert = emergencyContacts.map((contact, index) => ({
        patient_id: patient.id,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        priority: contact.priority || index + 1
      }));

      await supabase
        .from('emergency_contacts')
        .insert(contactsToInsert);
    }

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        medicalCondition: patient.medical_condition,
        guardianId: patient.guardian_id,
        guardianPhone: patient.guardian_phone,
        address: patient.address,
        photoUrl: patient.photo_url,
        qrCodeId: patient.qr_code_id,
        createdAt: patient.created_at
      }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
};

/**
 * Get all patients for the authenticated guardian
 * GET /api/patients
 */
export const getAllPatients = async (req, res) => {
  try {
    const guardianId = req.guardianId;

    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('guardian_id', guardianId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      medicalCondition: patient.medical_condition,
      guardianId: patient.guardian_id,
      guardianPhone: patient.guardian_phone,
      address: patient.address,
      photoUrl: patient.photo_url,
      qrCodeId: patient.qr_code_id,
      createdAt: patient.created_at,
      updatedAt: patient.updated_at
    }));

    res.status(200).json({
      success: true,
      count: formattedPatients.length,
      data: formattedPatients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

/**
 * Get a single patient by ID
 * GET /api/patients/:id
 */
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;

    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('guardian_id', guardianId)
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
      .select('*')
      .eq('patient_id', id)
      .order('priority', { ascending: true });

    res.status(200).json({
      success: true,
      data: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        medicalCondition: patient.medical_condition,
        guardianId: patient.guardian_id,
        guardianPhone: patient.guardian_phone,
        address: patient.address,
        photoUrl: patient.photo_url,
        qrCodeId: patient.qr_code_id,
        createdAt: patient.created_at,
        updatedAt: patient.updated_at,
        emergencyContacts: emergencyContacts || []
      }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
};

/**
 * Update a patient
 * PUT /api/patients/:id
 */
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;
    const { name, age, medicalCondition, guardianPhone, address, photoUrl } = req.body;

    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (medicalCondition !== undefined) updateData.medical_condition = medicalCondition;
    if (guardianPhone !== undefined) updateData.guardian_phone = guardianPhone;
    if (address !== undefined) updateData.address = address;
    if (photoUrl !== undefined) updateData.photo_url = photoUrl;

    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: {
        id: updatedPatient.id,
        name: updatedPatient.name,
        age: updatedPatient.age,
        medicalCondition: updatedPatient.medical_condition,
        guardianId: updatedPatient.guardian_id,
        guardianPhone: updatedPatient.guardian_phone,
        address: updatedPatient.address,
        photoUrl: updatedPatient.photo_url,
        qrCodeId: updatedPatient.qr_code_id,
        updatedAt: updatedPatient.updated_at
      }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
};

/**
 * Delete a patient
 * DELETE /api/patients/:id
 */
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;

    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
};

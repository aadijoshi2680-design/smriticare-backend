import supabase from '../config/database.js';

/**
 * Add emergency contact for a patient
 * POST /api/emergency-contacts
 */
export const addEmergencyContact = async (req, res) => {
  try {
    const { patientId, name, phone, relationship, priority } = req.body;
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

    const { data: contact, error } = await supabase
      .from('emergency_contacts')
      .insert([{
        patient_id: patientId,
        name,
        phone,
        relationship,
        priority: priority || 1
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: {
        id: contact.id,
        patientId: contact.patient_id,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        priority: contact.priority,
        createdAt: contact.created_at
      }
    });
  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding emergency contact',
      error: error.message
    });
  }
};

/**
 * Get all emergency contacts for a patient
 * GET /api/emergency-contacts/:patientId
 */
export const getEmergencyContacts = async (req, res) => {
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

    const { data: contacts, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('patient_id', patientId)
      .order('priority', { ascending: true });

    if (error) {
      throw error;
    }

    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      patientId: contact.patient_id,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      priority: contact.priority,
      createdAt: contact.created_at
    }));

    res.status(200).json({
      success: true,
      count: formattedContacts.length,
      data: formattedContacts
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts',
      error: error.message
    });
  }
};

/**
 * Update an emergency contact
 * PUT /api/emergency-contacts/:id
 */
export const updateEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;
    const { name, phone, relationship, priority } = req.body;

    const { data: contact } = await supabase
      .from('emergency_contacts')
      .select(`
        *,
        patients!inner (
          id,
          guardian_id
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (!contact || contact.patients.guardian_id !== guardianId) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found or unauthorized'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (relationship !== undefined) updateData.relationship = relationship;
    if (priority !== undefined) updateData.priority = priority;

    const { data: updatedContact, error } = await supabase
      .from('emergency_contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: {
        id: updatedContact.id,
        patientId: updatedContact.patient_id,
        name: updatedContact.name,
        phone: updatedContact.phone,
        relationship: updatedContact.relationship,
        priority: updatedContact.priority
      }
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating emergency contact',
      error: error.message
    });
  }
};

/**
 * Delete an emergency contact
 * DELETE /api/emergency-contacts/:id
 */
export const deleteEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;

    const { data: contact } = await supabase
      .from('emergency_contacts')
      .select(`
        *,
        patients!inner (
          id,
          guardian_id
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (!contact || contact.patients.guardian_id !== guardianId) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found or unauthorized'
      });
    }

    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting emergency contact',
      error: error.message
    });
  }
};

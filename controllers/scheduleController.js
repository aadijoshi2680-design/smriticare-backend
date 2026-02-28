import supabase from '../config/database.js';

/**
 * Create a new schedule for a patient
 * POST /api/schedules
 */
export const createSchedule = async (req, res) => {
  try {
    const { patientId, title, description, scheduleTime, type } = req.body;
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

    const { data: schedule, error } = await supabase
      .from('schedules')
      .insert([{
        patient_id: patientId,
        title,
        description: description || '',
        schedule_time: scheduleTime,
        type,
        completed: false
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: {
        id: schedule.id,
        patientId: schedule.patient_id,
        title: schedule.title,
        description: schedule.description,
        scheduleTime: schedule.schedule_time,
        type: schedule.type,
        completed: schedule.completed,
        createdAt: schedule.created_at
      }
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating schedule',
      error: error.message
    });
  }
};

/**
 * Get all schedules for a patient
 * GET /api/schedules/:patientId
 */
export const getPatientSchedules = async (req, res) => {
  try {
    const { patientId } = req.params;
    const guardianId = req.guardianId;
    const { type, completed } = req.query;

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

    let query = supabase
      .from('schedules')
      .select('*')
      .eq('patient_id', patientId);

    if (type) {
      query = query.eq('type', type);
    }

    if (completed !== undefined) {
      query = query.eq('completed', completed === 'true');
    }

    const { data: schedules, error } = await query
      .order('schedule_time', { ascending: true });

    if (error) {
      throw error;
    }

    const formattedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      patientId: schedule.patient_id,
      title: schedule.title,
      description: schedule.description,
      scheduleTime: schedule.schedule_time,
      type: schedule.type,
      completed: schedule.completed,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at
    }));

    res.status(200).json({
      success: true,
      count: formattedSchedules.length,
      data: formattedSchedules
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedules',
      error: error.message
    });
  }
};

/**
 * Get a single schedule by ID
 * GET /api/schedules/details/:id
 */
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;

    const { data: schedule, error } = await supabase
      .from('schedules')
      .select(`
        *,
        patients!inner (
          id,
          guardian_id
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!schedule || schedule.patients.guardian_id !== guardianId) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: schedule.id,
        patientId: schedule.patient_id,
        title: schedule.title,
        description: schedule.description,
        scheduleTime: schedule.schedule_time,
        type: schedule.type,
        completed: schedule.completed,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at
      }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schedule',
      error: error.message
    });
  }
};

/**
 * Update a schedule
 * PUT /api/schedules/:id
 */
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;
    const { title, description, scheduleTime, type, completed } = req.body;

    const { data: schedule } = await supabase
      .from('schedules')
      .select(`
        *,
        patients!inner (
          id,
          guardian_id
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (!schedule || schedule.patients.guardian_id !== guardianId) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or unauthorized'
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (scheduleTime !== undefined) updateData.schedule_time = scheduleTime;
    if (type !== undefined) updateData.type = type;
    if (completed !== undefined) updateData.completed = completed;

    const { data: updatedSchedule, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: {
        id: updatedSchedule.id,
        patientId: updatedSchedule.patient_id,
        title: updatedSchedule.title,
        description: updatedSchedule.description,
        scheduleTime: updatedSchedule.schedule_time,
        type: updatedSchedule.type,
        completed: updatedSchedule.completed,
        updatedAt: updatedSchedule.updated_at
      }
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating schedule',
      error: error.message
    });
  }
};

/**
 * Delete a schedule
 * DELETE /api/schedules/:id
 */
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const guardianId = req.guardianId;

    const { data: schedule } = await supabase
      .from('schedules')
      .select(`
        *,
        patients!inner (
          id,
          guardian_id
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (!schedule || schedule.patients.guardian_id !== guardianId) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or unauthorized'
      });
    }

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting schedule',
      error: error.message
    });
  }
};

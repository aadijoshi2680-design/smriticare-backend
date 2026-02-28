import supabase from '../config/database.js';

/**
 * AI Chat endpoint placeholder
 * POST /api/ai/chat
 * This is a placeholder for future AI integration
 */
export const aiChat = async (req, res) => {
  try {
    const { message, patientId } = req.body;
    const guardianId = req.guardianId;

    if (!message || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Message and patientId are required'
      });
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('id, name, medical_condition')
      .eq('id', patientId)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or unauthorized'
      });
    }

    const mockResponses = [
      `I understand you're caring for ${patient.name}. Here are some helpful reminders for today's care routine.`,
      `Based on ${patient.name}'s condition (${patient.medical_condition}), I recommend maintaining a consistent daily schedule.`,
      `Remember to ensure ${patient.name} takes their medication on time. Would you like me to set up a reminder?`,
      `Creating a calm and familiar environment is important for Alzheimer's patients. How can I help you with that?`,
      `I can help you track ${patient.name}'s daily activities and health metrics. What would you like to monitor?`
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    res.status(200).json({
      success: true,
      data: {
        response: randomResponse,
        timestamp: new Date().toISOString(),
        patientId: patient.id,
        patientName: patient.name,
        note: 'This is a placeholder response. Integrate with an actual AI service for production use.'
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI chat',
      error: error.message
    });
  }
};

/**
 * Get AI suggestions for patient care
 * GET /api/ai/suggestions/:patientId
 */
export const getCareSuggestions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const guardianId = req.guardianId;

    const { data: patient } = await supabase
      .from('patients')
      .select('id, name, age, medical_condition')
      .eq('id', patientId)
      .eq('guardian_id', guardianId)
      .maybeSingle();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or unauthorized'
      });
    }

    const suggestions = [
      {
        category: 'Daily Routine',
        suggestion: 'Maintain a consistent daily schedule to reduce confusion and anxiety',
        priority: 'high'
      },
      {
        category: 'Medication',
        suggestion: 'Set up medication reminders at the same time each day',
        priority: 'high'
      },
      {
        category: 'Safety',
        suggestion: 'Ensure proper lighting throughout the home to prevent falls',
        priority: 'medium'
      },
      {
        category: 'Communication',
        suggestion: 'Use simple, clear sentences and maintain eye contact',
        priority: 'medium'
      },
      {
        category: 'Activities',
        suggestion: 'Engage in familiar activities and hobbies to stimulate memory',
        priority: 'low'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        patientId: patient.id,
        patientName: patient.name,
        suggestions,
        note: 'These are general suggestions. Integrate with an AI service for personalized recommendations.'
      }
    });
  } catch (error) {
    console.error('Get care suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching care suggestions',
      error: error.message
    });
  }
};

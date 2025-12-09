const supabase = require('../config/supabase');

const getPersonalReminders = async (req, res) => {
  try {
    // Get child's personal reminders
    const { data: personalReminders, error: personalError } = await supabase
      .from('reminders')
      .select('*')
      .eq('child_id', req.user.id)
      .eq('is_global', false);

    if (personalError) {
      console.error('Failed to fetch personal reminders:', personalError);
      return res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
    }

    // Get global (admin-created) reminders
    const { data: globalReminders, error: globalError } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_global', true)
      .eq('active', true);

    if (globalError) {
      console.error('Failed to fetch global reminders:', globalError);
      return res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
    }

    // Combine personal and global reminders
    const allReminders = [
      ...(personalReminders || []).map(r => ({
        id: r.id,
        title: r.title,
        message: r.message,
        time: r.time,
        timezone: r.timezone,
        repeat: r.repeat,
        enabled: r.enabled,
        isGlobal: false,
        soundRef: r.sound_ref
      })),
      ...(globalReminders || []).map(r => ({
        id: r.id,
        title: r.title,
        message: r.message,
        time: r.time,
        repeat: r.repeat,
        enabled: true,
        isGlobal: true,
        locale: r.locale
      }))
    ];

    res.status(200).json({
      reminders: allReminders
    });
  } catch (error) {
    console.error('Exception in getPersonalReminders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createPersonalReminder = async (req, res) => {
  try {
    const { title, time, timezone, repeat, soundRef, enabled } = req.body;

    if (!title || !time) {
      return res.status(400).json({ success: false, message: 'title and time are required' });
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        child_id: req.user.id,
        is_global: false,
        title,
        time,
        timezone: timezone || 'UTC',
        repeat: repeat || 'daily',
        sound_ref: soundRef || 'default_chime.mp3',
        enabled: enabled !== undefined ? enabled : true
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to create reminder' });
    }

    res.status(201).json({
      reminderId: reminder.id,
      message: 'Reminder created.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updatePersonalReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, time, timezone, repeat, soundRef, enabled } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (time) updates.time = time;
    if (timezone) updates.timezone = timezone;
    if (repeat) updates.repeat = repeat;
    if (soundRef) updates.sound_ref = soundRef;
    if (enabled !== undefined) updates.enabled = enabled;

    const { error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('child_id', req.user.id)
      .eq('is_global', false);

    if (error) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deletePersonalReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('child_id', req.user.id)
      .eq('is_global', false);

    if (error) {
      console.error('Delete reminder error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete reminder', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted.'
    });
  } catch (error) {
    console.error('Exception in deletePersonalReminder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getGlobalReminders = async (req, res) => {
  try {
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_global', true);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch global reminders' });
    }

    res.status(200).json({
      globalReminders: (reminders || []).map(r => ({
        id: r.id,
        title: r.title,
        message: r.message,
        time: r.time,
        repeat: r.repeat,
        locale: r.locale,
        active: r.active
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createGlobalReminder = async (req, res) => {
  try {
    const { title, message, repeat, locale, active } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        is_global: true,
        title,
        message,
        time: '00:00',
        repeat: repeat || 'daily',
        locale: locale || 'en',
        active: active !== undefined ? active : true
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to create global reminder' });
    }

    res.status(201).json({
      reminderId: reminder.id,
      message: 'Global reminder created.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getPersonalReminders,
  createPersonalReminder,
  updatePersonalReminder,
  deletePersonalReminder,
  getGlobalReminders,
  createGlobalReminder
};

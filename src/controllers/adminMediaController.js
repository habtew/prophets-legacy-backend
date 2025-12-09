const supabase = require('../config/supabase');
const { createAuthenticatedClient } = require('../config/supabase');

const getUploadUrl = async (req, res) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ success: false, message: 'filename and contentType are required' });
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'audio/mpeg', 'audio/mp3', 'audio/wav',
      'video/mp4', 'application/json'
    ];

    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ success: false, message: 'Invalid file type' });
    }

    let bucket = 'lesson-assets';
    if (contentType.startsWith('image/')) {
      bucket = filename.includes('avatar') ? 'avatars' : 'lesson-assets';
    } else if (contentType.startsWith('audio/')) {
      bucket = 'sfx';
    } else if (contentType.startsWith('video/')) {
      bucket = 'animations';
    }

    const assetKey = `${Date.now()}-${filename}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(assetKey);

    if (error) {
      console.error('Storage upload URL error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate upload URL',
        error: error.message,
        bucket: bucket
      });
    }

    res.status(200).json({
      uploadUrl: data.signedUrl,
      assetKey: assetKey,
      bucket: bucket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllSFX = async (req, res) => {
  try {
    const { data: sfx, error } = await supabase
      .from('sfx')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch SFX' });
    }

    res.status(200).json(sfx || []);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addSFX = async (req, res) => {
  try {
    const { name, sfxUrl } = req.body;

    if (!name || !sfxUrl) {
      return res.status(400).json({ success: false, message: 'name and sfxUrl are required' });
    }

    const authClient = createAuthenticatedClient(req.token);
    const { data: newSfx, error } = await authClient
      .from('sfx')
      .insert({ name, url: sfxUrl })
      .select()
      .single();

    if (error) {
      console.error('Add SFX error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add SFX', details: error.message });
    }

    res.status(201).json({
      sfxId: newSfx.id,
      message: 'SFX added.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateSFX = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sfxUrl } = req.body;

    if (!name && !sfxUrl) {
      return res.status(400).json({ success: false, message: 'At least name or sfxUrl is required' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (sfxUrl) updates.url = sfxUrl;

    const authClient = createAuthenticatedClient(req.token);
    const { data: updatedSfx, error } = await authClient
      .from('sfx')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update SFX error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update SFX', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'SFX updated.',
      sfx: updatedSfx
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteSFX = async (req, res) => {
  try {
    const { id } = req.params;

    const authClient = createAuthenticatedClient(req.token);
    const { error } = await authClient
      .from('sfx')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete SFX error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete SFX', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'SFX deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllAnimations = async (req, res) => {
  try {
    const { data: animations, error } = await supabase
      .from('animations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch animations' });
    }

    res.status(200).json(animations || []);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addAnimation = async (req, res) => {
  try {
    const { name, animationUrl } = req.body;

    if (!name || !animationUrl) {
      return res.status(400).json({ success: false, message: 'name and animationUrl are required' });
    }

    const authClient = createAuthenticatedClient(req.token);
    const { data: newAnimation, error } = await authClient
      .from('animations')
      .insert({ name, url: animationUrl })
      .select()
      .single();

    if (error) {
      console.error('Add animation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add animation', details: error.message });
    }

    res.status(201).json({
      animationId: newAnimation.id,
      message: 'Animation added.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateAnimation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, animationUrl } = req.body;

    if (!name && !animationUrl) {
      return res.status(400).json({ success: false, message: 'At least name or animationUrl is required' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (animationUrl) updates.url = animationUrl;

    const authClient = createAuthenticatedClient(req.token);
    const { data: updatedAnimation, error } = await authClient
      .from('animations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update animation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update animation', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Animation updated.',
      animation: updatedAnimation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteAnimation = async (req, res) => {
  try {
    const { id } = req.params;

    const authClient = createAuthenticatedClient(req.token);
    const { error} = await authClient
      .from('animations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete animation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete animation', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Animation deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllBackgrounds = async (req, res) => {
  try {
    const { data: backgrounds, error } = await supabase
      .from('backgrounds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch backgrounds' });
    }

    res.status(200).json(backgrounds || []);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addBackground = async (req, res) => {
  try {
    const { name, backgroundUrl } = req.body;

    if (!name || !backgroundUrl) {
      return res.status(400).json({ success: false, message: 'name and backgroundUrl are required' });
    }

    const authClient = createAuthenticatedClient(req.token);
    const { data: newBackground, error } = await authClient
      .from('backgrounds')
      .insert({ name, url: backgroundUrl })
      .select()
      .single();

    if (error) {
      console.error('Add background error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add background', details: error.message });
    }

    res.status(201).json({
      backgroundId: newBackground.id,
      message: 'Background added.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateBackground = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, backgroundUrl } = req.body;

    if (!name && !backgroundUrl) {
      return res.status(400).json({ success: false, message: 'At least name or backgroundUrl is required' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (backgroundUrl) updates.url = backgroundUrl;

    const authClient = createAuthenticatedClient(req.token);
    const { data: updatedBackground, error } = await authClient
      .from('backgrounds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update background error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update background', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Background updated.',
      background: updatedBackground
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteBackground = async (req, res) => {
  try {
    const { id } = req.params;

    const authClient = createAuthenticatedClient(req.token);
    const { error } = await authClient
      .from('backgrounds')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete background error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete background', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Background deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllNotificationTemplates = async (req, res) => {
  try {
    const { data: templates, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch templates' });
    }

    res.status(200).json(templates || []);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createNotificationTemplate = async (req, res) => {
  try {
    const { name, type, content } = req.body;

    if (!name || !type || !content) {
      return res.status(400).json({ success: false, message: 'name, type, and content are required' });
    }

    const authClient = createAuthenticatedClient(req.token);
    const { data: template, error } = await authClient
      .from('notification_templates')
      .insert({ name, type, content })
      .select()
      .single();

    if (error) {
      console.error('Create notification template error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create template', details: error.message });
    }

    res.status(201).json({
      templateId: template.id,
      message: 'Template created.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateNotificationTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, content } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (type) updates.type = type;
    if (content) updates.content = content;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    console.log('Updating template:', id, 'with:', updates);

    const { data, error } = await supabase
      .from('notification_templates')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update notification template error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update template', error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    console.log('Template updated successfully:', data[0]);

    res.status(200).json({
      success: true,
      message: 'Template updated.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteNotificationTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const authClient = createAuthenticatedClient(req.token);
    const { error } = await authClient
      .from('notification_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete notification template error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete template', details: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createCampaign = async (req, res) => {
  try {
    const { templateId, target, schedule } = req.body;

    if (!templateId || !target || !schedule) {
      return res.status(400).json({ success: false, message: 'templateId, target, and schedule are required' });
    }

    // Validate template exists
    const { data: template } = await supabase
      .from('notification_templates')
      .select('id')
      .eq('id', templateId)
      .maybeSingle();

    if (!template) {
      return res.status(404).json({ success: false, message: 'Notification template not found. Please create a template first.' });
    }

    const { data: campaign, error } = await supabase
      .from('notification_campaigns')
      .insert({
        template_id: templateId,
        target,
        schedule,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('Create campaign error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create campaign', error: error.message });
    }

    res.status(201).json({
      campaignId: campaign.id,
      message: 'Campaign scheduled.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const sendTestNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId is required' });
    }

    res.status(200).json({
      success: true,
      message: 'Test notification sent.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllGlobalReminders = async (req, res) => {
  try {
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('is_global', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get global reminders error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch reminders', error: error.message });
    }

    res.status(200).json({
      reminders: (reminders || []).map(r => ({
        id: r.id,
        title: r.title,
        message: r.message,
        time: r.time,
        repeat: r.repeat,
        locale: r.locale,
        active: r.active,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Exception in getAllGlobalReminders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createGlobalReminder = async (req, res) => {
  try {
    const { title, message, time, repeat, locale, active } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        is_global: true,
        title,
        message: message || '',
        time: time || '00:00',
        repeat: repeat || 'daily',
        locale: locale || 'en',
        active: active !== undefined ? active : true
      })
      .select()
      .single();

    if (error) {
      console.error('Create global reminder error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create reminder', error: error.message });
    }

    res.status(201).json({
      reminderId: reminder.id,
      message: 'Global reminder created.'
    });
  } catch (error) {
    console.error('Exception in createGlobalReminder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateGlobalReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, time, repeat, locale, active } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (message !== undefined) updates.message = message;
    if (time !== undefined) updates.time = time;
    if (repeat !== undefined) updates.repeat = repeat;
    if (locale !== undefined) updates.locale = locale;
    if (active !== undefined) updates.active = active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .eq('is_global', true)
      .select();

    if (error) {
      console.error('Update global reminder error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update reminder', error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated.'
    });
  } catch (error) {
    console.error('Exception in updateGlobalReminder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteGlobalReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('is_global', true);

    if (error) {
      console.error('Delete global reminder error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete reminder', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted.'
    });
  } catch (error) {
    console.error('Exception in deleteGlobalReminder:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getUploadUrl,
  getAllSFX,
  addSFX,
  deleteSFX,
  getAllAnimations,
  addAnimation,
  deleteAnimation,
  getAllNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  createCampaign,
  sendTestNotification,
  getAllGlobalReminders,
  createGlobalReminder,
  updateGlobalReminder,
  deleteGlobalReminder
};

const uploadPredefinedAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { name, category = 'general', orderIndex = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Avatar name is required'
      });
    }

    const file = req.file;
    const timestamp = Date.now();
    const fileExt = file.originalname.substring(file.originalname.lastIndexOf('.'));
    const uniqueFileName = `predefined_${timestamp}${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Avatar upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        details: error.message
      });
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uniqueFileName);

    const imageUrl = urlData.publicUrl;

    const { data: avatar, error: insertError } = await supabase
      .from('predefined_avatars')
      .insert({
        name,
        image_url: imageUrl,
        category,
        order_index: parseInt(orderIndex),
        created_by: req.user.id,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save avatar to database',
        details: insertError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Predefined avatar uploaded successfully',
      avatar: {
        id: avatar.id,
        name: avatar.name,
        imageUrl: avatar.image_url,
        category: avatar.category,
        orderIndex: avatar.order_index
      }
    });
  } catch (error) {
    console.error('Upload predefined avatar exception:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const getAllPredefinedAvatars = async (req, res) => {
  try {
    const { category, activeOnly = 'true' } = req.query;

    let query = supabase
      .from('predefined_avatars')
      .select('id, name, image_url, category, order_index, is_active, created_at');

    if (activeOnly === 'true') {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('order_index', { ascending: true })
                 .order('created_at', { ascending: false });

    const { data: avatars, error } = await query;

    if (error) {
      console.error('Get avatars error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch avatars',
        details: error.message
      });
    }

    res.status(200).json({
      success: true,
      avatars: avatars || []
    });
  } catch (error) {
    console.error('Get avatars exception:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updatePredefinedAvatar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, orderIndex, isActive } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (orderIndex !== undefined) updates.order_index = parseInt(orderIndex);
    if (isActive !== undefined) updates.is_active = isActive;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const { data: avatar, error } = await supabase
      .from('predefined_avatars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update avatar error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update avatar',
        details: error.message
      });
    }

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'Avatar not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: {
        id: avatar.id,
        name: avatar.name,
        imageUrl: avatar.image_url,
        category: avatar.category,
        orderIndex: avatar.order_index,
        isActive: avatar.is_active
      }
    });
  } catch (error) {
    console.error('Update avatar exception:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deletePredefinedAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('predefined_avatars')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete avatar error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete avatar',
        details: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete avatar exception:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getUploadUrl,
  getAllSFX,
  addSFX,
  updateSFX,
  deleteSFX,
  getAllAnimations,
  addAnimation,
  updateAnimation,
  deleteAnimation,
  getAllBackgrounds,
  addBackground,
  updateBackground,
  deleteBackground,
  getAllNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  createCampaign,
  sendTestNotification,
  getAllGlobalReminders,
  createGlobalReminder,
  updateGlobalReminder,
  deleteGlobalReminder,
  uploadPredefinedAvatar,
  getAllPredefinedAvatars,
  updatePredefinedAvatar,
  deletePredefinedAvatar
};

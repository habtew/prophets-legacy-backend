const supabase = require('../config/supabase');

const registerChild = async (req, res) => {
  try {
    const { username, displayName, age, sex, avatar } = req.body;

    if (!username || !displayName || !age || !sex) {
      return res.status(400).json({ success: false, message: 'Missing required fields: username, displayName, age, sex' });
    }

    // Validate age
    if (age < 3 || age > 18) {
      return res.status(400).json({ success: false, message: 'Age must be between 3 and 18' });
    }

    // Validate sex
    if (!['male', 'female'].includes(sex.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Sex must be either male or female' });
    }

    // Verify supabase is properly loaded
    if (!supabase) {
      console.error('ERROR: Supabase client is not initialized!');
      return res.status(500).json({ success: false, message: 'Database connection error' });
    }

    // Check if username is already taken
    const { data: existingChild } = await supabase
      .from('children')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingChild) {
      return res.status(409).json({ success: false, message: 'Username already taken' });
    }

    // Create child record directly in database (no Supabase auth for children)
    const { data, error: insertError } = await supabase
      .from('children')
      .insert({
        username,
        display_name: displayName,
        age,
        sex,
        avatar_url: avatar || null
      })
      .select();

    const child = data?.[0];

    if (insertError) {
      console.error('Child profile creation error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create child profile',
        details: insertError.message
      });
    }

    res.status(201).json({
      success: true,
      childId: child.id,
      username: username,
      message: 'Child profile created successfully. Use username to login.'
    });
  } catch (error) {
    console.error('Child registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const childLogin = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    console.log('Child login attempt for username:', username);
    console.log('Supabase URL check:', process.env.VITE_SUPABASE_URL ? 'OK' : 'MISSING');

    // Verify supabase is properly loaded
    if (!supabase) {
      console.error('ERROR: Supabase client is not initialized!');
      return res.status(500).json({ success: false, message: 'Database connection error' });
    }

    // Look up child by username
    let child, error;
    try {
      const result = await supabase
        .from('children')
        .select('id, username, display_name, level, total_stars, avatar_url, age, sex, current_streak, max_streak')
        .eq('username', username)
        .maybeSingle();

      child = result.data;
      error = result.error;
    } catch (dbError) {
      console.error('Database query exception:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        details: dbError.message
      });
    }

    if (error) {
      console.error('Child lookup error:', error);
      return res.status(500).json({ success: false, message: 'Database error', details: error.message });
    }

    if (!child) {
      console.log('Child not found for username:', username);
      return res.status(401).json({ success: false, message: 'Invalid username - child not found' });
    }

    console.log('Child login successful for:', child.username);

    const { generateAccessToken } = require('../utils/tokenManager');

    const accessToken = generateAccessToken(child.id, child.username, 'child');

    // Update last activity
    await supabase
      .from('children')
      .update({ last_activity_date: new Date().toISOString() })
      .eq('id', child.id);

    res.status(200).json({
      accessToken,
      user: {
        id: child.id,
        username: child.username,
        displayName: child.display_name,
        role: 'child',
        level: child.level,
        stars: child.total_stars,
        avatarUrl: child.avatar_url,
        currentStreak: child.current_streak,
        maxStreak: child.max_streak
      }
    });
  } catch (error) {
    console.error('Child login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      details: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    // Get child profile
    const { data: child, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    // Get achievements
    const { data: achievements } = await supabase
      .from('child_achievements')
      .select('achievement_id, unlocked_at, achievements(name, description, icon_url)')
      .eq('child_id', req.user.id);

    // Get notifications
    const { data: notifications } = await supabase
      .from('child_notifications')
      .select('*')
      .eq('child_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get leaderboard position
    const { data: leaderboard } = await supabase
      .from('leaderboards')
      .select('period, rank, stars')
      .eq('child_id', req.user.id)
      .order('calculated_at', { ascending: false })
      .limit(3);

    res.status(200).json({
      id: child.id,
      username: child.username,
      displayName: child.display_name,
      age: child.age,
      sex: child.sex,
      level: child.level,
      totalStars: child.total_stars,
      currentStreak: child.current_streak,
      maxStreak: child.max_streak,
      avatarUrl: child.avatar_url,
      lastActivityDate: child.last_activity_date,
      achievements: (achievements || []).map(a => ({
        id: a.achievement_id,
        name: a.achievements?.name,
        description: a.achievements?.description,
        iconUrl: a.achievements?.icon_url,
        unlockedAt: a.unlocked_at
      })),
      notifications: (notifications || []).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.created_at
      })),
      leaderboard: (leaderboard || []).map(l => ({
        period: l.period,
        rank: l.rank,
        stars: l.stars
      }))
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getNotificationPreferences = async (req, res) => {
  try {
    let { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!prefs) {
      const { data: newPrefs } = await supabase
        .from('notification_preferences')
        .insert({ user_id: req.user.id })
        .select()
        .single();
      prefs = newPrefs;
    }

    res.status(200).json({
      pushTips: prefs.push_tips,
      pushReminders: prefs.push_reminders,
      locale: prefs.locale,
      quietHours: {
        start: prefs.quiet_hours_start,
        end: prefs.quiet_hours_end,
        timezone: prefs.timezone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const { pushTips, pushReminders, locale, quietHours } = req.body;
    const updates = {};

    if (pushTips !== undefined) updates.push_tips = pushTips;
    if (pushReminders !== undefined) updates.push_reminders = pushReminders;
    if (locale) updates.locale = locale;
    if (quietHours?.start) updates.quiet_hours_start = quietHours.start;
    if (quietHours?.end) updates.quiet_hours_end = quietHours.end;
    if (quietHours?.timezone) updates.timezone = quietHours.timezone;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: req.user.id, ...updates })
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to update preferences' });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('lesson_id, lessons(id, title, description)')
      .eq('child_id', req.user.id);

    if (error) {
      console.error('Get favorites error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch favorites', details: error.message });
    }

    const truncateDescription = (desc, maxLength = 50) => {
      if (!desc) return '';
      if (desc.length <= maxLength) return desc;
      return desc.substring(0, maxLength).trim() + '...';
    };

    res.status(200).json({
      favorites: (favorites || []).map(f => ({
        lessonId: f.lesson_id,
        title: f.lessons?.title || 'Unknown',
        description: truncateDescription(f.lessons?.description, 50)
      }))
    });
  } catch (error) {
    console.error('Get favorites exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'lessonId is required' });
    }

    // Check if lesson exists
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError) {
      console.error('Lesson lookup error:', lessonError);
      return res.status(500).json({ success: false, message: 'Failed to verify lesson', details: lessonError.message });
    }

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('child_id', req.user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'Already in favorites' });
    }

    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert({ child_id: req.user.id, lesson_id: lessonId });

    if (error) {
      console.error('Add favorite error:', error);
      return res.status(500).json({ success: false, message: 'Failed to add favorite', details: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Added to favorites.'
    });
  } catch (error) {
    console.error('Add favorite exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const { error, count } = await supabase
      .from('favorites')
      .delete({ count: 'exact' })
      .eq('child_id', req.user.id)
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('Remove favorite error:', error);
      return res.status(500).json({ success: false, message: 'Failed to remove favorite', details: error.message });
    }

    if (count === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Removed from favorites.'
    });
  } catch (error) {
    console.error('Remove favorite exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const file = req.body.file; // Base64 encoded file
    const fileName = req.body.fileName || 'avatar.jpg';

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Validate file is an image
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only images allowed (jpg, png, gif, webp)'
      });
    }

    // Convert base64 to buffer
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Check file size (max 2MB)
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 2MB'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${req.user.id}_${timestamp}${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(uniqueFileName, buffer, {
        contentType: `image/${fileExt.replace('.', '')}`,
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uniqueFileName);

    const avatarUrl = urlData.publicUrl;

    // Update child profile with new avatar URL
    const { error: updateError } = await supabase
      .from('children')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Avatar uploaded but failed to update profile',
        details: updateError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Avatar upload exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, age, avatarUrl } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (displayName) updates.display_name = displayName;
    if (age) {
      if (age < 3 || age > 18) {
        return res.status(400).json({ success: false, message: 'Age must be between 3 and 18' });
      }
      updates.age = age;
    }
    if (avatarUrl) updates.avatar_url = avatarUrl;

    if (Object.keys(updates).length === 1) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const { error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', req.user.id);

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        details: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile exception:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const childLogout = async (req, res) => {
  try {
    const token = req.token;
    const userId = req.user.id;
    const { blacklistToken, revokeAllUserTokens } = require('../utils/tokenManager');

    await blacklistToken(token, userId, 'child');
    await revokeAllUserTokens(userId, 'child');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Child logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  registerChild,
  childLogin,
  childLogout,
  getProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  getFavorites,
  addFavorite,
  removeFavorite,
  uploadAvatar,
  updateProfile
};

const supabase = require('../config/supabase');

const dispatchCampaign = async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({ success: false, message: 'campaignId is required' });
    }

    const { data: campaign } = await supabase
      .from('notification_campaigns')
      .select('*, notification_templates(*)')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    let notificationsSent = 0;

    await supabase
      .from('notification_campaigns')
      .update({ status: 'sent' })
      .eq('id', campaignId);

    res.status(200).json({
      success: true,
      notificationsSent: notificationsSent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const notifyChild = async (req, res) => {
  try {
    const { childId, eventType, message } = req.body;

    if (!childId || !eventType || !message) {
      return res.status(400).json({ success: false, message: 'childId, eventType, and message are required' });
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        child_id: childId,
        type: eventType,
        message: message,
        is_read: false
      });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to send notification' });
    }

    res.status(200).json({
      success: true,
      deliveryStatus: 'queued'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const renderShareAsset = async (req, res) => {
  try {
    const { shareId } = req.body;

    if (!shareId) {
      return res.status(400).json({ success: false, message: 'shareId is required' });
    }

    const { data: shareable } = await supabase
      .from('shareables')
      .select('*')
      .eq('id', shareId)
      .single();

    if (!shareable) {
      return res.status(404).json({ success: false, message: 'Shareable not found' });
    }

    await supabase
      .from('shareables')
      .update({ status: 'processing' })
      .eq('id', shareId);

    const mockOutputUrl = `https://storage.example.com/shareables/${shareId}.png`;

    await supabase
      .from('shareables')
      .update({
        status: 'completed',
        download_url: mockOutputUrl,
        completed_at: new Date().toISOString()
      })
      .eq('id', shareId);

    res.status(200).json({
      success: true,
      outputUrl: mockOutputUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateLeaderboards = async (req, res) => {
  try {
    const { period } = req.body;

    if (!period || !['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ success: false, message: 'Valid period (daily, weekly, monthly) is required' });
    }

    await supabase
      .from('leaderboards')
      .delete()
      .eq('period', period);

    const { data: children } = await supabase
      .from('children')
      .select('id, total_stars')
      .order('total_stars', { ascending: false })
      .limit(100);

    const leaderboardEntries = (children || []).map((child, index) => ({
      child_id: child.id,
      period: period,
      rank: index + 1,
      stars: child.total_stars
    }));

    if (leaderboardEntries.length > 0) {
      await supabase
        .from('leaderboards')
        .insert(leaderboardEntries);
    }

    res.status(200).json({
      success: true,
      period: period,
      entriesCalculated: leaderboardEntries.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const checkAchievements = async (req, res) => {
  try {
    const { childId } = req.body;

    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId is required' });
    }

    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const achievementsUnlocked = [];

    res.status(200).json({
      success: true,
      achievementsUnlocked: achievementsUnlocked
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateStreaks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: children } = await supabase
      .from('children')
      .select('id, last_activity_date, current_streak');

    let streaksUpdated = 0;
    let streaksReset = 0;

    for (const child of children || []) {
      if (child.last_activity_date !== today && child.last_activity_date !== yesterdayStr) {
        if (child.current_streak > 0) {
          await supabase
            .from('children')
            .update({ current_streak: 0 })
            .eq('id', child.id);
          streaksReset++;
        }
      } else {
        streaksUpdated++;
      }
    }

    res.status(200).json({
      success: true,
      streaksUpdated: streaksUpdated,
      streaksReset: streaksReset
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  dispatchCampaign,
  notifyChild,
  renderShareAsset,
  updateLeaderboards,
  checkAchievements,
  updateStreaks
};

const supabase = require('../config/supabase');

const renderShareable = async (req, res) => {
  try {
    const { sourceType, sourceId, format } = req.body;

    if (!sourceType || !sourceId || !format) {
      return res.status(400).json({ success: false, message: 'sourceType, sourceId, and format are required' });
    }

    if (!['lesson', 'challenge', 'achievement'].includes(sourceType)) {
      return res.status(400).json({ success: false, message: 'Invalid source type' });
    }

    console.log('Creating share job for child:', req.user.id);

    const { data: shareable, error } = await supabase
      .from('shareables')
      .insert({
        child_id: req.user.id,
        source_type: sourceType,
        source_id: sourceId,
        format: format,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Share job creation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create share job', error: error.message });
    }

    console.log('Share job created:', shareable.id);

    res.status(202).json({
      shareId: shareable.id,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getShareableStatus = async (req, res) => {
  try {
    const { shareId } = req.params;

    const { data: shareable, error } = await supabase
      .from('shareables')
      .select('*')
      .eq('id', shareId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'Share job not found' });
    }

    res.status(200).json({
      status: shareable.status,
      downloadUrl: shareable.download_url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const trackShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { platform } = req.body;

    if (!platform) {
      return res.status(400).json({ success: false, message: 'platform is required' });
    }

    const { error } = await supabase
      .from('share_tracking')
      .insert({
        share_id: shareId,
        platform: platform
      });

    if (error) {
      return res.status(500).json({ success: false, message: 'Failed to track share' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  renderShareable,
  getShareableStatus,
  trackShare
};

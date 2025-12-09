const getHealth = async (req, res) => {
  try {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    res.status(200).json({
      status: 'ok',
      uptime: `${hours}h ${minutes}m`
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const getVersion = async (req, res) => {
  try {
    res.status(200).json({
      version: 'v1.0.0',
      releaseDate: '2025-11-04'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getHealth,
  getVersion
};

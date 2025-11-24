/**
 * Root endpoint - confirms deployment is working
 */
module.exports = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AutoLink API is running!",
    availableEndpoints: [
      "/api/cron/sales-nav-prospect",
      "/api/cron/warm-up-engagement", 
      "/api/cron/linkedin-daily",
      "/api/cron/linkedin-messaging"
    ]
  });
};

const HubSpotService = require('../../../lib/hubspot');
const LinkedInBot = require('../../../lib/linkedin-bot');
const AIContentGenerator = require('../../../lib/ai-content');

/**
 * Daily LinkedIn Connection Request Automation
 * Runs at 9 AM daily
 * Processes up to 25 connection requests per day
 */
module.exports = async (req, res) => {
  // Support both Authorization header and query parameter for testing
  const authHeader = req.headers.authorization;
  const querySecret = req.query.secret;
  
  const isAuthorized = 
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    querySecret === process.env.CRON_SECRET;
  
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔄 Starting daily LinkedIn connection automation...');

  const hubspot = new HubSpotService();
  const bot = new LinkedInBot();
  const ai = new AIContentGenerator();

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  try {
    // Initialize browser and login
    await bot.initialize();

    // Get contacts ready for connection
    const MAX_DAILY_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS_PER_DAY || '25');
    const contacts = await hubspot.getContactsForConnection(MAX_DAILY_CONNECTIONS);

    console.log(`📋 Found ${contacts.length} contacts ready for connection`);

    for (const contact of contacts) {
      try {
        const linkedinUrl = contact.properties.hs_linkedin_url;
        
        if (!linkedinUrl) {
          console.log(`⚠️  Skipping ${contact.properties.firstname} - no LinkedIn URL`);
          await hubspot.updateContact(contact.id, {
            linkedin_automation_status: 'error_no_url'
          });
          continue;
        }

        // Generate personalized connection message
        const icebreaker = contact.properties.icebreaker;
        const connectionMessage = await ai.generateConnectionMessage({
          firstname: contact.properties.firstname,
          lastname: contact.properties.lastname,
          jobtitle: contact.properties.jobtitle,
          company: contact.properties.company
        }, icebreaker);

        console.log(`\n--- Processing: ${contact.properties.firstname} ${contact.properties.lastname} ---`);
        console.log(`Message: ${connectionMessage}`);

        // Send connection request
        const result = await bot.sendConnectionRequest(linkedinUrl, connectionMessage);

        if (result.success) {
          // Update HubSpot
          await hubspot.updateContact(contact.id, {
            linkedin_automation_status: 'connection_pending',
            linkedin_last_activity: new Date().toISOString(),
            linkedin_connection_message: connectionMessage
          });

          // Log activity
          await hubspot.logEngagement(
            contact.id,
            'LinkedIn Connection Request Sent',
            `Automated connection request sent with message:\n\n"${connectionMessage}"`
          );

          successCount++;
          results.push({
            contact: `${contact.properties.firstname} ${contact.properties.lastname}`,
            status: 'success'
          });

          console.log(`✅ Success for ${contact.properties.firstname}`);

        } else {
          // Handle failure
          await hubspot.updateContact(contact.id, {
            linkedin_automation_status: 'connection_failed',
            linkedin_last_error: result.reason
          });

          errorCount++;
          results.push({
            contact: `${contact.properties.firstname} ${contact.properties.lastname}`,
            status: 'failed',
            reason: result.reason
          });

          console.log(`❌ Failed for ${contact.properties.firstname}: ${result.reason}`);
        }

        // Random delay between requests (2-5 seconds)
        const delayMin = parseInt(process.env.DELAY_MIN_MS || '2000');
        const delayMax = parseInt(process.env.DELAY_MAX_MS || '5000');
        await bot.randomDelay(delayMin, delayMax);

      } catch (error) {
        console.error(`Error processing contact ${contact.id}:`, error);
        errorCount++;
        results.push({
          contact: contact.id,
          status: 'error',
          reason: error.message
        });
      }
    }

  } catch (error) {
    console.error('Fatal error in LinkedIn automation:', error);
    return res.status(500).json({
      error: 'Automation failed',
      message: error.message
    });
  } finally {
    // Always close the browser
    await bot.close();
  }

  console.log(`\n✅ Automation complete: ${successCount} successful, ${errorCount} failed`);

  return res.status(200).json({
    success: true,
    processed: contacts.length,
    successful: successCount,
    failed: errorCount,
    results
  });
};

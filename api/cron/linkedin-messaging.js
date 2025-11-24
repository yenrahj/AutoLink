const HubSpotService = require('../../../lib/hubspot');
const LinkedInBot = require('../../../lib/linkedin-bot');
const AIContentGenerator = require('../../../lib/ai-content');

/**
 * LinkedIn Messaging Automation for Accepted Connections
 * Runs at 10 AM and 2 PM daily
 * Processes up to 50 messages per run
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

  console.log('💬 Starting LinkedIn messaging automation...');

  const hubspot = new HubSpotService();
  const bot = new LinkedInBot();
  const ai = new AIContentGenerator();

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  try {
    // Initialize browser and login
    await bot.initialize();

    // Get contacts ready for messaging
    const MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES_PER_DAY || '50');
    const contacts = await hubspot.getContactsForMessaging(MAX_MESSAGES);

    console.log(`📋 Found ${contacts.length} contacts ready for messaging`);

    for (const contact of contacts) {
      try {
        const linkedinUrl = contact.properties.hs_linkedin_url;
        
        if (!linkedinUrl) {
          console.log(`⚠️  Skipping ${contact.properties.firstname} - no LinkedIn URL`);
          continue;
        }

        // Generate personalized follow-up message
        const emailBody = contact.properties.email_body_v1; // Use their generated email content
        const followUpMessage = await ai.generateFollowUpMessage({
          firstname: contact.properties.firstname,
          lastname: contact.properties.lastname,
          jobtitle: contact.properties.jobtitle,
          company: contact.properties.company
        }, emailBody);

        console.log(`\n--- Messaging: ${contact.properties.firstname} ${contact.properties.lastname} ---`);
        console.log(`Message: ${followUpMessage}`);

        // Send message
        const result = await bot.sendMessage(linkedinUrl, followUpMessage);

        if (result.success) {
          // Update HubSpot
          await hubspot.updateContact(contact.id, {
            linkedin_automation_status: 'message_sent',
            linkedin_last_activity: new Date().toISOString(),
            linkedin_message_content: followUpMessage
          });

          // Log activity
          await hubspot.logEngagement(
            contact.id,
            'LinkedIn Message Sent',
            `Automated follow-up message sent:\n\n"${followUpMessage}"`
          );

          successCount++;
          results.push({
            contact: `${contact.properties.firstname} ${contact.properties.lastname}`,
            status: 'success'
          });

          console.log(`✅ Message sent to ${contact.properties.firstname}`);

        } else {
          // Handle failure
          await hubspot.updateContact(contact.id, {
            linkedin_automation_status: 'message_failed',
            linkedin_last_error: result.reason
          });

          errorCount++;
          results.push({
            contact: `${contact.properties.firstname} ${contact.properties.lastname}`,
            status: 'failed',
            reason: result.reason
          });

          console.log(`❌ Failed to message ${contact.properties.firstname}: ${result.reason}`);
        }

        // Random delay between messages
        const delayMin = parseInt(process.env.DELAY_MIN_MS || '2000');
        const delayMax = parseInt(process.env.DELAY_MAX_MS || '5000');
        await bot.randomDelay(delayMin, delayMax);

      } catch (error) {
        console.error(`Error processing contact ${contact.id}:`, error);
        errorCount++;
      }
    }

  } catch (error) {
    console.error('Fatal error in messaging automation:', error);
    return res.status(500).json({
      error: 'Messaging failed',
      message: error.message
    });
  } finally {
    await bot.close();
  }

  console.log(`\n✅ Messaging complete: ${successCount} successful, ${errorCount} failed`);

  return res.status(200).json({
    success: true,
    processed: contacts.length,
    successful: successCount,
    failed: errorCount,
    results
  });
};

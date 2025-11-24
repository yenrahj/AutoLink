const HubSpotService = require('../../lib/hubspot');
const LinkedInBot = require('../../lib/linkedin-bot');
const AIContentGenerator = require('../../lib/ai-content');

/**
 * LinkedIn Warm-Up Engagement Automation
 * Runs at 11 AM daily
 * Engages with prospects' content 3-7 days before connection request
 * This builds familiarity and increases connection acceptance rate
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

  console.log('🔥 Starting warm-up engagement automation...');

  const hubspot = new HubSpotService();
  const bot = new LinkedInBot();
  const ai = new AIContentGenerator();

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  try {
    // Initialize browser and login
    await bot.initialize();

    // Get contacts in warm-up phase
    const contacts = await hubspot.getContactsForWarmUp(30);

    console.log(`📋 Found ${contacts.length} contacts in warm-up phase`);

    for (const contact of contacts) {
      try {
        const linkedinUrl = contact.properties.hs_linkedin_url;
        const warmUpCount = parseInt(contact.properties.linkedin_warm_up_count || '0');
        
        if (!linkedinUrl) {
          console.log(`⚠️  Skipping ${contact.properties.firstname} - no LinkedIn URL`);
          continue;
        }

        console.log(`\n--- Warm-up for: ${contact.properties.firstname} ${contact.properties.lastname} ---`);
        console.log(`Current warm-up count: ${warmUpCount}/3`);

        // Navigate to their recent activity
        await bot.page.goto(`${linkedinUrl}/recent-activity/all/`, { 
          waitUntil: 'networkidle2' 
        });
        await bot.randomDelay(2000, 3000);

        // Try to get first post content for analysis
        let postContent = '';
        try {
          const postElement = await bot.page.$('.feed-shared-update-v2__description');
          if (postElement) {
            postContent = await bot.page.evaluate(el => el.textContent, postElement);
            postContent = postContent.trim().substring(0, 500); // First 500 chars
          }
        } catch (e) {
          console.log('Could not extract post content');
        }

        // Decide engagement strategy
        let engagementType = 'like'; // Default to like
        let shouldComment = false;

        if (postContent && warmUpCount < 2) {
          // For first 2 engagements, analyze if we should comment
          const analysis = await ai.shouldEngageWithPost(postContent);
          
          if (analysis.shouldEngage && analysis.engagement_type === 'comment') {
            shouldComment = true;
            engagementType = 'comment';
          }
        }

        // Execute engagement
        let result;
        if (shouldComment) {
          // Generate and post comment
          const comment = await ai.generateComment(postContent, {
            firstname: contact.properties.firstname,
            lastname: contact.properties.lastname,
            jobtitle: contact.properties.jobtitle,
            company: contact.properties.company
          });

          if (comment) {
            result = await bot.commentOnRecentPost(linkedinUrl, comment);
            
            if (result.success) {
              console.log(`💬 Posted comment: "${comment}"`);
              
              await hubspot.logEngagement(
                contact.id,
                'LinkedIn Warm-Up - Comment',
                `Commented on recent post:\n\n"${comment}"\n\nPost excerpt: "${postContent.substring(0, 200)}..."`
              );
            }
          } else {
            // Fallback to like if comment generation failed
            result = await bot.likeRecentPost(linkedinUrl);
            engagementType = 'like';
          }
        } else {
          // Just like the post
          result = await bot.likeRecentPost(linkedinUrl);
        }

        if (result.success) {
          const newWarmUpCount = warmUpCount + 1;
          
          // Determine next status
          let nextStatus = 'warm_up_phase';
          if (newWarmUpCount >= 3) {
            // After 3 engagements, move to ready for connection
            nextStatus = 'ready_for_connection';
          }

          // Update HubSpot
          await hubspot.updateContact(contact.id, {
            linkedin_automation_status: nextStatus,
            linkedin_warm_up_count: newWarmUpCount,
            linkedin_last_activity: new Date().toISOString(),
            linkedin_last_engagement_type: engagementType
          });

          successCount++;
          results.push({
            contact: `${contact.properties.firstname} ${contact.properties.lastname}`,
            status: 'success',
            engagement: engagementType,
            warmUpCount: newWarmUpCount
          });

          console.log(`✅ ${engagementType} successful - Count: ${newWarmUpCount}/3`);
          
          if (nextStatus === 'ready_for_connection') {
            console.log(`🎯 Contact ready for connection request!`);
          }

        } else {
          errorCount++;
          results.push({
            contact: `${contact.properties.firstname} ${contact.properties.lastname}`,
            status: 'failed',
            reason: result.reason
          });

          console.log(`❌ Engagement failed: ${result.reason}`);
        }

        // Longer delay between engagements to appear more natural
        await bot.randomDelay(3000, 6000);

      } catch (error) {
        console.error(`Error processing contact ${contact.id}:`, error);
        errorCount++;
      }
    }

  } catch (error) {
    console.error('Fatal error in warm-up automation:', error);
    return res.status(500).json({
      error: 'Warm-up automation failed',
      message: error.message
    });
  } finally {
    await bot.close();
  }

  console.log(`\n✅ Warm-up complete: ${successCount} successful, ${errorCount} failed`);

  return res.status(200).json({
    success: true,
    processed: contacts.length,
    successful: successCount,
    failed: errorCount,
    results
  });
};

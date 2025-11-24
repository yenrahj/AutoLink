const HubSpotService = require('../../../lib/hubspot');
const SalesNavigatorBot = require('../../../lib/sales-navigator');

/**
 * Weekly Sales Navigator Sync
 * Runs every Monday at 8 AM
 * Syncs prospects from Sales Navigator saved searches to HubSpot
 */
module.exports = async (req, res) => {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔄 Starting Sales Navigator sync...');

  const hubspot = new HubSpotService();
  const bot = new SalesNavigatorBot();

  let totalSynced = 0;
  const results = {
    newProspects: 0,
    updated: 0,
    errors: 0
  };

  try {
    // Initialize browser and login
    await bot.initialize();

    // Define your saved searches to sync from
    const savedSearches = [
      'Target HR Leaders',
      'Target L&D Executives', 
      'Target Benefits Leaders'
    ];

    for (const searchName of savedSearches) {
      try {
        console.log(`\n📊 Processing saved search: ${searchName}`);

        // Navigate to the saved search
        await bot.page.goto('https://www.linkedin.com/sales/search/people', {
          waitUntil: 'networkidle2'
        });
        await bot.randomDelay(2000, 3000);

        // Select the saved search
        const searchDropdown = await bot.page.$('button[data-test-saved-search-dropdown]');
        if (searchDropdown) {
          await searchDropdown.click();
          await bot.randomDelay(500, 1000);

          const searchOption = await bot.page.$(`[data-test-search-name="${searchName}"]`);
          if (searchOption) {
            await searchOption.click();
            await bot.randomDelay(2000, 3000);
          }
        }

        // Scrape first 25 results
        const prospects = await bot.page.$$eval('.artdeco-list__item', items => {
          return items.slice(0, 25).map(item => {
            try {
              const nameElement = item.querySelector('.artdeco-entity-lockup__title a');
              const titleElement = item.querySelector('.artdeco-entity-lockup__subtitle');
              const companyElement = item.querySelector('.artdeco-entity-lockup__caption');
              const locationElement = item.querySelector('.artdeco-entity-lockup__badge');
              
              const profileUrl = nameElement?.href || '';
              const salesNavUrl = profileUrl.replace('/in/', '/sales/people/');
              
              return {
                name: nameElement?.textContent?.trim() || '',
                profileUrl: profileUrl,
                salesNavUrl: salesNavUrl,
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || ''
              };
            } catch (e) {
              return null;
            }
          }).filter(Boolean);
        });

        console.log(`Found ${prospects.length} prospects in ${searchName}`);

        // Process each prospect
        for (const prospect of prospects) {
          try {
            // Check if contact already exists in HubSpot
            const existingContacts = await hubspot.client.crm.contacts.searchApi.doSearch({
              filterGroups: [{
                filters: [{
                  propertyName: 'hs_linkedin_url',
                  operator: 'EQ',
                  value: prospect.profileUrl
                }]
              }],
              limit: 1
            });

            if (existingContacts.results.length > 0) {
              // Contact exists, just update Sales Nav data
              const contactId = existingContacts.results[0].id;
              
              await hubspot.updateContact(contactId, {
                sales_nav_profile_url: prospect.salesNavUrl,
                jobtitle: prospect.title,
                company: prospect.company
              });

              results.updated++;
              console.log(`✓ Updated existing: ${prospect.name}`);

            } else {
              // New contact - create in HubSpot
              const [firstname, ...lastnameArr] = prospect.name.split(' ');
              const lastname = lastnameArr.join(' ');

              const createResponse = await hubspot.client.crm.contacts.basicApi.create({
                properties: {
                  firstname: firstname,
                  lastname: lastname,
                  jobtitle: prospect.title,
                  company: prospect.company,
                  hs_linkedin_url: prospect.profileUrl,
                  sales_nav_profile_url: prospect.salesNavUrl,
                  city: prospect.location,
                  linkedin_automation_status: 'warm_up_phase',
                  lifecyclestage: 'lead',
                  lead_source: `Sales Navigator - ${searchName}`
                }
              });

              results.newProspects++;
              totalSynced++;
              console.log(`✓ Created new contact: ${prospect.name}`);

              // Get Sales Navigator insights for new prospects
              if (process.env.SALES_NAV_INSIGHTS === 'true') {
                const insights = await bot.getProspectInsights(prospect.salesNavUrl);
                
                if (insights) {
                  // Format insights for HubSpot
                  const insightsText = `
Connection: ${insights.connectionDegree || 'Unknown'}

Shared Connections: ${insights.sharedConnections?.join(', ') || 'None'}

Talking Points:
${insights.talkingPoints?.join('\n') || 'None'}

Recent Activities:
${insights.recentActivities?.map(a => `${a.type}: ${a.description} (${a.date})`).join('\n') || 'None'}
                  `.trim();

                  await hubspot.updateContact(createResponse.id, {
                    sales_nav_insights: insightsText,
                    connection_path: insights.connectionDegree,
                    shared_connections: insights.sharedConnections?.join(', ')
                  });
                }
              }

              // Add to Sales Navigator list
              if (process.env.SALES_NAV_LIST_WARMUP) {
                await bot.saveToList(
                  prospect.salesNavUrl, 
                  process.env.SALES_NAV_LIST_WARMUP
                );
              }
            }

            // Delay between prospects
            await bot.randomDelay(2000, 4000);

          } catch (error) {
            console.error(`Error processing prospect ${prospect.name}:`, error);
            results.errors++;
          }
        }

      } catch (error) {
        console.error(`Error processing saved search ${searchName}:`, error);
        results.errors++;
      }
    }

  } catch (error) {
    console.error('Fatal error in Sales Navigator sync:', error);
    return res.status(500).json({
      error: 'Sync failed',
      message: error.message
    });
  } finally {
    await bot.close();
  }

  console.log(`\n✅ Sales Navigator sync complete!`);
  console.log(`   New prospects: ${results.newProspects}`);
  console.log(`   Updated: ${results.updated}`);
  console.log(`   Errors: ${results.errors}`);

  return res.status(200).json({
    success: true,
    totalSynced,
    results
  });
};

const HubSpotService = require('../../../lib/hubspot');
const SalesNavigatorBot = require('../../../lib/sales-navigator');
const AIContentGenerator = require('../../../lib/ai-content');

/**
 * Sales Navigator Prospecting & Enrichment
 * No Clay/PeopleGPT required - all done in Sales Navigator
 * 
 * This cron job:
 * 1. Searches Sales Navigator with your filters
 * 2. Extracts prospect data + insights
 * 3. Uses AI to generate icebreakers from Sales Nav data
 * 4. Imports to HubSpot with everything ready
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

  console.log('🔍 Starting Sales Navigator prospecting...');

  const hubspot = new HubSpotService();
  const bot = new SalesNavigatorBot();
  const ai = new AIContentGenerator();

  let totalProspects = 0;
  const results = {
    newProspects: 0,
    updated: 0,
    errors: 0,
    skipped: 0
  };

  try {
    await bot.initialize();

    // Define your search criteria (customize these)
    const searches = [
      {
        name: 'HR Leaders - Tech',
        filters: {
          keywords: 'CHRO OR "VP HR" OR "Head of HR" OR "HR Director"',
          industry: ['Computer Software', 'Information Technology'],
          seniority: ['VP', 'CXO', 'Director'],
          company_headcount: ['501-1000', '1001-5000', '5001-10000'],
          geography: 'United States'
        },
        persona: 'HR Executive'
      },
      {
        name: 'L&D Leaders',
        filters: {
          keywords: 'Learning OR "Talent Development" OR "L&D" OR Training',
          seniority: ['VP', 'Director', 'Manager'],
          company_headcount: ['1001-5000', '5001-10000'],
          geography: 'United States'
        },
        persona: 'L&D Leader'
      }
    ];

    for (const search of searches) {
      try {
        console.log(`\n🎯 Running search: ${search.name}`);

        // Navigate to Sales Navigator People Search
        await bot.page.goto('https://www.linkedin.com/sales/search/people', {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        await bot.randomDelay(2000, 3000);

        // Apply search filters
        console.log('Applying filters...');
        
        // Keywords search
        if (search.filters.keywords) {
          const searchInput = await bot.page.$('input[placeholder*="Search"]');
          if (searchInput) {
            await searchInput.click();
            await bot.randomDelay(300, 500);
            await searchInput.type(search.filters.keywords, { delay: 100 });
            await bot.randomDelay(500, 1000);
            await searchInput.press('Enter');
            await bot.randomDelay(3000, 4000);
          }
        }

        // Scrape results with enhanced data
        console.log('Extracting prospect data...');
        
        const prospects = await bot.page.evaluate(() => {
          const results = [];
          const listItems = document.querySelectorAll('li.artdeco-list__item');
          
          for (const item of Array.from(listItems).slice(0, 25)) {
            try {
              // Basic info
              const nameLink = item.querySelector('a[data-test-link-to-profile-link]');
              const name = nameLink?.textContent?.trim();
              const profileUrl = nameLink?.href;
              
              // Title and company
              const subtitle = item.querySelector('.artdeco-entity-lockup__subtitle');
              const title = subtitle?.textContent?.trim();
              
              const caption = item.querySelector('.artdeco-entity-lockup__caption');
              const company = caption?.textContent?.trim();
              
              // Location
              const metadata = item.querySelector('.artdeco-entity-lockup__metadata');
              const location = metadata?.textContent?.trim();
              
              // Premium insights (if visible)
              const insightBadges = item.querySelectorAll('.search-results__badge-text');
              const badges = Array.from(insightBadges).map(b => b.textContent.trim());
              
              if (name && profileUrl) {
                results.push({
                  name,
                  profileUrl,
                  salesNavUrl: profileUrl,
                  title: title || '',
                  company: company || '',
                  location: location || '',
                  badges: badges,
                  extractedAt: new Date().toISOString()
                });
              }
            } catch (e) {
              console.error('Error extracting prospect:', e);
            }
          }
          
          return results;
        });

        console.log(`✓ Found ${prospects.length} prospects`);

        // Process each prospect
        for (const prospect of prospects) {
          try {
            console.log(`\nProcessing: ${prospect.name}`);

            // Check if already in HubSpot
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
              console.log('  ↳ Already in HubSpot, skipping');
              results.skipped++;
              continue;
            }

            // Navigate to prospect's Sales Nav profile
            await bot.page.goto(prospect.salesNavUrl, {
              waitUntil: 'networkidle2',
              timeout: 30000
            });
            await bot.randomDelay(2000, 3000);

            // Extract detailed insights from Sales Navigator profile page
            console.log('  ↳ Extracting insights...');
            
            const detailedInsights = await bot.page.evaluate(() => {
              const insights = {};
              
              try {
                // About section
                const about = document.querySelector('.about-section');
                insights.about = about?.textContent?.trim()?.substring(0, 500);
                
                // Recent activities
                const activities = [];
                const activityItems = document.querySelectorAll('.activity-item');
                for (const item of Array.from(activityItems).slice(0, 3)) {
                  const text = item.textContent.trim();
                  if (text) activities.push(text);
                }
                insights.recentActivities = activities;
                
                // Company info
                const companyInfo = document.querySelector('.company-info');
                insights.companyInfo = companyInfo?.textContent?.trim();
                
                // Shared connections
                const sharedConns = [];
                const connElements = document.querySelectorAll('.shared-connections-list a');
                for (const conn of Array.from(connElements).slice(0, 3)) {
                  sharedConns.push(conn.textContent.trim());
                }
                insights.sharedConnections = sharedConns;
                
                // Connection degree
                const degree = document.querySelector('.connection-degree');
                insights.connectionDegree = degree?.textContent?.trim();
                
                // Talking points / news
                const talkingPoints = [];
                const tpElements = document.querySelectorAll('.talking-point-card');
                for (const tp of Array.from(tpElements).slice(0, 3)) {
                  const title = tp.querySelector('.talking-point-title')?.textContent?.trim();
                  if (title) talkingPoints.push(title);
                }
                insights.talkingPoints = talkingPoints;
                
              } catch (e) {
                console.error('Error extracting detailed insights:', e);
              }
              
              return insights;
            });

            console.log('  ↳ Generating AI icebreaker...');
            
            // Generate icebreaker using Sales Nav data (replaces Clay)
            const icebreaker = await ai.generateIcebreakerFromSalesNav({
              name: prospect.name,
              title: prospect.title,
              company: prospect.company,
              about: detailedInsights.about,
              recentActivities: detailedInsights.recentActivities,
              talkingPoints: detailedInsights.talkingPoints,
              sharedConnections: detailedInsights.sharedConnections
            });

            // Parse name
            const [firstname, ...lastnameArr] = prospect.name.split(' ');
            const lastname = lastnameArr.join(' ') || firstname;

            // Create contact in HubSpot
            console.log('  ↳ Creating in HubSpot...');
            
            const newContact = await hubspot.client.crm.contacts.basicApi.create({
              properties: {
                firstname,
                lastname,
                jobtitle: prospect.title,
                company: prospect.company,
                city: prospect.location.split(',')[0]?.trim(),
                state: prospect.location.split(',')[1]?.trim(),
                
                // LinkedIn
                hs_linkedin_url: prospect.profileUrl,
                sales_nav_profile_url: prospect.salesNavUrl,
                
                // AI-generated icebreaker (replaces Clay)
                icebreaker: icebreaker,
                
                // Sales Nav insights
                sales_nav_insights: JSON.stringify(detailedInsights, null, 2),
                connection_path: detailedInsights.connectionDegree,
                shared_connections: detailedInsights.sharedConnections?.join(', '),
                
                // Automation setup
                linkedin_automation_status: 'warm_up_phase',
                linkedin_warm_up_count: 0,
                
                // Source tracking
                lifecyclestage: 'lead',
                lead_source: `Sales Navigator - ${search.name}`,
                persona: search.persona
              }
            });

            results.newProspects++;
            totalProspects++;
            
            console.log(`  ✓ Created: ${prospect.name}`);
            console.log(`     Icebreaker: ${icebreaker.substring(0, 60)}...`);

            // Delay between prospects
            await bot.randomDelay(3000, 5000);

          } catch (error) {
            console.error(`  ✗ Error processing ${prospect.name}:`, error.message);
            results.errors++;
          }
        }

        // Delay between searches
        await bot.randomDelay(5000, 8000);

      } catch (error) {
        console.error(`Error with search ${search.name}:`, error);
        results.errors++;
      }
    }

  } catch (error) {
    console.error('Fatal error in prospecting:', error);
    return res.status(500).json({
      error: 'Prospecting failed',
      message: error.message
    });
  } finally {
    await bot.close();
  }

  console.log('\n✅ Prospecting complete!');
  console.log(`   New prospects: ${results.newProspects}`);
  console.log(`   Skipped (existing): ${results.skipped}`);
  console.log(`   Errors: ${results.errors}`);

  return res.status(200).json({
    success: true,
    totalProspects,
    results
  });
};

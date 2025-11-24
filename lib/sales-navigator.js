const LinkedInBot = require('./linkedin-bot');

class SalesNavigatorBot extends LinkedInBot {
  /**
   * Sales Navigator specific features
   * Extends the base LinkedInBot with premium functionality
   */

  /**
   * Search prospects using Sales Navigator filters
   */
  async searchSalesNavigator(filters) {
    try {
      console.log('🔍 Searching Sales Navigator with filters...');
      
      // Navigate to Sales Navigator search
      await this.page.goto('https://www.linkedin.com/sales/search/people', {
        waitUntil: 'networkidle2'
      });
      await this.randomDelay(2000, 3000);

      const results = [];

      // Apply filters if provided
      if (filters.geography) {
        await this.applySalesNavFilter('geography', filters.geography);
      }

      if (filters.industry) {
        await this.applySalesNavFilter('industry', filters.industry);
      }

      if (filters.seniority) {
        await this.applySalesNavFilter('seniority', filters.seniority);
      }

      if (filters.company_headcount) {
        await this.applySalesNavFilter('companyHeadcount', filters.company_headcount);
      }

      if (filters.keywords) {
        await this.searchByKeywords(filters.keywords);
      }

      await this.randomDelay(2000, 3000);

      // Scrape search results
      const profiles = await this.page.$$eval('.artdeco-list__item', items => {
        return items.slice(0, 25).map(item => {
          try {
            const nameElement = item.querySelector('.artdeco-entity-lockup__title a');
            const titleElement = item.querySelector('.artdeco-entity-lockup__subtitle');
            const companyElement = item.querySelector('.artdeco-entity-lockup__caption');
            
            return {
              name: nameElement?.textContent?.trim() || '',
              profileUrl: nameElement?.href || '',
              title: titleElement?.textContent?.trim() || '',
              company: companyElement?.textContent?.trim() || ''
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      });

      console.log(`✅ Found ${profiles.length} prospects in Sales Navigator`);
      return profiles;

    } catch (error) {
      console.error('Error searching Sales Navigator:', error);
      throw error;
    }
  }

  /**
   * Apply a specific Sales Navigator filter
   */
  async applySalesNavFilter(filterType, value) {
    try {
      // Click filter dropdown
      const filterButton = await this.page.$(`button[data-test-filter-type="${filterType}"]`);
      if (filterButton) {
        await filterButton.click();
        await this.randomDelay(500, 1000);

        // Select value (implementation depends on filter type)
        const valueOption = await this.page.$(`[data-test-filter-value="${value}"]`);
        if (valueOption) {
          await valueOption.click();
          await this.randomDelay(500, 1000);
        }

        // Apply filter
        const applyButton = await this.page.$('button[data-test-filter-apply]');
        if (applyButton) {
          await applyButton.click();
          await this.randomDelay(1000, 1500);
        }
      }
    } catch (error) {
      console.error(`Error applying filter ${filterType}:`, error);
    }
  }

  /**
   * Search by keywords in Sales Navigator
   */
  async searchByKeywords(keywords) {
    try {
      const searchBox = await this.page.$('input[placeholder*="Search"]');
      if (searchBox) {
        await searchBox.click();
        await this.randomDelay(300, 500);
        
        await searchBox.type(keywords, { delay: 100 });
        await this.randomDelay(500, 1000);
        
        await searchBox.press('Enter');
        await this.randomDelay(2000, 3000);
      }
    } catch (error) {
      console.error('Error searching by keywords:', error);
    }
  }

  /**
   * Save prospect to a Sales Navigator list
   */
  async saveToList(profileUrl, listName) {
    try {
      console.log(`💾 Saving prospect to list: ${listName}`);

      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(1000, 2000);

      // Click "Save" button
      const saveButton = await this.page.$('button[aria-label*="Save"]');
      if (saveButton) {
        await saveButton.click();
        await this.randomDelay(1000, 1500);

        // Select list
        const listOption = await this.page.$(`button[data-test-list-name="${listName}"]`);
        if (listOption) {
          await listOption.click();
          await this.randomDelay(500, 1000);
          
          console.log('✅ Saved to list successfully');
          return { success: true };
        }
      }

      return { success: false, reason: 'save_button_not_found' };

    } catch (error) {
      console.error('Error saving to list:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Get Sales Navigator insights for a prospect
   */
  async getProspectInsights(profileUrl) {
    try {
      console.log('📊 Getting Sales Navigator insights...');

      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(2000, 3000);

      const insights = await this.page.evaluate(() => {
        const data = {};

        // Extract insights from Sales Navigator view
        try {
          // Get "How you're connected"
          const connectionPath = document.querySelector('.connection-path');
          if (connectionPath) {
            data.connectionDegree = connectionPath.textContent.trim();
          }

          // Get recent activities
          const activities = document.querySelectorAll('.activity-item');
          data.recentActivities = Array.from(activities).slice(0, 5).map(item => ({
            type: item.querySelector('.activity-type')?.textContent?.trim(),
            description: item.querySelector('.activity-description')?.textContent?.trim(),
            date: item.querySelector('.activity-date')?.textContent?.trim()
          }));

          // Get talking points / news
          const talkingPoints = document.querySelectorAll('.talking-point');
          data.talkingPoints = Array.from(talkingPoints).map(point => 
            point.textContent.trim()
          );

          // Get shared connections
          const sharedConnections = document.querySelectorAll('.shared-connection');
          data.sharedConnections = Array.from(sharedConnections).slice(0, 3).map(conn =>
            conn.querySelector('.connection-name')?.textContent?.trim()
          );

        } catch (e) {
          console.error('Error extracting insights:', e);
        }

        return data;
      });

      console.log('✅ Retrieved Sales Navigator insights');
      return insights;

    } catch (error) {
      console.error('Error getting prospect insights:', error);
      return null;
    }
  }

  /**
   * Send InMail message (Sales Navigator premium feature)
   */
  async sendInMail(profileUrl, subject, message) {
    try {
      console.log('📧 Sending InMail message...');

      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(1000, 2000);

      // Click InMail button
      const inMailButton = await this.page.$('button[aria-label*="InMail"]');
      
      if (!inMailButton) {
        console.log('⚠️ InMail button not found - may not have credits or wrong profile');
        return { success: false, reason: 'inmail_not_available' };
      }

      await inMailButton.click();
      await this.randomDelay(1500, 2000);

      // Fill in subject
      const subjectField = await this.page.$('input[name="subject"]');
      if (subjectField) {
        await subjectField.type(subject, { delay: 50 });
        await this.randomDelay(500, 1000);
      }

      // Fill in message body
      const messageField = await this.page.$('textarea[name="message"]');
      if (messageField) {
        await messageField.click();
        await this.randomDelay(300, 500);
        
        await messageField.type(message, { delay: 50 });
        await this.randomDelay(1000, 1500);
      }

      // Send InMail
      const sendButton = await this.page.$('button[type="submit"]');
      if (sendButton) {
        await sendButton.click();
        await this.randomDelay(2000, 3000);
        
        console.log('✅ InMail sent successfully');
        return { success: true };
      }

      return { success: false, reason: 'send_button_not_found' };

    } catch (error) {
      console.error('Error sending InMail:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Check if prospect has had recent job change
   */
  async checkJobChange(profileUrl) {
    try {
      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(1000, 2000);

      const jobChangeInfo = await this.page.evaluate(() => {
        // Look for "Started new position" indicator
        const newPositionBadge = document.querySelector('[data-test-id="new-position-badge"]');
        
        if (newPositionBadge) {
          const timeElement = document.querySelector('.time-since-new-position');
          const timeSince = timeElement?.textContent?.trim();
          
          // Extract days/weeks
          const match = timeSince?.match(/(\d+)\s+(day|week|month)/);
          if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            
            return {
              hasRecentJobChange: true,
              timeSince: timeSince,
              isWithin30Days: (unit === 'day' && value <= 30) || (unit === 'week' && value <= 4)
            };
          }
        }

        return { hasRecentJobChange: false };
      });

      return jobChangeInfo;

    } catch (error) {
      console.error('Error checking job change:', error);
      return { hasRecentJobChange: false };
    }
  }

  /**
   * Get recommended leads from Sales Navigator
   */
  async getRecommendedLeads(count = 25) {
    try {
      console.log('🎯 Getting recommended leads from Sales Navigator...');

      await this.page.goto('https://www.linkedin.com/sales/home', {
        waitUntil: 'networkidle2'
      });
      await this.randomDelay(2000, 3000);

      // Navigate to recommended leads section
      const recommendedSection = await this.page.$('[data-test-id="recommended-leads"]');
      if (recommendedSection) {
        await recommendedSection.click();
        await this.randomDelay(2000, 3000);
      }

      const leads = await this.page.$$eval('.recommended-lead-card', cards => {
        return cards.slice(0, 25).map(card => ({
          name: card.querySelector('.lead-name')?.textContent?.trim(),
          title: card.querySelector('.lead-title')?.textContent?.trim(),
          company: card.querySelector('.lead-company')?.textContent?.trim(),
          profileUrl: card.querySelector('a.lead-link')?.href,
          reason: card.querySelector('.recommendation-reason')?.textContent?.trim()
        }));
      });

      console.log(`✅ Found ${leads.length} recommended leads`);
      return leads.slice(0, count);

    } catch (error) {
      console.error('Error getting recommended leads:', error);
      return [];
    }
  }
}

module.exports = SalesNavigatorBot;

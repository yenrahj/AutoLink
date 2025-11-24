const hubspot = require('@hubspot/api-client');

class HubSpotService {
  constructor() {
    this.client = new hubspot.Client({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN
    });
  }

  /**
   * Get contacts ready for LinkedIn connection requests
   * Criteria: linkedin_automation_status = 'ready_for_connection'
   */
  async getContactsForConnection(limit = 25) {
    try {
      const filterGroups = [
        {
          filters: [
            {
              propertyName: 'linkedin_automation_status',
              operator: 'EQ',
              value: 'ready_for_connection'
            }
          ]
        }
      ];

      const searchRequest = {
        filterGroups,
        sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }],
        properties: [
          'firstname',
          'lastname',
          'email',
          'linkedin_url',
          'company',
          'jobtitle',
          'icebreaker',
          'linkedin_automation_status',
          'linkedin_last_activity'
        ],
        limit
      };

      const response = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
      return response.results;
    } catch (error) {
      console.error('Error fetching contacts for connection:', error);
      throw error;
    }
  }

  /**
   * Get contacts ready for messaging (connection accepted)
   * Criteria: linkedin_automation_status = 'connected_pending_message'
   */
  async getContactsForMessaging(limit = 50) {
    try {
      const filterGroups = [
        {
          filters: [
            {
              propertyName: 'linkedin_automation_status',
              operator: 'EQ',
              value: 'connected_pending_message'
            }
          ]
        }
      ];

      const searchRequest = {
        filterGroups,
        sorts: [{ propertyName: 'linkedin_connection_date', direction: 'ASCENDING' }],
        properties: [
          'firstname',
          'lastname',
          'email',
          'linkedin_url',
          'company',
          'jobtitle',
          'email_body_v1',
          'linkedin_automation_status',
          'linkedin_last_activity'
        ],
        limit
      };

      const response = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
      return response.results;
    } catch (error) {
      console.error('Error fetching contacts for messaging:', error);
      throw error;
    }
  }

  /**
   * Get contacts for warm-up engagement (liking/commenting before connection)
   * Criteria: linkedin_automation_status = 'warm_up_phase'
   */
  async getContactsForWarmUp(limit = 30) {
    try {
      const filterGroups = [
        {
          filters: [
            {
              propertyName: 'linkedin_automation_status',
              operator: 'EQ',
              value: 'warm_up_phase'
            }
          ]
        }
      ];

      const searchRequest = {
        filterGroups,
        sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }],
        properties: [
          'firstname',
          'lastname',
          'linkedin_url',
          'company',
          'jobtitle',
          'linkedin_automation_status',
          'linkedin_warm_up_count',
          'linkedin_last_activity'
        ],
        limit
      };

      const response = await this.client.crm.contacts.searchApi.doSearch(searchRequest);
      return response.results;
    } catch (error) {
      console.error('Error fetching contacts for warm-up:', error);
      throw error;
    }
  }

  /**
   * Update contact properties in HubSpot
   */
  async updateContact(contactId, properties) {
    try {
      const updateRequest = {
        properties
      };

      await this.client.crm.contacts.basicApi.update(contactId, updateRequest);
      return true;
    } catch (error) {
      console.error(`Error updating contact ${contactId}:`, error);
      throw error;
    }
  }

  /**
   * Log an activity/engagement to HubSpot
   */
  async logEngagement(contactId, engagementType, note) {
    try {
      const engagement = {
        engagement: {
          active: true,
          type: 'NOTE',
          timestamp: Date.now()
        },
        associations: {
          contactIds: [contactId]
        },
        metadata: {
          body: `[LinkedIn Bot] ${engagementType}\n\n${note}`
        }
      };

      await this.client.crm.engagements.basicApi.create(engagement);
      return true;
    } catch (error) {
      console.error(`Error logging engagement for ${contactId}:`, error);
      return false;
    }
  }

  /**
   * Batch update multiple contacts
   */
  async batchUpdateContacts(updates) {
    try {
      const batchInputSimplePublicObjectBatchInput = {
        inputs: updates.map(update => ({
          id: update.contactId,
          properties: update.properties
        }))
      };

      await this.client.crm.contacts.batchApi.update(batchInputSimplePublicObjectBatchInput);
      return true;
    } catch (error) {
      console.error('Error batch updating contacts:', error);
      throw error;
    }
  }
}

module.exports = HubSpotService;

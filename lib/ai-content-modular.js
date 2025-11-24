const OpenAI = require('openai');
const config = require('../config/config');

/**
 * AI Content Generator - Fully Modular
 * Uses config/config.js for all messaging guidance
 * No hardcoded company/product info - easy to adapt for any company!
 */
class AIContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.config = config;
  }

  /**
   * Generate icebreaker from Sales Navigator data
   * Uses company config for messaging guidance
   */
  async generateIcebreakerFromSalesNav(prospectData, persona = null) {
    try {
      const { company, rep, messaging, personas } = this.config;
      
      // Get persona-specific messaging if available
      const personaConfig = persona && personas[persona] ? personas[persona] : null;
      
      const prompt = `Generate a compelling icebreaker for a LinkedIn connection request.

About ${company.name}:
- Product: ${company.product.name}
- Focus: ${company.product.shortDescription}
${personaConfig ? `\nTarget Pain Points: ${personaConfig.messaging.primaryPainPoints.join(', ')}` : ''}

Your role: ${rep.title} at ${company.name}
Communication style: ${rep.communicationStyle.tone}

Prospect details from Sales Navigator:
- Name: ${prospectData.name}
- Title: ${prospectData.title}
- Company: ${prospectData.company}
${prospectData.about ? `- About: ${prospectData.about.substring(0, 300)}` : ''}
${prospectData.recentActivities?.length ? `- Recent Activities: ${prospectData.recentActivities.slice(0, 3).join('; ')}` : ''}
${prospectData.talkingPoints?.length ? `- Company/Industry News: ${prospectData.talkingPoints.slice(0, 3).join('; ')}` : ''}
${prospectData.sharedConnections?.length ? `- Shared Connections: ${prospectData.sharedConnections.slice(0, 2).join(', ')}` : ''}

Create a 1-2 sentence icebreaker that:
${messaging.connectionRequest.exampleOpeners.slice(0, 2).map(ex => `- Example style: "${ex}"`).join('\n')}
- References something specific from their data
- ${rep.communicationStyle.tone} tone
- Shows genuine interest in their work
- Is NOT generic

Avoid phrases: ${rep.communicationStyle.avoidPhrases.slice(0, 3).join(', ')}

Generate only the icebreaker text:`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.ai.model,
        messages: [
          { 
            role: 'system', 
            content: `You are ${rep.firstName}, ${rep.title} at ${company.name}. Your communication style is ${rep.communicationStyle.tone}.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.ai.icebreaker.temperature,
        max_tokens: this.config.ai.icebreaker.maxTokens
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating icebreaker:', error);
      return `I noticed your work in ${prospectData.title} at ${prospectData.company}`;
    }
  }

  /**
   * Generate a thoughtful comment for a LinkedIn post
   */
  async generateComment(postContent, contactInfo) {
    try {
      const { rep, messaging } = this.config;
      
      const prompt = `Generate a thoughtful, authentic LinkedIn comment.

Post content: "${postContent}"

Your role: ${rep.title}
Communication style: ${rep.communicationStyle.tone}

Context about the person:
- Name: ${contactInfo.firstname} ${contactInfo.lastname}
- Title: ${contactInfo.jobtitle || 'Professional'}
- Company: ${contactInfo.company || 'their company'}

Requirements:
- 1-2 sentences maximum
- Thoughtful and adds value
- ${rep.communicationStyle.tone} tone
- Reference specific points from the post
- ${messaging.postEngagement.approach.join('\n- ')}

Avoid: Generic comments like "great post!" or "thanks for sharing"
Avoid phrases: ${rep.communicationStyle.avoidPhrases.join(', ')}

Generate only the comment text:`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.ai.model,
        messages: [
          { 
            role: 'system', 
            content: `You write ${messaging.postEngagement.commentStyle} LinkedIn comments.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.ai.comment.temperature,
        max_tokens: this.config.ai.comment.maxTokens
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating comment:', error);
      return null;
    }
  }

  /**
   * Generate a personalized connection request message
   * Uses icebreaker generated from Sales Navigator data
   */
  async generateConnectionMessage(contactInfo, icebreaker = null, persona = null) {
    try {
      const { company, rep, messaging, personas } = this.config;
      const personaConfig = persona && personas[persona] ? personas[persona] : null;
      
      const prompt = `Generate a personalized LinkedIn connection request message.

About ${company.name}:
- Product: ${company.product.name}
- Key value: ${company.product.valueProps[0]}

Your role: ${rep.title}

Contact details:
- Name: ${contactInfo.firstname}
- Title: ${contactInfo.jobtitle}
- Company: ${contactInfo.company}
${icebreaker ? `- Icebreaker context: ${icebreaker}` : ''}
${contactInfo.shared_connections ? `- Shared Connections: ${contactInfo.shared_connections}` : ''}

Requirements:
- Maximum ${messaging.connectionRequest.maxLength} characters (LinkedIn limit)
- ${rep.communicationStyle.tone} tone
${icebreaker ? '- Naturally incorporate the icebreaker' : ''}
${contactInfo.shared_connections ? '- Mention shared connection if highly relevant' : ''}
- Brief mention of ${company.name} and value
- No hard sell, just connection request
${personaConfig ? `\n- Relevant angle: ${personaConfig.messaging.effectiveAngles[0]}` : ''}

Structure: ${messaging.connectionRequest.structure.join(' → ')}

Avoid: ${messaging.connectionRequest.avoid.join(', ')}

Generate only the message text (no quotes):`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.ai.model,
        messages: [
          { 
            role: 'system', 
            content: `You are ${rep.firstName} at ${company.name}. Your style is ${rep.communicationStyle.tone}.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.ai.connectionMessage.temperature,
        max_tokens: this.config.ai.connectionMessage.maxTokens
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating connection message:', error);
      return null;
    }
  }

  /**
   * Generate a follow-up message after connection is accepted
   */
  async generateFollowUpMessage(contactInfo, emailBody = null, persona = null) {
    try {
      const { company, rep, messaging, personas } = this.config;
      const personaConfig = persona && personas[persona] ? personas[persona] : null;
      
      const prompt = `Generate a natural follow-up message after LinkedIn connection accepted.

About ${company.name}:
- Product: ${company.product.name}
- Value proposition: ${company.product.valueProps[0]}
${personaConfig ? `\n- Key pain points we solve: ${personaConfig.messaging.primaryPainPoints.join(', ')}` : ''}

Contact details:
- Name: ${contactInfo.firstname}
- Title: ${contactInfo.jobtitle}
- Company: ${contactInfo.company}
${emailBody ? `\n- Prior context: ${emailBody.substring(0, 200)}...` : ''}

Your role: ${rep.title}
Communication style: ${rep.communicationStyle.tone}

Requirements:
- Maximum ${messaging.followUpMessage.maxLength} characters
- Structure: ${messaging.followUpMessage.structure.join(' → ')}
- ${rep.communicationStyle.tone} tone
- Focus on their challenges: ${personaConfig ? personaConfig.messaging.primaryPainPoints[0] : 'business challenges'}
- Include ${messaging.followUpMessage.callToAction.type}: ${messaging.followUpMessage.callToAction.examples[0]}
- NOT salesy or pushy

Use common phrases: ${rep.communicationStyle.commonPhrases.join(', ')}
Avoid: ${rep.communicationStyle.avoidPhrases.join(', ')}

Generate only the message text:`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.ai.model,
        messages: [
          { 
            role: 'system', 
            content: `You are ${rep.firstName}, ${rep.title} at ${company.name}. You write ${rep.communicationStyle.tone} follow-up messages.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: this.config.ai.followUp.temperature,
        max_tokens: this.config.ai.followUp.maxTokens
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating follow-up message:', error);
      return null;
    }
  }

  /**
   * Analyze LinkedIn post content to decide if it's good to engage with
   */
  async shouldEngageWithPost(postContent, persona = null) {
    try {
      const { personas } = this.config;
      const personaConfig = persona && personas[persona] ? personas[persona] : null;
      
      const relevantTopics = personaConfig ? personaConfig.interests : [
        "business", "leadership", "industry news"
      ];
      
      const prompt = `Analyze this LinkedIn post and determine if it's appropriate to engage with.

Post: "${postContent}"

Relevant topics of interest: ${relevantTopics.join(', ')}

Respond with JSON only:
{
  "shouldEngage": true/false,
  "reason": "brief explanation",
  "engagement_type": "like" or "comment" or "skip"
}

Criteria for engagement:
- Professional content related to business/industry
- Positive or neutral sentiment
- Not overly political or controversial
- Has substance (not just motivational quotes)
- Relevant to: ${relevantTopics.join(', ')}
- Would be valuable to engage from sales perspective`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.ai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 150
      });

      const response = completion.choices[0].message.content.trim();
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error analyzing post:', error);
      return { shouldEngage: false, reason: 'Error analyzing', engagement_type: 'skip' };
    }
  }

  /**
   * Generate InMail subject and message (for Sales Navigator premium)
   */
  async generateInMail(contactInfo, context = {}, persona = null) {
    try {
      const { company, rep, messaging, personas } = this.config;
      const personaConfig = persona && personas[persona] ? personas[persona] : null;
      
      const prompt = `Generate a compelling InMail message for Sales Navigator.

About ${company.name}:
- Product: ${company.product.name}
- Value: ${company.product.valueProps[0]}
${company.socialProof.customerCount ? `- Customers: ${company.socialProof.customerCount}` : ''}

Contact details:
- Name: ${contactInfo.firstname} ${contactInfo.lastname}
- Title: ${contactInfo.jobtitle}
- Company: ${contactInfo.company}
${context.insights ? `- Context: ${context.insights}` : ''}
${context.sharedConnections ? `- Shared connections: ${context.sharedConnections}` : ''}

Your role: ${rep.title}
Communication style: ${rep.communicationStyle.tone}

Target audience: ${personaConfig ? persona : 'business leaders'}
${personaConfig ? `Key pain points: ${personaConfig.messaging.primaryPainPoints.join(', ')}` : ''}

Generate JSON:
{
  "subject": "Compelling subject line (${messaging.inMail.subjectLineLength} chars max)",
  "message": "Full InMail body (${messaging.inMail.bodyLength} chars max, 3-4 paragraphs)"
}

Message structure: ${messaging.inMail.structure.join(' → ')}

Requirements:
- ${rep.communicationStyle.tone} tone
- Personalized opening
- Clear value for their specific role
- Specific call-to-action
${company.socialProof.stats.length ? `- Can mention: ${company.socialProof.stats[0]}` : ''}

Generate only valid JSON:`;

      const completion = await this.openai.chat.completions.create({
        model: this.config.ai.model,
        messages: [
          { 
            role: 'system', 
            content: `You are ${rep.firstName} at ${company.name}. You write InMails that get responses.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content.trim();
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Error generating InMail:', error);
      return {
        subject: `Re: ${contactInfo.company} development programs`,
        message: `Hi ${contactInfo.firstname},\n\nI hope this message finds you well...`
      };
    }
  }
}

module.exports = AIContentGenerator;

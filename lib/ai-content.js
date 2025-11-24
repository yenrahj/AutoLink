const OpenAI = require('openai');
const config = require('../config/config');

class AIContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.config = config;
  }

  /**
   * Generate a thoughtful comment for a LinkedIn post
   */
  async generateComment(postContent, contactInfo) {
    try {
      const prompt = `Generate a thoughtful, authentic LinkedIn comment for this post.

Post content: "${postContent}"

Context about the person:
- Name: ${contactInfo.firstname} ${contactInfo.lastname}
- Title: ${contactInfo.jobtitle || 'Professional'}
- Company: ${contactInfo.company || 'their company'}

Requirements:
- 1-2 sentences maximum
- Thoughtful and adds value
- Professional but warm tone
- NOT generic (no "great post!" or "thanks for sharing")
- Reference specific points from the post
- Ask a relevant question or share a brief insight

Generate only the comment text, no quotes or explanations:`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a professional LinkedIn user who writes thoughtful, engaging comments.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 150
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating comment:', error);
      return null;
    }
  }

  /**
   * Generate a personalized connection request message
   */
  async generateConnectionMessage(contactInfo, icebreaker = null) {
    try {
      const prompt = `Generate a personalized LinkedIn connection request message.

Contact details:
- Name: ${contactInfo.firstname}
- Title: ${contactInfo.jobtitle}
- Company: ${contactInfo.company}
${icebreaker ? `- Icebreaker/Context: ${icebreaker}` : ''}

Requirements:
- Maximum 280 characters (LinkedIn limit)
- Personalized and specific
- Professional but friendly
- Mention why you want to connect
- Include a specific detail about them or their work
${icebreaker ? '- Reference the icebreaker naturally' : ''}
- No generic templates

Generate only the message text:`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a sales professional who writes personalized, engaging connection requests.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 100
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
  async generateFollowUpMessage(contactInfo, emailBody = null) {
    try {
      const prompt = `Generate a natural follow-up message to send after a LinkedIn connection is accepted.

Contact details:
- Name: ${contactInfo.firstname}
- Title: ${contactInfo.jobtitle}
- Company: ${contactInfo.company}
${emailBody ? `\n- Context/Value Prop: ${emailBody.substring(0, 200)}...` : ''}

Requirements:
- 2-4 sentences
- Acknowledge the connection
- Transition naturally to value/offering
- Include a soft call-to-action
- Professional but conversational
- NOT salesy or pushy

Generate only the message text:`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a sales professional who writes warm, value-focused follow-up messages.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
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
  async shouldEngageWithPost(postContent) {
    try {
      const prompt = `Analyze this LinkedIn post and determine if it's appropriate to engage with (like/comment).

Post: "${postContent}"

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
- Would be valuable to engage with from sales perspective`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 150
      });

      const response = completion.choices[0].message.content.trim();
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing post:', error);
      return { shouldEngage: false, reason: 'Error analyzing', engagement_type: 'skip' };
    }
  }
}

module.exports = AIContentGenerator;

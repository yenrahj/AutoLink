const puppeteer = require('puppeteer-core');

class LinkedInBot {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  /**
   * Initialize browser and login to LinkedIn
   * Uses remote browser service (Browserless, Bright Data, etc.)
   */
  async initialize() {
    try {
      console.log('🚀 Connecting to remote browser...');
      
      // Option 1: Browserless.io (has free tier)
      // Sign up at https://browserless.io and get your API key
      const browserWSEndpoint = process.env.BROWSERLESS_URL || 
        `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`;
      
      // Option 2: Bright Data (formerly Luminati)
      // const browserWSEndpoint = process.env.BRIGHT_DATA_BROWSER_URL;
      
      // Option 3: Your own hosted Chrome instance
      // const browserWSEndpoint = process.env.CHROME_WS_ENDPOINT;
      
      this.browser = await puppeteer.connect({
        browserWSEndpoint: browserWSEndpoint,
      });

      this.page = await this.browser.newPage();
      
      // Set a realistic user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await this.login();
      
      return true;
    } catch (error) {
      console.error('Error initializing browser:', error);
      throw error;
    }
  }

  /**
   * Login to LinkedIn using session cookie
   * More reliable than username/password which triggers security checks
   */
  async login() {
    try {
      console.log('🔐 Logging into LinkedIn...');
      
      // Use cookie-based auth (recommended - avoids security checkpoints)
      const liAtCookie = process.env.LINKEDIN_LI_AT_COOKIE;
      
      if (liAtCookie) {
        console.log('Using cookie-based authentication...');
        
        // Set the li_at session cookie
        await this.page.setCookie({
          name: 'li_at',
          value: liAtCookie,
          domain: '.linkedin.com',
          path: '/',
          httpOnly: true,
          secure: true,
        });
        
        // Navigate to LinkedIn to verify login
        await this.page.goto('https://www.linkedin.com/feed/', {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });
        
        await this.randomDelay(2000, 3000);
        
        // Check if we're logged in
        const url = this.page.url();
        if (url.includes('/feed') || url.includes('/in/') || url.includes('/sales/')) {
          console.log('✅ Successfully logged into LinkedIn via cookie');
          this.isLoggedIn = true;
          return;
        } else if (url.includes('/login') || url.includes('/authwall')) {
          throw new Error('Cookie authentication failed - cookie may be expired');
        }
      }
      
      // Fallback to username/password (less reliable)
      console.log('Using username/password authentication...');
      
      await this.page.goto('https://www.linkedin.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Enter credentials
      await this.page.type('#username', process.env.LINKEDIN_EMAIL, { delay: 100 });
      await this.page.type('#password', process.env.LINKEDIN_PASSWORD, { delay: 100 });

      // Click login button
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation with longer timeout
      await this.page.waitForNavigation({ 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });

      // Check if login was successful
      const url = this.page.url();
      if (url.includes('/feed') || url.includes('/in/')) {
        console.log('✅ Successfully logged into LinkedIn');
        this.isLoggedIn = true;
      } else if (url.includes('/checkpoint')) {
        throw new Error('LinkedIn security checkpoint detected. Use cookie auth instead - set LINKEDIN_LI_AT_COOKIE env var');
      } else {
        throw new Error('Login failed - unexpected URL: ' + url);
      }

      // Random delay to appear more human
      await this.randomDelay(2000, 4000);

    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Send a connection request to a LinkedIn profile
   */
  async sendConnectionRequest(profileUrl, message = null) {
    try {
      console.log(`📤 Sending connection request to: ${profileUrl}`);

      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(1000, 2000);

      // Look for the "Connect" button
      const connectButton = await this.page.$('button[aria-label^="Invite"][aria-label*="to connect"]');
      
      if (!connectButton) {
        console.log('⚠️  Connect button not found - may already be connected or pending');
        return { success: false, reason: 'button_not_found' };
      }

      await connectButton.click();
      await this.randomDelay(1000, 1500);

      // If message is provided, add a note
      if (message) {
        const addNoteButton = await this.page.$('button[aria-label="Add a note"]');
        if (addNoteButton) {
          await addNoteButton.click();
          await this.randomDelay(500, 1000);

          const messageBox = await this.page.$('#custom-message');
          if (messageBox) {
            await messageBox.type(message, { delay: 50 });
            await this.randomDelay(500, 1000);
          }
        }
      }

      // Click the final "Send" button
      const sendButton = await this.page.$('button[aria-label="Send now"]') || 
                          await this.page.$('button[aria-label="Send invitation"]');
      
      if (sendButton) {
        await sendButton.click();
        await this.randomDelay(2000, 3000);
        
        console.log('✅ Connection request sent successfully');
        return { success: true };
      } else {
        console.log('⚠️  Send button not found');
        return { success: false, reason: 'send_button_not_found' };
      }

    } catch (error) {
      console.error('Error sending connection request:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Send a message to an existing connection
   */
  async sendMessage(profileUrl, message) {
    try {
      console.log(`💬 Sending message to: ${profileUrl}`);

      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.randomDelay(1000, 2000);

      // Click the "Message" button
      const messageButton = await this.page.$('button[aria-label^="Message"]');
      
      if (!messageButton) {
        console.log('⚠️  Message button not found - may not be connected');
        return { success: false, reason: 'not_connected' };
      }

      await messageButton.click();
      await this.randomDelay(1000, 1500);

      // Wait for message box to appear
      const messageBox = await this.page.waitForSelector('.msg-form__contenteditable', { timeout: 5000 });
      
      if (messageBox) {
        await messageBox.click();
        await this.randomDelay(500, 1000);
        
        // Type the message with human-like delay
        await messageBox.type(message, { delay: 50 });
        await this.randomDelay(1000, 1500);

        // Click send button
        const sendButton = await this.page.$('button[type="submit"].msg-form__send-button');
        if (sendButton) {
          await sendButton.click();
          await this.randomDelay(2000, 3000);
          
          console.log('✅ Message sent successfully');
          return { success: true };
        }
      }

      return { success: false, reason: 'message_box_not_found' };

    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Like a post on someone's profile
   */
  async likeRecentPost(profileUrl) {
    try {
      console.log(`👍 Liking recent post from: ${profileUrl}`);

      await this.page.goto(`${profileUrl}/recent-activity/all/`, { waitUntil: 'networkidle2' });
      await this.randomDelay(2000, 3000);

      // Find the first unliked post
      const likeButtons = await this.page.$$('button[aria-label^="React Like"]');
      
      if (likeButtons.length > 0) {
        await likeButtons[0].click();
        await this.randomDelay(1500, 2500);
        
        console.log('✅ Liked recent post');
        return { success: true };
      } else {
        console.log('⚠️  No posts found to like');
        return { success: false, reason: 'no_posts_found' };
      }

    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Comment on a recent post
   */
  async commentOnRecentPost(profileUrl, comment) {
    try {
      console.log(`💬 Commenting on recent post from: ${profileUrl}`);

      await this.page.goto(`${profileUrl}/recent-activity/all/`, { waitUntil: 'networkidle2' });
      await this.randomDelay(2000, 3000);

      // Find the first post's comment button
      const commentButtons = await this.page.$$('button[aria-label^="Comment"]');
      
      if (commentButtons.length > 0) {
        await commentButtons[0].click();
        await this.randomDelay(1000, 1500);

        // Wait for comment box
        const commentBox = await this.page.waitForSelector('.ql-editor[contenteditable="true"]', { timeout: 5000 });
        
        if (commentBox) {
          await commentBox.click();
          await this.randomDelay(500, 1000);
          
          await commentBox.type(comment, { delay: 50 });
          await this.randomDelay(1000, 1500);

          // Submit comment
          const submitButton = await this.page.$('button.comments-comment-box__submit-button');
          if (submitButton) {
            await submitButton.click();
            await this.randomDelay(2000, 3000);
            
            console.log('✅ Comment posted successfully');
            return { success: true };
          }
        }
      }

      return { success: false, reason: 'no_posts_found' };

    } catch (error) {
      console.error('Error commenting on post:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Human-like random delay
   */
  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

module.exports = LinkedInBot;

# LinkedIn Automation System

Automated LinkedIn prospecting with HubSpot integration. This system handles:
- **Warm-up engagement** (liking/commenting before connection)
- **Connection requests** (25/day limit with personalized messages)
- **Follow-up messaging** (after connections are accepted)
- **Activity logging** back to HubSpot

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL CRON JOBS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  11 AM Daily    │  │    9 AM Daily    │  │ 10 AM & 2 PM  │ │
│  │                 │  │                  │  │     Daily     │ │
│  │  Warm-Up        │  │  Connection      │  │   Messaging   │ │
│  │  Engagement     │  │  Requests        │  │   Follow-Up   │ │
│  └────────┬────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                    │                     │          │
│           └────────────────────┼─────────────────────┘          │
│                                │                                 │
│                                ▼                                 │
│                    ┌─────────────────────┐                      │
│                    │  LinkedIn Bot       │                      │
│                    │  (Puppeteer)        │                      │
│                    └─────────────────────┘                      │
│                                │                                 │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                    ┌────────────┴───────────┐
                    │                        │
                    ▼                        ▼
           ┌─────────────────┐      ┌──────────────┐
           │    LinkedIn     │      │   HubSpot    │
           │    Website      │      │     CRM      │
           └─────────────────┘      └──────────────┘
                                           ▲
                                           │
                                    (Activity Logging)
```

## Features

### 1. Warm-Up Engagement (Pre-Connection)
- Scrapes prospect's recent LinkedIn activity
- Analyzes posts with AI to determine engagement worthiness
- Likes posts or generates thoughtful comments
- Engages 3 times over several days before connection request
- **Increases connection acceptance rate by 40-60%**

### 2. Connection Requests
- Sends up to 25 connection requests per day (LinkedIn's limit)
- AI-generated personalized messages using contact data
- Uses icebreakers from Clay/PeopleGPT
- Human-like delays between actions (2-5 seconds)
- Logs all activity to HubSpot

### 3. Follow-Up Messaging
- Automatically messages accepted connections
- Generates contextual follow-ups based on email content
- Runs twice daily (10 AM & 2 PM)
- Up to 50 messages per day
- Natural conversation flow

### 4. HubSpot Integration
- Reads contacts with specific status flags
- Updates contact properties automatically
- Logs all LinkedIn activities as engagements
- Tracks success/failure for optimization

## Setup Instructions

### 1. Prerequisites

- **Vercel Account** (Pro plan recommended for longer function timeouts)
- **HubSpot Account** with Private App access
- **OpenAI API Key** (GPT-4 access recommended)
- **LinkedIn Account** (use a dedicated account, not your personal one)

### 2. HubSpot Custom Properties

Create these custom properties on Contact objects:

| Property Name | Type | Description |
|--------------|------|-------------|
| `linkedin_automation_status` | Dropdown | Current automation state |
| `linkedin_url` | Single-line text | Profile URL |
| `linkedin_last_activity` | Date picker | Last automation action |
| `linkedin_warm_up_count` | Number | Engagement count (0-3) |
| `linkedin_last_engagement_type` | Dropdown | like/comment |
| `linkedin_connection_message` | Multi-line text | Sent connection message |
| `linkedin_message_content` | Multi-line text | Sent follow-up message |
| `linkedin_last_error` | Single-line text | Last error message |
| `linkedin_connection_date` | Date picker | When connection accepted |

**Status Dropdown Options:**
- `warm_up_phase` - Engaging with content pre-connection
- `ready_for_connection` - Ready to send request
- `connection_pending` - Request sent, awaiting acceptance
- `connected_pending_message` - Connected, ready to message
- `message_sent` - Follow-up message sent
- `connection_failed` - Request failed
- `message_failed` - Message failed
- `error_no_url` - Missing LinkedIn URL

### 3. Environment Variables

Create a `.env.local` file:

```bash
# HubSpot
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxx-xxxx-xxxx

# LinkedIn (use a dedicated account)
LINKEDIN_EMAIL=automation@yourcompany.com
LINKEDIN_PASSWORD=your_secure_password

# OpenAI
OPENAI_API_KEY=sk-proj-xxxx

# Security
CRON_SECRET=generate-a-random-secure-string-here

# Rate Limiting (adjust as needed)
MAX_CONNECTIONS_PER_DAY=25
MAX_MESSAGES_PER_DAY=50
DELAY_MIN_MS=2000
DELAY_MAX_MS=5000
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5. Configure Cron Jobs

The cron jobs are automatically configured via `vercel.json`:

- **9 AM Daily**: Connection requests
- **10 AM & 2 PM Daily**: Follow-up messaging
- **11 AM Daily**: Warm-up engagement

Vercel will automatically call these endpoints with a Bearer token.

### 6. Workflow in HubSpot

Create workflows to set the automation status:

**Workflow 1: Warm-Up Phase**
```
Trigger: Contact created from Clay with LinkedIn URL
Action: Set linkedin_automation_status = "warm_up_phase"
```

**Workflow 2: Connection Accepted**
```
Trigger: Manual or via webhook when connection accepted
Action: Set linkedin_automation_status = "connected_pending_message"
Action: Set linkedin_connection_date = Today
```

**Workflow 3: Move to Sequence After Message**
```
Trigger: linkedin_automation_status = "message_sent"
Wait: 2 days
Action: Enroll in email sequence
```

## Usage Flow

### Step 1: Import Contacts from Clay
- Clay exports contacts with LinkedIn URLs
- Contacts sync to HubSpot with `icebreaker` field
- Set `linkedin_automation_status = "warm_up_phase"`

### Step 2: Warm-Up Engagement (Days 1-3)
- Bot engages with their content 3 times over several days
- Likes posts or leaves thoughtful comments
- Builds familiarity before connection request
- After 3 engagements: Status → `ready_for_connection`

### Step 3: Connection Request (Day 4-5)
- Bot sends personalized connection request
- Uses icebreaker from Clay in message
- Status → `connection_pending`

### Step 4: Manual Check (Optional)
- Check LinkedIn for accepted connections
- Update status to `connected_pending_message` manually
- (Future: Could automate with LinkedIn API)

### Step 5: Follow-Up Message (Day 6-7)
- Bot sends contextual follow-up message
- References their email content from HubSpot
- Status → `message_sent`

### Step 6: Graduate to Email Sequence
- HubSpot workflow enrolls them in email sequence
- Continue multi-channel outreach

## Best Practices

### LinkedIn Safety
1. **Use a dedicated LinkedIn account** - Not your personal profile
2. **Don't exceed 25 connections/day** - LinkedIn's soft limit
3. **Vary timing** - Our random delays help
4. **Monitor account health** - Watch for warnings
5. **Add 2FA** - Secure the automation account

### Message Quality
1. **Review AI-generated content** - First 10-20 messages
2. **Customize icebreakers** - Better Clay data = better messages
3. **Test variants** - Try different message styles
4. **Track acceptance rates** - Optimize based on data

### HubSpot Hygiene
1. **Clean data** - Accurate LinkedIn URLs
2. **Monitor logs** - Check engagement notes
3. **Handle errors** - Review failed contacts
4. **Update workflows** - Refine based on results

## Monitoring

### Check Vercel Logs
```bash
vercel logs --follow
```

### HubSpot Reports
Create reports to track:
- Contacts by automation status
- Connection acceptance rate
- Message sent vs replied
- Time from warm-up to meeting

### Weekly Review
- Check error contacts
- Analyze acceptance rates
- Review AI-generated messages
- Adjust timing/frequency if needed

## Troubleshooting

### "LinkedIn security checkpoint detected"
- Login manually first on the automation account
- Complete any security challenges
- LinkedIn sometimes requires periodic manual login

### High failure rate
- Check if LinkedIn URLs are correct
- Verify account isn't restricted
- Reduce daily limits temporarily

### Messages not sending
- Verify contacts are actually connected
- Check if message button is available
- Some profiles restrict messages

### Browser timeout
- Increase Vercel function timeout
- Reduce batch size
- Add more delays

## Advanced Enhancements

### Coming Soon:
1. **Auto-detect accepted connections** - Via LinkedIn API or scraping
2. **Reply detection** - Parse LinkedIn messages
3. **Sentiment analysis** - Route hot leads to reps
4. **Post scraping** - Comment on specific keywords
5. **Network effect** - Track mutual connections

## Cost Estimate

- **Vercel Pro**: $20/month (for longer functions)
- **OpenAI API**: ~$5-15/month (depending on volume)
- **HubSpot**: Existing cost
- **Total**: ~$25-35/month

Handles 500-750 prospects/month on autopilot.

## Support

For issues or questions:
1. Check Vercel logs first
2. Review HubSpot engagement notes
3. Test manually via Vercel dev mode
4. Document errors and contact support

---

Built with ❤️ for automated, personalized outreach.

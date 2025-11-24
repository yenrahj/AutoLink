# LinkedIn Automation - Deployment Checklist

## Pre-Deployment Checklist

### ☐ 1. HubSpot Setup

#### A. Create Private App
- [ ] Go to Settings → Integrations → Private Apps
- [ ] Create new app: "LinkedIn Automation"
- [ ] Enable scopes:
  - [ ] `crm.objects.contacts.read`
  - [ ] `crm.objects.contacts.write`
  - [ ] `crm.schemas.contacts.read`
  - [ ] `crm.objects.companies.read`
  - [ ] `timeline` (for engagements)
- [ ] Copy access token
- [ ] Add to `.env` as `HUBSPOT_ACCESS_TOKEN`

#### B. Create Custom Properties
Run this checklist for each property:

**linkedin_automation_status** (Dropdown)
- [ ] Create property
- [ ] Add dropdown options:
  - [ ] `warm_up_phase`
  - [ ] `ready_for_connection`
  - [ ] `connection_pending`
  - [ ] `connected_pending_message`
  - [ ] `message_sent`
  - [ ] `connection_failed`
  - [ ] `message_failed`
  - [ ] `error_no_url`

**Other Properties** (Create each):
- [ ] `linkedin_url` (Single-line text)
- [ ] `linkedin_last_activity` (Date picker)
- [ ] `linkedin_warm_up_count` (Number)
- [ ] `linkedin_last_engagement_type` (Dropdown: like/comment/skip)
- [ ] `linkedin_connection_message` (Multi-line text)
- [ ] `linkedin_message_content` (Multi-line text)
- [ ] `linkedin_last_error` (Single-line text)
- [ ] `linkedin_connection_date` (Date picker)

#### C. Create Workflows

**Workflow 1: Initialize Warm-Up**
- [ ] Create workflow: "LinkedIn - Initialize Warm-Up"
- [ ] Trigger: Contact created AND linkedin_url is known
- [ ] Action: Set `linkedin_automation_status` = "warm_up_phase"
- [ ] Action: Set `linkedin_warm_up_count` = 0
- [ ] Turn ON workflow

**Workflow 2: Graduate to Email After Message**
- [ ] Create workflow: "LinkedIn - Graduate to Email"
- [ ] Trigger: `linkedin_automation_status` = "message_sent"
- [ ] Wait: 2 days
- [ ] Action: Enroll in your main email sequence
- [ ] Turn ON workflow

### ☐ 2. LinkedIn Account Setup

#### Create Dedicated Account
- [ ] Create new LinkedIn account (NOT your personal)
- [ ] Use company email: automation@yourcompany.com
- [ ] Complete profile (looks more legitimate)
  - [ ] Add professional photo
  - [ ] Write bio
  - [ ] Add work experience
  - [ ] Minimum 50+ connections (ask team to connect)
- [ ] Enable 2FA for security
- [ ] Login manually on desktop at least once
- [ ] Complete any security challenges

#### Account Warm-Up (IMPORTANT)
Before automation, manually:
- [ ] Week 1: Send 5-10 connection requests/day manually
- [ ] Week 2: Send 10-15 connection requests/day
- [ ] Week 3: Send 15-20 connection requests/day
- [ ] Week 4: Full automation at 25/day

This prevents LinkedIn from flagging new accounts.

### ☐ 3. OpenAI Setup
- [ ] Create OpenAI account
- [ ] Generate API key
- [ ] Enable GPT-4 access (billing)
- [ ] Set usage limits ($50/month recommended)
- [ ] Add key to `.env`

### ☐ 4. Vercel Setup
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Upgrade to Pro (for 300s timeouts)

### ☐ 5. Environment Variables

#### Set in Vercel Dashboard
- [ ] Go to your project
- [ ] Settings → Environment Variables
- [ ] Add all variables from `.env.example`:
  - [ ] `HUBSPOT_ACCESS_TOKEN`
  - [ ] `LINKEDIN_EMAIL`
  - [ ] `LINKEDIN_PASSWORD`
  - [ ] `OPENAI_API_KEY`
  - [ ] `CRON_SECRET` (generate random string)
  - [ ] `MAX_CONNECTIONS_PER_DAY` (start with 15)
  - [ ] `MAX_MESSAGES_PER_DAY` (start with 30)
  - [ ] `DELAY_MIN_MS` (2000)
  - [ ] `DELAY_MAX_MS` (5000)

### ☐ 6. Initial Deployment

```bash
# Install dependencies
npm install

# Test locally (optional)
vercel dev

# Deploy to production
vercel --prod
```

- [ ] Deployment successful
- [ ] Note your deployment URL
- [ ] Cron jobs visible in Vercel dashboard

---

## Testing Procedure

### Phase 1: Test Warm-Up Engagement

#### Setup Test Contacts
1. [ ] Create 3 test contacts in HubSpot
2. [ ] Set properties:
   - `linkedin_url`: Your team member's profiles
   - `linkedin_automation_status`: "warm_up_phase"
   - `linkedin_warm_up_count`: 0
3. [ ] Verify contacts appear in HubSpot

#### Manual Test Run
```bash
# Trigger warm-up manually (use your CRON_SECRET)
curl -X GET "https://your-project.vercel.app/api/cron/warm-up-engagement" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Verify Results
- [ ] Check Vercel logs for execution
- [ ] Check LinkedIn: Was content liked/commented?
- [ ] Check HubSpot:
  - [ ] `linkedin_warm_up_count` incremented
  - [ ] `linkedin_last_activity` updated
  - [ ] Engagement note created
- [ ] Run 2 more times over 2 days
- [ ] After 3rd run: Status should change to "ready_for_connection"

### Phase 2: Test Connection Requests

#### Setup Test Contacts
1. [ ] Create 2 test contacts in HubSpot
2. [ ] Set properties:
   - `linkedin_url`: Profiles you'll accept from (use alt account or ask colleague)
   - `linkedin_automation_status`: "ready_for_connection"
   - `icebreaker`: "Test icebreaker from Clay"
3. [ ] Verify contacts ready

#### Manual Test Run
```bash
curl -X GET "https://your-project.vercel.app/api/cron/linkedin-daily" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Verify Results
- [ ] Check Vercel logs
- [ ] Check LinkedIn: Connection request sent?
- [ ] Check message personalization quality
- [ ] Check HubSpot:
  - [ ] Status → "connection_pending"
  - [ ] `linkedin_connection_message` saved
  - [ ] Engagement note created
- [ ] Accept connection manually
- [ ] Update status to "connected_pending_message"

### Phase 3: Test Follow-Up Messaging

#### Manual Test Run
```bash
curl -X GET "https://your-project.vercel.app/api/cron/linkedin-messaging" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Verify Results
- [ ] Check Vercel logs
- [ ] Check LinkedIn: Message received?
- [ ] Review message quality
- [ ] Check HubSpot:
  - [ ] Status → "message_sent"
  - [ ] `linkedin_message_content` saved
  - [ ] Engagement note created

### Phase 4: Error Handling Tests

#### Test Missing LinkedIn URL
- [ ] Create contact without `linkedin_url`
- [ ] Set status to "ready_for_connection"
- [ ] Run connection cron
- [ ] Verify status → "error_no_url"

#### Test Invalid URL
- [ ] Create contact with invalid URL
- [ ] Run automation
- [ ] Verify error logged correctly

#### Test Already Connected
- [ ] Use profile you're already connected to
- [ ] Run connection request
- [ ] Verify graceful handling

---

## Phase 5: Gradual Rollout

### Week 1: Limited Testing
- [ ] Set `MAX_CONNECTIONS_PER_DAY=10`
- [ ] Set `MAX_MESSAGES_PER_DAY=20`
- [ ] Import 50 test prospects
- [ ] Monitor daily
- [ ] Check acceptance rate
- [ ] Review message quality

### Week 2: Scale Up
- [ ] Increase to `MAX_CONNECTIONS_PER_DAY=15`
- [ ] Import 100 more prospects
- [ ] Monitor for any LinkedIn warnings
- [ ] Optimize message templates if needed

### Week 3: Near Full Scale
- [ ] Increase to `MAX_CONNECTIONS_PER_DAY=20`
- [ ] Import 200 prospects
- [ ] Set up HubSpot reports
- [ ] Weekly performance review

### Week 4: Full Production
- [ ] Set `MAX_CONNECTIONS_PER_DAY=25`
- [ ] Import full prospect list
- [ ] Automate Clay → HubSpot sync
- [ ] Weekly optimization reviews

---

## Monitoring & Maintenance

### Daily Checks (5 minutes)
- [ ] Check Vercel logs for errors
- [ ] Review failed contacts in HubSpot
- [ ] Check LinkedIn account health

### Weekly Reviews (30 minutes)
- [ ] Connection acceptance rate
- [ ] Message reply rate
- [ ] Review AI-generated content samples
- [ ] Check for LinkedIn account warnings
- [ ] Update prompt templates if needed

### Monthly Optimization
- [ ] Analyze which icebreakers perform best
- [ ] Test new message variants
- [ ] Review warm-up vs direct connection results
- [ ] Adjust timing/frequency
- [ ] Update documentation

---

## Troubleshooting Guide

### Issue: "LinkedIn security checkpoint"
**Solution:**
1. Login manually to automation account
2. Complete security challenge
3. Wait 24 hours
4. Resume automation

### Issue: Low acceptance rate (<30%)
**Possible causes:**
- [ ] Messages not personalized enough
- [ ] Skipping warm-up phase
- [ ] Targeting wrong personas
- [ ] LinkedIn profile incomplete
**Actions:**
- Review message samples
- Enable warm-up for all prospects
- Check targeting criteria

### Issue: High failure rate
**Check:**
- [ ] LinkedIn URLs correct format
- [ ] Account not restricted
- [ ] Browser timeout settings
- [ ] Vercel function timeout sufficient

### Issue: No messages sending
**Check:**
- [ ] Contacts actually connected?
- [ ] Message button available on profile?
- [ ] Daily limit not reached?

---

## Success Metrics

### Target Benchmarks
- **Connection Acceptance**: 40-60% (with warm-up)
- **Message Reply Rate**: 10-20%
- **Meeting Booking Rate**: 2-5%
- **Daily Volume**: 20-25 connections, 40-50 messages

### Track in HubSpot
Create reports for:
1. Contacts by automation status (funnel view)
2. Time to meeting booked (days)
3. Channel effectiveness (email vs LinkedIn)
4. Best performing personas

---

## Backup & Recovery

### Before Major Changes
```bash
# Export HubSpot contacts
# (Use HubSpot export feature)

# Backup Vercel environment variables
vercel env pull .env.backup

# Git commit current code
git commit -am "Pre-change backup"
```

### Emergency Rollback
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

---

## Post-Launch Checklist

### Week 1
- [ ] All cron jobs running successfully
- [ ] No LinkedIn account issues
- [ ] Acceptance rate within targets
- [ ] Error rate <5%

### Month 1
- [ ] 500+ connection requests sent
- [ ] 200+ connections accepted
- [ ] 150+ messages sent
- [ ] 10+ meetings booked

### Ongoing
- [ ] Weekly performance reviews
- [ ] Monthly optimization
- [ ] Quarterly strategy review
- [ ] Document learnings

---

**Ready to Launch? Double-check everything above, then flip the switch! 🚀**

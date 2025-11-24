# LinkedIn Automation - Quick Reference

## 🚀 Quick Start Commands

### Deploy to Production
```bash
vercel --prod
```

### Check Logs
```bash
vercel logs --follow
```

### Manually Trigger Cron Jobs
```bash
# Warm-up engagement
curl -X GET "https://your-project.vercel.app/api/cron/warm-up-engagement" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Connection requests  
curl -X GET "https://your-project.vercel.app/api/cron/linkedin-daily" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Follow-up messages
curl -X GET "https://your-project.vercel.app/api/cron/linkedin-messaging" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 HubSpot Status Flow

```
New Contact
    ↓
warm_up_phase (3 engagements)
    ↓
ready_for_connection
    ↓
connection_pending (awaiting acceptance)
    ↓
connected_pending_message (manually set when accepted)
    ↓
message_sent
    ↓
[Email Sequence]
```

---

## 🔧 Common Operations

### Add New Prospects

**Step 1: In Clay**
- Export with `linkedin_url` and `icebreaker` fields

**Step 2: In HubSpot**  
- Import CSV
- Map fields correctly
- Workflow auto-sets status to `warm_up_phase`

**Step 3: Wait**
- Day 1-3: Warm-up engagement
- Day 4: Connection request
- Day 5-7: Manual check + set to `connected_pending_message`
- Day 8: Follow-up message sent

### Pause Automation

**Method 1: Turn off cron**
- Vercel dashboard → Settings → Cron Jobs → Disable

**Method 2: Clear pending contacts**
- HubSpot list view
- Filter: `linkedin_automation_status` in [warm_up_phase, ready_for_connection]
- Bulk update status to `paused`

### Resume Automation
- Re-enable cron jobs
- Bulk update status back to appropriate phase

---

## 🐛 Quick Troubleshooting

### Connection requests not sending?
```
✓ Check MAX_CONNECTIONS_PER_DAY not reached
✓ Check contacts have valid linkedin_url
✓ Check status = "ready_for_connection"
✓ Review Vercel logs for errors
```

### Messages not sending?
```
✓ Verify status = "connected_pending_message"  
✓ Check if actually connected on LinkedIn
✓ Check MAX_MESSAGES_PER_DAY not reached
✓ Verify message permissions on profile
```

### Warm-up not working?
```
✓ Status = "warm_up_phase"
✓ linkedin_warm_up_count < 3
✓ Profile has recent posts
✓ Check Vercel timeout settings
```

---

## 📈 Key Metrics to Track

### In HubSpot (Custom Reports)

**Pipeline Velocity**
- Warm-up → Connection: 3-5 days
- Connection → Message: 0-2 days  
- Message → Reply: 2-7 days
- Reply → Meeting: 3-10 days

**Conversion Rates**
- Connection acceptance: Target 40-60%
- Message reply: Target 10-20%
- Meeting booked: Target 2-5%

**Volume Metrics**
- Daily connections sent: 20-25
- Daily messages sent: 40-50
- Weekly meetings booked: 2-5

---

## ⚠️ LinkedIn Safety Limits

| Action | Daily Limit | Our Setting |
|--------|-------------|-------------|
| Connection Requests | 25-30 | 25 |
| Messages | 50-100 | 50 |
| Profile Views | 80-100 | N/A |
| Post Likes | 50-100 | 30 |
| Comments | 20-30 | 10 |

**Safety Rules:**
- Never exceed LinkedIn's limits
- Always use delays (2-5s between actions)
- Warm up new accounts slowly
- Monitor for warnings
- Take breaks (weekends optional)

---

## 🔐 Security Best Practices

### Credentials
- Use dedicated LinkedIn account
- Enable 2FA
- Rotate passwords quarterly
- Never commit `.env` file

### Access Control  
- Limit who has CRON_SECRET
- Use Vercel environment variables
- Monitor deployment logs
- Review access logs monthly

### Data Privacy
- Don't log sensitive contact info
- Encrypt LinkedIn credentials
- GDPR compliance for EU prospects
- Respect opt-outs immediately

---

## 🎯 Optimization Tips

### Improve Acceptance Rate
1. Complete automation account profile
2. Use warm-up phase (3-5 days)
3. Personalize connection messages
4. Target right personas
5. Clean LinkedIn URLs

### Improve Reply Rate
1. Reference their content/company
2. Lead with value, not pitch
3. Ask specific questions
4. Keep messages under 100 words
5. Include soft CTA

### Improve Message Quality
1. Review first 20 AI-generated messages
2. Adjust OpenAI temperature (0.7-0.9)
3. Provide better icebreakers from Clay
4. Test different prompt styles
5. A/B test message frameworks

---

## 📞 Support Resources

### Logs & Debugging
- **Vercel Logs**: `vercel logs --follow`
- **HubSpot Activity**: Contact → Activity tab
- **Engagement Notes**: Check timeline

### Documentation
- Main docs: `/README.md`
- Deployment: `/DEPLOYMENT.md`
- This guide: `/QUICK-REFERENCE.md`

### API References
- [HubSpot API](https://developers.hubspot.com/docs/api/overview)
- [OpenAI API](https://platform.openai.com/docs)
- [Puppeteer Docs](https://pptr.dev/)

---

## 🔄 Weekly Maintenance Routine

### Monday Morning (10 min)
- [ ] Check weekend cron runs
- [ ] Review error rate
- [ ] Check LinkedIn account health
- [ ] Plan week's volume

### Mid-Week Check (15 min)
- [ ] Review acceptance rates
- [ ] Check message quality samples
- [ ] Update icebreakers if needed
- [ ] Handle failed contacts

### Friday Review (30 min)
- [ ] Weekly metrics dashboard
- [ ] Calculate conversion rates
- [ ] Identify optimization opportunities
- [ ] Plan next week adjustments

---

## 💡 Pro Tips

**Warm-Up Strategy**
- 3 engagements minimum before connection
- Mix likes and comments (not all likes)
- Spread over 3-7 days
- Focus on recent posts (last 2 weeks)

**Timing Optimization**
- Morning (8-10 AM): Best for connection requests
- Lunch (12-1 PM): Good for warm-up
- Afternoon (2-4 PM): Good for messages
- Avoid nights/weekends for safety

**Content Strategy**
- Comment on how-to posts (more engagement)
- Like personal wins (builds rapport)
- Skip controversial topics
- Engage with company announcements

**Message Framework**
```
1. Acknowledge connection
2. One-sentence value prop
3. Soft CTA with question
4. Keep under 80 words
```

---

## 🚨 Emergency Procedures

### LinkedIn Account Restricted
1. Stop all automation immediately
2. Login manually and check warnings
3. Complete verification if required
4. Wait 7-14 days before resuming
5. Lower limits when resuming (10/day)

### High Error Rate (>10%)
1. Pause automation
2. Check Vercel logs for patterns
3. Test 5 profiles manually
4. Fix underlying issue
5. Resume at 50% volume
6. Scale back up gradually

### Message Quality Issues
1. Review last 20 AI messages
2. Check if prompt needs updating
3. Verify HubSpot data quality
4. Test new prompt with 10 contacts
5. Deploy if improved

---

**Keep this handy! Bookmark for quick reference. 📌**

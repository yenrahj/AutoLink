# 🔄 Adaptation Guide - Deploy for New Rep or Company

## Overview

This system is **fully modular** - all company-specific information, messaging, and targeting is in `config/config.js`.

**To deploy for a new rep or company**: Just edit the config file. No code changes needed!

---

## ⚡ Quick Adaptation (30 minutes)

### Step 1: Company Information (10 min)

Edit `config/config.js` → `company` section:

```javascript
company: {
  name: "YOUR COMPANY NAME",
  
  product: {
    name: "YOUR PRODUCT/SERVICE",
    shortDescription: "Brief description of what you sell",
    
    valueProps: [
      "Key value proposition #1",
      "Key value proposition #2",
      "Key value proposition #3"
    ],
    
    painPoints: [
      "Problem you solve #1",
      "Problem you solve #2",  
      "Problem you solve #3"
    ],
    
    idealCustomer: {
      industries: [
        "Target Industry 1",
        "Target Industry 2"
      ],
      employeeCount: "500-10,000 employees",
      indicators: [
        "Characteristic of ideal customer",
        "Another characteristic"
      ]
    }
  }
}
```

**Example (SaaS Company)**:
```javascript
company: {
  name: "Acme Analytics",
  product: {
    name: "Revenue Intelligence Platform",
    shortDescription: "AI-powered sales forecasting and pipeline management",
    valueProps: [
      "Improve forecast accuracy by 30%",
      "Identify at-risk deals before they slip",
      "Automate pipeline hygiene and reporting"
    ],
    painPoints: [
      "Inaccurate sales forecasts",
      "Lack of pipeline visibility",
      "Manual CRM data entry and cleanup"
    ]
  }
}
```

### Step 2: Sales Rep Information (5 min)

Edit `config/config.js` → `rep` section:

```javascript
rep: {
  firstName: "Rep First Name",
  lastName: "Rep Last Name",
  title: "Their Job Title",
  linkedInProfile: "https://linkedin.com/in/their-profile",
  
  communicationStyle: {
    tone: "professional but conversational",  // or "formal", "casual", etc.
    
    commonPhrases: [
      "Phrases this rep commonly uses",
      "Another common phrase"
    ],
    
    avoidPhrases: [
      "Buzzwords to avoid",
      "Overused phrases to skip"
    ]
  }
}
```

### Step 3: Update Personas (15 min)

Edit `config/config.js` → `personas` section:

**For each target persona**, update:

```javascript
"Persona Name": {
  // Sales Navigator search criteria
  salesNavSearch: {
    keywords: 'Title OR "Alternative Title" OR Keywords',
    seniority: ['VP', 'Director', 'CXO'],
    industries: ['Industry 1', 'Industry 2'],
    companyHeadcount: ['1001-5000', '5001-10000'],
    geography: 'United States'
  },
  
  // Messaging themes
  messaging: {
    primaryPainPoints: [
      "What keeps them up at night",
      "Another major challenge"
    ],
    
    valueProps: [
      "How you help them",
      "Another benefit"
    ],
    
    effectiveAngles: [
      "Question that resonates",
      "Another conversation starter"
    ]
  },
  
  interests: [
    "topics they care about",
    "industry trends they follow"
  ]
}
```

---

## 📋 Complete Adaptation Checklist

### Company & Product
- [ ] Company name updated
- [ ] Product name and description updated
- [ ] Value propositions match your offering
- [ ] Pain points are accurate
- [ ] Ideal customer profile defined
- [ ] Industries list is correct
- [ ] Website URLs updated

### Sales Rep
- [ ] Rep name and title updated
- [ ] LinkedIn profile URL correct
- [ ] Communication style matches rep's voice
- [ ] Common phrases are authentic
- [ ] Avoid phrases list is relevant

### Target Personas (for each)
- [ ] Persona name is clear
- [ ] Sales Navigator keywords are specific
- [ ] Seniority levels match targets
- [ ] Industries match your ICP
- [ ] Company headcount is correct
- [ ] Geography settings are right
- [ ] Pain points resonate with persona
- [ ] Value props are relevant
- [ ] Effective angles are tested
- [ ] Interest topics are accurate

### Environment Variables
- [ ] LinkedIn email updated (rep's account)
- [ ] LinkedIn password updated
- [ ] HubSpot token updated (if different instance)
- [ ] OpenAI API key added
- [ ] Cron secret generated

### HubSpot Configuration
- [ ] Custom properties created
- [ ] Lifecycle stages mapped correctly
- [ ] Lead source updated to your company
- [ ] Persona values match config

---

## 🎯 Example: Adapting for Different Companies

### Example 1: B2B SaaS (Sales Tool)

```javascript
company: {
  name: "SalesBoost",
  product: {
    name: "AI Sales Assistant",
    shortDescription: "Automated prospecting and email sequencing",
    valueProps: [
      "3x more qualified meetings booked",
      "80% time saved on manual prospecting",
      "Higher email response rates with AI personalization"
    ],
    painPoints: [
      "SDRs spending too much time on research",
      "Low email response rates", 
      "Can't scale outbound effectively"
    ]
  }
},

personas: {
  "Sales Leader": {
    salesNavSearch: {
      keywords: 'VP Sales OR "Head of Sales" OR "Chief Revenue Officer" OR CRO',
      seniority: ['VP', 'CXO'],
      industries: ['Computer Software', 'Information Technology'],
      companyHeadcount: ['201-500', '501-1000'],
      geography: 'United States'
    },
    messaging: {
      primaryPainPoints: [
        "Sales team not hitting quota",
        "Inefficient prospecting workflows",
        "Need more pipeline generated"
      ],
      effectiveAngles: [
        "How are you thinking about scaling your SDR team?",
        "What's your current approach to outbound prospecting?"
      ]
    }
  }
}
```

### Example 2: Professional Services (Consulting)

```javascript
company: {
  name: "Acme Consulting",
  product: {
    name: "Digital Transformation Consulting",
    shortDescription: "Strategic consulting for enterprise cloud migrations",
    valueProps: [
      "Reduce migration risks and downtime",
      "Accelerate cloud adoption timeline",
      "Ensure security and compliance requirements"
    ],
    painPoints: [
      "Complex legacy infrastructure",
      "Skills gaps in cloud technologies",
      "Budget overruns on digital initiatives"
    ]
  }
},

personas: {
  "CIO": {
    salesNavSearch: {
      keywords: 'CIO OR "Chief Information Officer" OR "VP IT" OR "VP Technology"',
      seniority: ['VP', 'CXO'],
      industries: ['Financial Services', 'Manufacturing', 'Retail'],
      companyHeadcount: ['1001-5000', '5001-10000'],
      geography: 'United States'
    },
    messaging: {
      primaryPainPoints: [
        "Legacy systems hindering innovation",
        "Cloud migration complexity",
        "Technical debt accumulation"
      ],
      effectiveAngles: [
        "How are you approaching your cloud strategy?",
        "What's your biggest challenge with digital transformation?"
      ]
    }
  }
}
```

### Example 3: HR Tech (Different from AllCampus)

```javascript
company: {
  name: "TalentFlow",
  product: {
    name: "Applicant Tracking System",
    shortDescription: "Modern ATS with AI-powered candidate matching",
    valueProps: [
      "Cut time-to-hire by 40%",
      "Improve candidate quality with AI matching",
      "Better candidate experience = higher acceptance"
    ],
    painPoints: [
      "Too many unqualified applicants",
      "Manual resume screening takes forever",
      "Losing great candidates to slow process"
    ]
  }
},

personas: {
  "TA Leader": {
    salesNavSearch: {
      keywords: 'Talent Acquisition OR Recruiting OR "VP TA" OR "Head of Recruiting"',
      seniority: ['VP', 'Director', 'Manager'],
      industries: ['Technology', 'Healthcare', 'Financial Services'],
      companyHeadcount: ['501-1000', '1001-5000'],
      geography: 'United States'
    },
    messaging: {
      primaryPainPoints: [
        "High volume of low-quality applicants",
        "Recruiters drowning in resumes",
        "Slow hiring process losing candidates"
      ],
      effectiveAngles: [
        "How are you handling the volume of applicants?",
        "What's working for your candidate screening process?"
      ]
    }
  }
}
```

---

## 🔧 Advanced Customization

### Adjusting AI Behavior

Edit `config/config.js` → `ai` section:

```javascript
ai: {
  model: "gpt-4",  // or "gpt-3.5-turbo" for lower cost
  
  icebreaker: {
    temperature: 0.8,  // Higher = more creative (0.0-1.0)
    maxTokens: 150,    // Longer icebreakers if needed
  },
  
  connectionMessage: {
    temperature: 0.7,  // Lower = more consistent
  }
}
```

**Temperature guide**:
- **0.3-0.5**: Consistent, predictable, safe
- **0.6-0.7**: Balanced (recommended)
- **0.8-0.9**: Creative, varied, more natural
- **1.0**: Very creative, sometimes unpredictable

### Adjusting Daily Limits

Edit `config/config.js` → `automation.limits`:

```javascript
limits: {
  connectionRequests: 10,  // Start conservative
  messages: 20,
  warmUpEngagements: 15
}
```

**Recommendations by account type**:

| Account Type | Connections/Day | Messages/Day |
|-------------|----------------|--------------|
| New account | 5-10 | 10-15 |
| Personal (1 year+) | 10-15 | 20-30 |
| Sales Navigator | 15-20 | 30-40 |

### Adjusting Timing

Edit `config/config.js` → `automation.timing`:

```javascript
timing: {
  delayBetweenActions: {
    min: 3000,  // More conservative = safer
    max: 7000
  }
}
```

---

## 🧪 Testing Your Configuration

### Step 1: Validate Config

```bash
node -e "const config = require('./config/config'); console.log(JSON.stringify(config, null, 2))"
```

Check for:
- No syntax errors
- All required fields present
- Persona names match throughout

### Step 2: Test AI Generation

Create `test-ai.js`:
```javascript
const AIContentGenerator = require('./lib/ai-content-modular');
const ai = new AIContentGenerator();

// Test icebreaker generation
const testData = {
  name: "John Smith",
  title: "VP Sales",
  company: "Acme Corp",
  recentActivities: ["Posted about sales automation"]
};

ai.generateIcebreakerFromSalesNav(testData, "Sales Leader")
  .then(icebreaker => console.log("Icebreaker:", icebreaker));
```

Run: `node test-ai.js`

### Step 3: Test with 1-2 Prospects

Set in `.env.local`:
```bash
MAX_CONNECTIONS_PER_DAY=2
```

Monitor results and adjust config as needed.

---

## 📊 Monitoring Performance by Config

Track these metrics to optimize your config:

### Messaging Performance
- **Acceptance rate by persona** - Which personas respond best?
- **Reply rate by value prop** - Which angles work?
- **Meeting rate by pain point** - Which problems resonate?

### AI Quality Indicators
- Read first 20 icebreakers - Are they personalized enough?
- Check connection messages - Do they sound like the rep?
- Review comments - Are they adding value?

### Adjustment Triggers

**If acceptance rate < 40%**:
- Review persona targeting (too broad?)
- Check message quality (too salesy?)
- Adjust AI temperature (more creative?)

**If messages sound generic**:
- Add more specific value props in config
- Include more rep communication style examples
- Lower AI temperature for more consistency

**If wrong prospects getting targeted**:
- Refine Sales Navigator keywords
- Adjust company headcount filters
- Update industry list

---

## 🚀 Deploying for Multiple Reps

### Option 1: Separate Deployments (Recommended)

Each rep gets their own:
- Vercel project
- Config file
- Environment variables

**Pros**: Complete isolation, easier to manage
**Cons**: More deployments to maintain

### Option 2: Single Deployment, Multiple Configs

Use environment variable to select config:

```javascript
// config-loader.js
const repName = process.env.REP_NAME || 'jack';
const config = require(`./configs/${repName}.js`);
module.exports = config;
```

**Pros**: One deployment
**Cons**: More complex, shared cron timing

---

## ✅ Go-Live Checklist (New Company/Rep)

- [ ] Config file completely updated
- [ ] Test AI generation with your data
- [ ] Environment variables set
- [ ] HubSpot properties created
- [ ] Sales Navigator searches defined
- [ ] Deploy to Vercel
- [ ] Test with 2-3 prospects
- [ ] Review AI-generated content quality
- [ ] Monitor acceptance rate
- [ ] Adjust config based on results
- [ ] Scale up gradually

---

## 💡 Pro Tips

1. **Start with one persona** - Perfect it, then add more
2. **Review first 20 messages** - Ensure quality before scaling
3. **A/B test value props** - Try different angles
4. **Document what works** - Build a playbook
5. **Share successful configs** - Help other reps

---

## 📞 Need Help?

Common issues:

**"AI messages don't sound like me"**
→ Add more examples to `rep.communicationStyle.commonPhrases`

**"Wrong prospects getting targeted"**
→ Refine `salesNavSearch.keywords` in persona config

**"Messages are too generic"**
→ Add more specific `valueProps` and `painPoints` in config

**"Acceptance rate is low"**
→ Try different `effectiveAngles` in persona messaging

---

**The beauty of this system: Change the config, redeploy, done. No code changes ever needed!** 🎯

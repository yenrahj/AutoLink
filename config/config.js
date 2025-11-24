/**
 * MASTER CONFIGURATION FILE
 * 
 * This file contains ALL customizable settings for the LinkedIn automation system.
 * When deploying for a new rep or company, simply update this file.
 * 
 * NO CODE CHANGES REQUIRED - just edit this config!
 */

module.exports = {
  
  // ========================================
  // COMPANY & PRODUCT INFORMATION
  // ========================================
  
  company: {
    name: "AllCampus Workplace",
    
    // Product/service description
    product: {
      name: "Employer-Sponsored Education Platform",
      shortDescription: "Career pathway programs and upskilling solutions",
      
      // Key value propositions (used in messaging)
      valueProps: [
        "Improve employee retention through upskilling programs",
        "Provide clear career pathways for workforce development",
        "Reduce hiring costs with internal mobility solutions",
        "Boost employee satisfaction with education benefits"
      ],
      
      // Main pain points you solve
      painPoints: [
        "High turnover in hourly/frontline roles",
        "Skills gaps in critical positions",
        "Difficulty recruiting qualified candidates",
        "Low employee engagement and satisfaction"
      ],
      
      // Target company characteristics
      idealCustomer: {
        industries: [
          "Healthcare",
          "Technology", 
          "Financial Services",
          "Retail",
          "Manufacturing"
        ],
        employeeCount: "500-10,000 employees",
        indicators: [
          "Large hourly workforce",
          "Multi-location operations",
          "Skills-based hiring initiatives",
          "DEI programs"
        ]
      }
    },
    
    // Social proof (optional - used when relevant)
    socialProof: {
      customerCount: "100+",
      notableCustomers: [], // Add if you want to mention: ["Company A", "Company B"]
      stats: [
        "85% program completion rate",
        "40% reduction in turnover"
      ]
    },
    
    // Your website and resources
    website: "https://allcampusworkplace.com",
    caseStudiesUrl: "https://allcampusworkplace.com/case-studies",
    pricingUrl: "https://allcampusworkplace.com/pricing"
  },

  // ========================================
  // SALES REP INFORMATION
  // ========================================
  
  rep: {
    // This info is used for personalization
    firstName: "Jack",
    lastName: "[Your Last Name]",
    title: "Sales Development Representative", // or whatever your title is
    linkedInProfile: "https://linkedin.com/in/your-profile",
    
    // Communication style (used by AI to match your tone)
    communicationStyle: {
      tone: "professional but conversational",
      approachability: "friendly, consultative",
      formalityLevel: "business casual",
      
      // Phrases you commonly use (AI will incorporate these)
      commonPhrases: [
        "curious how you're approaching",
        "would love to learn more about",
        "happy to share what we're seeing"
      ],
      
      // Words/phrases to avoid
      avoidPhrases: [
        "reach out",
        "circle back", 
        "synergy",
        "game-changer"
      ]
    }
  },

  // ========================================
  // TARGET PERSONAS
  // ========================================
  
  personas: {
    
    "HR Executive": {
      // Sales Navigator search criteria
      salesNavSearch: {
        keywords: 'CHRO OR "Chief Human Resources" OR "VP Human Resources" OR "VP HR" OR "Head of HR"',
        seniority: ['VP', 'CXO', 'Owner'],
        industries: ['Hospital & Health Care', 'Technology', 'Financial Services'],
        companyHeadcount: ['501-1000', '1001-5000', '5001-10000'],
        geography: 'United States'
      },
      
      // Messaging themes
      messaging: {
        primaryPainPoints: [
          "Retention of hourly workforce",
          "Competitive benefits packages",
          "Diversity and internal mobility"
        ],
        
        valueProps: [
          "Differentiated benefits that improve retention",
          "Career pathways for frontline workers",
          "Measurable ROI on education programs"
        ],
        
        // Questions/angles that resonate
        effectiveAngles: [
          "How are you approaching retention in [specific role type]?",
          "What's your strategy for building internal career pathways?",
          "How are you thinking about education benefits as a competitive advantage?"
        ]
      },
      
      // Content they care about
      interests: [
        "retention strategies",
        "employee benefits",
        "workforce development",
        "employer branding",
        "HR technology"
      ]
    },

    "L&D Leader": {
      salesNavSearch: {
        keywords: 'Learning OR "Talent Development" OR "L&D" OR Training OR "Chief Learning Officer" OR CLO',
        seniority: ['VP', 'Director', 'Manager'],
        industries: ['Hospital & Health Care', 'Technology', 'Financial Services', 'Retail'],
        companyHeadcount: ['1001-5000', '5001-10000', '10000+'],
        geography: 'United States'
      },
      
      messaging: {
        primaryPainPoints: [
          "Scaling L&D programs across distributed workforce",
          "Measuring learning outcomes and ROI",
          "Limited budget for development programs"
        ],
        
        valueProps: [
          "Turnkey education programs with no internal lift",
          "Built-in analytics and outcome tracking",
          "Flexible program that serves all employee levels"
        ],
        
        effectiveAngles: [
          "How are you providing development opportunities to hourly workers?",
          "What's working for your upskilling programs?",
          "How do you measure the impact of your L&D initiatives?"
        ]
      },
      
      interests: [
        "learning technology",
        "skills development",
        "training programs",
        "employee development",
        "learning analytics"
      ]
    },

    "Benefits Director": {
      salesNavSearch: {
        keywords: 'Benefits OR "Total Rewards" OR "Compensation and Benefits" OR "Director of Benefits"',
        seniority: ['Director', 'VP', 'Manager'],
        industries: ['Hospital & Health Care', 'Technology', 'Financial Services'],
        companyHeadcount: ['501-1000', '1001-5000', '5001-10000'],
        geography: 'United States'
      },
      
      messaging: {
        primaryPainPoints: [
          "Rising costs of traditional benefits",
          "Low utilization of existing benefits",
          "Differentiating benefits package from competitors"
        ],
        
        valueProps: [
          "High-value, low-cost education benefit",
          "Strong employee engagement and utilization",
          "Employer-paid with flexible program options"
        ],
        
        effectiveAngles: [
          "How are you approaching education benefits in your package?",
          "What are you seeing for engagement with development programs?",
          "How do you balance benefit costs with employee value?"
        ]
      },
      
      interests: [
        "employee benefits",
        "total rewards",
        "benefit trends",
        "employee wellness",
        "benefit costs"
      ]
    }

    // ADD MORE PERSONAS HERE AS NEEDED
    // Copy the structure above and customize for new personas
    
  },

  // ========================================
  // SALES NAVIGATOR SETTINGS
  // ========================================
  
  salesNavigator: {
    
    // How many prospects to pull per search per week
    prospectsPerSearch: 25,
    
    // Which saved searches to sync from (optional - if you use saved searches)
    savedSearches: [
      // Example: "HR Leaders - Healthcare",
      // Example: "L&D Directors - Tech"
    ],
    
    // Sales Navigator list names (create these in Sales Navigator)
    lists: {
      warmUp: "01 - Warm Up Phase",
      readyToConnect: "02 - Ready to Connect", 
      pending: "03 - Connection Pending",
      connected: "04 - Connected",
      hotLeads: "05 - Hot Leads"
    },
    
    // Enable/disable specific features
    features: {
      extractInsights: true,      // Extract talking points, activities, etc.
      checkJobChanges: true,      // Monitor for job changes
      useTeamLink: true,          // Check for warm intro paths
      trackSharedConnections: true // Note shared connections
    }
  },

  // ========================================
  // MESSAGING TEMPLATES & GUIDELINES
  // ========================================
  
  messaging: {
    
    // Connection request message structure
    connectionRequest: {
      maxLength: 280, // LinkedIn character limit
      
      structure: [
        "Personalized opener (reference their activity/shared connection)",
        "Brief context about why you're reaching out",
        "Soft value proposition",
        "Request to connect"
      ],
      
      // Examples of good openers (AI learns from these)
      exampleOpeners: [
        "I saw your recent post about [topic] and it resonated...",
        "Noticed we're both connected to [name] and thought I'd reach out...",
        "Your work on [initiative] at [company] caught my attention..."
      ],
      
      // What NOT to do
      avoid: [
        "Generic 'I'd like to add you to my network'",
        "Immediate sales pitch",
        "Talking only about your company",
        "Being too formal or robotic"
      ]
    },
    
    // Follow-up message after connection accepted
    followUpMessage: {
      structure: [
        "Thank for connecting",
        "Brief context/icebreaker callback",
        "Share relevant value/insight",
        "Soft CTA (question or offer)"
      ],
      
      timing: "2-3 days after connection accepted",
      
      maxLength: 500, // Keep it concise
      
      callToAction: {
        type: "question", // or "offer", "share"
        examples: [
          "Curious how you're approaching [pain point] at [company]?",
          "Would you be open to a brief conversation about [topic]?",
          "Happy to share what we're seeing work for similar companies?"
        ]
      }
    },
    
    // Post engagement (warm-up phase)
    postEngagement: {
      commentStyle: "thoughtful and additive",
      commentLength: "1-2 sentences",
      
      approach: [
        "Reference specific point from their post",
        "Add insight or ask thoughtful question",
        "Avoid generic 'great post!' comments"
      ]
    },
    
    // InMail messages (if using)
    inMail: {
      subjectLineLength: 60,
      bodyLength: 1500,
      
      structure: [
        "Personalized opening",
        "Establish credibility",
        "Clear value proposition",
        "Specific call-to-action"
      ]
    }
  },

  // ========================================
  // AUTOMATION BEHAVIOR SETTINGS
  // ========================================
  
  automation: {
    
    // Daily volume limits (conservative for personal account)
    limits: {
      connectionRequests: 10,  // Per day
      messages: 20,            // Per day
      warmUpEngagements: 15,   // Per day
      inMails: 5               // Per day (if using)
    },
    
    // Timing and delays
    timing: {
      delayBetweenActions: {
        min: 3000,  // 3 seconds
        max: 7000   // 7 seconds
      },
      
      // When to run cron jobs (24-hour format)
      cronSchedule: {
        prospecting: "Monday at 8:00 AM",
        warmUp: "Daily at 11:00 AM",
        connections: "Daily at 9:00 AM",
        messages: "Daily at 2:00 PM"
      }
    },
    
    // Warm-up phase settings
    warmUp: {
      engagementsRequired: 3,  // Number of engagements before connection
      daysToSpread: 5,         // Spread engagements over how many days
      engagementTypes: [
        { type: "like", weight: 0.4 },
        { type: "comment", weight: 0.6 }
      ]
    },
    
    // Graduation criteria
    graduation: {
      // When to move from warm-up to ready for connection
      warmUpComplete: "3 engagements completed",
      
      // When to consider a lead "hot"
      hotLeadCriteria: {
        emailOpens: 5,
        linkClicks: 2,
        replied: true
      }
    },
    
    // Safety settings
    safety: {
      maxDailyActions: 50,           // Total actions per day
      pauseOnWarning: true,          // Stop if LinkedIn warning detected
      weeklyRestDay: "Sunday",       // No automation on this day
      monthlyLightWeek: "first",     // Run at 50% volume this week of month
      
      // Error handling
      maxRetries: 3,
      backoffMultiplier: 2,          // 2x delay between retries
      
      // Account health checks
      healthChecks: {
        acceptanceRateThreshold: 0.40,  // Pause if below 40%
        errorRateThreshold: 0.10,       // Pause if above 10% errors
        checkFrequency: "daily"
      }
    }
  },

  // ========================================
  // AI SETTINGS
  // ========================================
  
  ai: {
    
    // OpenAI model settings
    model: "gpt-4",
    temperature: 0.7,  // 0.0-1.0 (higher = more creative)
    
    // Icebreaker generation
    icebreaker: {
      temperature: 0.8,  // Slightly more creative for icebreakers
      maxTokens: 150,
      
      instructions: [
        "Be specific and reference their actual data",
        "Keep it natural and conversational",
        "Show genuine interest in their work",
        "Make it relevant to their role/challenges"
      ]
    },
    
    // Connection message generation  
    connectionMessage: {
      temperature: 0.7,
      maxTokens: 100,
      
      instructions: [
        "Use the icebreaker naturally",
        "Mention shared connections when relevant",
        "Be concise (280 chars)",
        "Professional but friendly tone"
      ]
    },
    
    // Comment generation
    comment: {
      temperature: 0.8,
      maxTokens: 150,
      
      instructions: [
        "Reference specific points from their post",
        "Add value or insight",
        "Ask thoughtful question when appropriate",
        "Never be generic or salesy"
      ]
    },
    
    // Follow-up message generation
    followUp: {
      temperature: 0.7,
      maxTokens: 200,
      
      instructions: [
        "Acknowledge the connection",
        "Reference earlier context",
        "Provide value or insight",
        "Include soft CTA"
      ]
    }
  },

  // ========================================
  // HUBSPOT INTEGRATION SETTINGS
  // ========================================
  
  hubspot: {
    
    // Property mappings
    propertyMappings: {
      // Standard HubSpot properties (use these, don't create custom)
      firstName: "firstname",
      lastName: "lastname", 
      email: "email",
      company: "company",
      title: "jobtitle",
      phone: "phone",
      city: "city",
      state: "state",
      linkedInUrl: "hs_linkedin_url",  // Standard HubSpot field
      
      // Custom properties (create these in HubSpot)
      salesNavUrl: "sales_nav_profile_url",
      icebreaker: "icebreaker",
      automationStatus: "linkedin_automation_status",
      warmUpCount: "linkedin_warm_up_count",
      lastActivity: "linkedin_last_activity",
      lastEngagementType: "linkedin_last_engagement_type",
      connectionMessage: "linkedin_connection_message",
      messageContent: "linkedin_message_content",
      lastError: "linkedin_last_error",
      connectionDate: "linkedin_connection_date",
      
      // Sales Navigator data
      insights: "sales_nav_insights",
      connectionPath: "connection_path",
      sharedConnections: "shared_connections",
      recentJobChange: "recent_job_change",
      inMailCreditsUsed: "inmail_credits_used",
      salesNavList: "sales_nav_list",
      
      // Persona
      persona: "persona"
    },
    
    // Lifecycle stage mapping
    lifecycleStages: {
      new: "lead",
      connected: "marketing_qualified_lead",
      replied: "sales_qualified_lead",
      meeting: "opportunity"
    },
    
    // Lead source
    leadSource: "LinkedIn Sales Navigator",
    
    // Deal pipeline (if creating deals automatically)
    dealPipeline: {
      create: false,  // Set to true to auto-create deals
      pipelineId: null,
      defaultStage: "appointment_scheduled"
    }
  },

  // ========================================
  // REPORTING & ANALYTICS
  // ========================================
  
  reporting: {
    
    // What metrics to track
    metrics: [
      "prospects_added",
      "connection_requests_sent",
      "acceptance_rate",
      "messages_sent", 
      "reply_rate",
      "meetings_booked",
      "pipeline_created"
    ],
    
    // When to send summary reports (optional)
    summaryReports: {
      enabled: false,  // Set to true to enable
      frequency: "weekly",  // "daily", "weekly", "monthly"
      recipients: []  // Add email addresses
    },
    
    // Goals (for tracking progress)
    goals: {
      weeklyConnectionRequests: 50,
      weeklyAcceptanceRate: 0.55,
      weeklyReplies: 8,
      monthlyMeetings: 10
    }
  }

};

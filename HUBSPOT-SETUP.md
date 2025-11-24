[HUBSPOT-SETUP.md](https://github.com/user-attachments/files/23729224/HUBSPOT-SETUP.md)
# HubSpot Setup Guide - Standard vs Custom Properties

## Overview

HubSpot has **standard properties** that already exist - we'll use those!
You only need to create **custom properties** that don't exist yet.

---

## ✅ Standard Properties (Already Exist - Just Use Them)

These are **built into HubSpot** - no setup needed:

| Property | Internal Name | Type | Notes |
|----------|--------------|------|-------|
| First Name | `firstname` | Text | Standard contact property |
| Last Name | `lastname` | Text | Standard contact property |
| Email | `email` | Text | Standard contact property |
| Job Title | `jobtitle` | Text | Standard contact property |
| Company | `company` | Text | Standard contact property |
| Phone | `phone` | Text | Standard contact property |
| City | `city` | Text | Standard contact property |
| State | `state` | Text | Standard contact property |
| **LinkedIn Profile URL** | `hs_linkedin_url` | Text | ⭐ Use this for LinkedIn URLs! |
| Lifecycle Stage | `lifecyclestage` | Dropdown | Standard stages |
| Lead Source | `lead_source` | Text | Track source |

**Action Required**: ✅ None - these already exist!

---

## 🔧 Custom Properties (Need to Create These)

### Required Custom Properties

Create these on the **Contact** object in HubSpot:

#### 1. LinkedIn Automation Status
- **Name**: LinkedIn Automation Status
- **Internal Name**: `linkedin_automation_status`
- **Type**: Dropdown select
- **Options**:
  - `warm_up_phase`
  - `ready_for_connection`
  - `connection_pending`
  - `connected_pending_message`
  - `message_sent`
  - `connection_failed`
  - `message_failed`
  - `error_no_url`
- **Purpose**: Track where contact is in automation workflow

#### 2. Icebreaker
- **Name**: Icebreaker
- **Internal Name**: `icebreaker`
- **Type**: Multi-line text
- **Purpose**: Store AI-generated icebreaker from Sales Navigator data

#### 3. LinkedIn Warm-Up Count
- **Name**: LinkedIn Warm-Up Count
- **Internal Name**: `linkedin_warm_up_count`
- **Type**: Number
- **Default**: 0
- **Purpose**: Track number of engagements before connection request

#### 4. LinkedIn Last Activity
- **Name**: LinkedIn Last Activity
- **Internal Name**: `linkedin_last_activity`
- **Type**: Date picker
- **Purpose**: Track last time we engaged with them

#### 5. LinkedIn Last Engagement Type
- **Name**: LinkedIn Last Engagement Type
- **Internal Name**: `linkedin_last_engagement_type`
- **Type**: Dropdown select
- **Options**: `like`, `comment`, `skip`
- **Purpose**: Track type of last engagement

#### 6. LinkedIn Connection Message
- **Name**: LinkedIn Connection Message
- **Internal Name**: `linkedin_connection_message`
- **Type**: Multi-line text
- **Purpose**: Store the connection request message we sent

#### 7. LinkedIn Message Content
- **Name**: LinkedIn Message Content
- **Internal Name**: `linkedin_message_content`
- **Type**: Multi-line text
- **Purpose**: Store follow-up messages

#### 8. LinkedIn Last Error
- **Name**: LinkedIn Last Error
- **Internal Name**: `linkedin_last_error`
- **Type**: Single-line text
- **Purpose**: Track any errors for debugging

#### 9. LinkedIn Connection Date
- **Name**: LinkedIn Connection Date
- **Internal Name**: `linkedin_connection_date`
- **Type**: Date picker
- **Purpose**: When they accepted connection

---

### Sales Navigator Specific Properties

#### 10. Sales Navigator Profile URL
- **Name**: Sales Navigator Profile URL
- **Internal Name**: `sales_nav_profile_url`
- **Type**: Single-line text
- **Purpose**: Direct link to Sales Navigator profile (different from standard LinkedIn URL)

#### 11. Sales Navigator Insights
- **Name**: Sales Navigator Insights
- **Internal Name**: `sales_nav_insights`
- **Type**: Multi-line text
- **Purpose**: Store extracted insights (activities, talking points, etc.)

#### 12. Connection Path
- **Name**: Connection Path
- **Internal Name**: `connection_path`
- **Type**: Dropdown select
- **Options**: `1st`, `2nd`, `3rd`, `Out of network`
- **Purpose**: How we're connected on LinkedIn

#### 13. Shared Connections
- **Name**: Shared Connections
- **Internal Name**: `shared_connections`
- **Type**: Multi-line text
- **Purpose**: Names of mutual LinkedIn connections

#### 14. Recent Job Change
- **Name**: Recent Job Change
- **Internal Name**: `recent_job_change`
- **Type**: Checkbox
- **Purpose**: Flag if they recently changed jobs

#### 15. InMail Credits Used
- **Name**: InMail Credits Used
- **Internal Name**: `inmail_credits_used`
- **Type**: Number
- **Purpose**: Track InMail usage

#### 16. Sales Navigator List
- **Name**: Sales Navigator List
- **Internal Name**: `sales_nav_list`
- **Type**: Dropdown select
- **Options**: (match your Sales Nav list names)
  - `01 - Warm Up Phase`
  - `02 - Ready to Connect`
  - `03 - Connection Pending`
  - `04 - Connected`
  - `05 - Hot Leads`
- **Purpose**: Track which Sales Nav list they're in

#### 17. Persona
- **Name**: Persona
- **Internal Name**: `persona`
- **Type**: Dropdown select
- **Options**: (match your config.js personas)
  - `HR Executive`
  - `L&D Leader`
  - `Benefits Director`
- **Purpose**: Tag which persona/ICP they match

---

## 🚀 Quick Setup Steps

### Step 1: Access Custom Properties

1. Go to **Settings** (gear icon)
2. Navigate to **Data Management** → **Properties**
3. Select **Contact properties**
4. Click **Create property**

### Step 2: Create Each Custom Property

For each property above:

1. Click **Create property**
2. Select the **Type** (Dropdown, Text, Number, etc.)
3. Enter **Label** (the display name)
4. HubSpot will auto-generate **Internal name** - verify it matches above
5. For dropdowns, add all **Options**
6. Click **Create**

**Estimated time**: 15-20 minutes for all 17 properties

---

## 📊 Property Usage in Automation

### Standard Properties (HubSpot Built-in)
```javascript
// Used for basic contact info
firstname: "John"
lastname: "Smith"
email: "john@company.com"
jobtitle: "VP HR"
company: "Acme Corp"
hs_linkedin_url: "https://linkedin.com/in/johnsmith"  // ⭐ Standard field
```

### Custom Properties (You Create)
```javascript
// Used for automation tracking
linkedin_automation_status: "warm_up_phase"
linkedin_warm_up_count: 2
icebreaker: "AI-generated icebreaker text here..."
sales_nav_profile_url: "https://linkedin.com/sales/people/..."
sales_nav_insights: "Recent activities, talking points..."
persona: "HR Executive"
```

---

## 🔍 Finding Properties in HubSpot

### View All Properties
Settings → Data Management → Properties → Contact properties

### Check if a Property Exists
1. Search for property name in search bar
2. If it shows up → it exists (standard or already created)
3. If not found → you need to create it

### Standard vs Custom Indicator
- **Standard properties**: Have a "HubSpot" badge
- **Custom properties**: Show when they were created

---

## 🎯 Why Use `hs_linkedin_url` Instead of Custom?

**Benefits of using standard HubSpot field**:

✅ **Already exists** - no setup needed
✅ **Built-in validation** - HubSpot validates LinkedIn URL format
✅ **Used by other integrations** - LinkedIn Sales Navigator, other tools
✅ **Appears in contact sidebar** - easy visibility
✅ **Searchable** - HubSpot indexes it for search
✅ **Reportable** - included in standard reports

**Our approach**:
- Use `hs_linkedin_url` for standard LinkedIn profile URL
- Use `sales_nav_profile_url` (custom) for Sales Navigator specific URL

---

## 📋 Complete Setup Checklist

### Prerequisites
- [ ] HubSpot account with access to create properties
- [ ] Super Admin or Property Editor permissions

### Standard Properties (No Action)
- [x] `hs_linkedin_url` - Already exists!
- [x] `firstname`, `lastname`, `email` - Already exist!
- [x] All other standard fields - Already exist!

### Custom Properties to Create (17 total)
- [ ] `linkedin_automation_status` (Dropdown)
- [ ] `icebreaker` (Multi-line text)
- [ ] `linkedin_warm_up_count` (Number)
- [ ] `linkedin_last_activity` (Date)
- [ ] `linkedin_last_engagement_type` (Dropdown)
- [ ] `linkedin_connection_message` (Multi-line text)
- [ ] `linkedin_message_content` (Multi-line text)
- [ ] `linkedin_last_error` (Single-line text)
- [ ] `linkedin_connection_date` (Date)
- [ ] `sales_nav_profile_url` (Single-line text)
- [ ] `sales_nav_insights` (Multi-line text)
- [ ] `connection_path` (Dropdown)
- [ ] `shared_connections` (Multi-line text)
- [ ] `recent_job_change` (Checkbox)
- [ ] `inmail_credits_used` (Number)
- [ ] `sales_nav_list` (Dropdown)
- [ ] `persona` (Dropdown)

### Verify Setup
- [ ] All custom properties created
- [ ] Dropdown options match config
- [ ] Test creating a contact with all fields
- [ ] Verify automation can read/write properties

---

## 🧪 Testing Property Setup

### Create Test Contact

```javascript
// Via HubSpot API or manually
{
  firstname: "Test",
  lastname: "Contact",
  email: "test@example.com",
  hs_linkedin_url: "https://linkedin.com/in/test",  // Standard field
  linkedin_automation_status: "warm_up_phase",      // Custom field
  persona: "HR Executive",                          // Custom field
  linkedin_warm_up_count: 0                         // Custom field
}
```

### Verify You Can:
- [x] Create contact with all properties
- [x] Update property values
- [x] Filter contacts by custom properties
- [x] Create lists using custom properties
- [x] Build workflows with custom properties

---

## 💡 Pro Tips

### Tip 1: Group Related Properties
In HubSpot property settings, use **Property Groups** to organize:
- "LinkedIn Automation" group
- "Sales Navigator Data" group

Makes it easier to find and manage.

### Tip 2: Add Descriptions
For each custom property, add a **Description** explaining:
- What it's used for
- Valid values
- When it's populated

Helps other team members understand.

### Tip 3: Set Field Dependencies
Some properties only matter in certain states:
- `linkedin_connection_message` only relevant if status = `connection_pending`
- `linkedin_message_content` only relevant if status = `connected_pending_message`

Use conditional property rules if needed.

### Tip 4: Create Views
Create custom **contact views** filtered by:
- Status = `warm_up_phase` (contacts being warmed up)
- Status = `connection_pending` (waiting for acceptance)
- Status = `message_sent` (ready for sales to follow up)

---

## 🚨 Common Mistakes to Avoid

❌ **Creating `linkedin_url` custom property**
→ ✅ Use `hs_linkedin_url` (standard field)

❌ **Inconsistent dropdown values**
→ ✅ Match exactly what's in config.js

❌ **Wrong property type**
→ ✅ Number for counts, Date for dates, Dropdown for statuses

❌ **Forgetting to save**
→ ✅ Click "Create" at bottom of property form

❌ **Not testing**
→ ✅ Create a test contact to verify all properties work

---

## 📊 Property Reference Table

| Standard (Use) | Custom (Create) | Purpose |
|---------------|-----------------|---------|
| `hs_linkedin_url` | - | LinkedIn profile URL |
| - | `sales_nav_profile_url` | Sales Navigator URL |
| `jobtitle` | - | Job title |
| - | `persona` | Which ICP they match |
| - | `linkedin_automation_status` | Workflow stage |
| - | `icebreaker` | AI-generated opener |

---

**Remember**: Use standard HubSpot properties wherever they exist. Only create custom properties for automation-specific data! ✅

**Setup time**: ~20 minutes total

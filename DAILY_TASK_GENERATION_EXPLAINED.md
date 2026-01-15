# Daily Task Generation - Complete Explanation

## Overview

When you create a **Task Master** with **Daily** frequency and click **"Generate Tasks"**, here's exactly what happens:

## Key Points

### 1. **Tasks Are NOT Automatically Generated**
- Creating a Task Master does **NOT** automatically create tasks
- Tasks are only created when you click the **"Generate Tasks"** button
- You must manually trigger task generation (or set up automated scheduling)

### 2. **How Many Tasks Are Generated Per Click?**

**Answer: ONE task per Task Master per click**

- Each click of "Generate Tasks" processes **all active Task Masters**
- For each Daily Task Master, it generates **exactly ONE task** (if conditions are met)
- If you have 5 Daily Task Masters, clicking once will create **up to 5 tasks** (one per master)

### 3. **From Which Date Are Tasks Generated?**

**⚠️ IMPORTANT: Start Date is MANDATORY**

- **Start Date MUST be provided** when creating a Task Master
- Tasks can **only** be generated **on or after** the start date
- ❌ If today is **before** start date → No tasks generated
- ✅ If today is **on or after** start date → Tasks can be generated
- ✅ First generation happens on the **start date** (or later if you click later)
- The start date determines when task generation can begin

### 4. **How Tasks Are Planned**

#### Step-by-Step Process:

1. **You click "Generate Tasks"**
   - System gets current date (today)
   - System fetches all active Task Masters

2. **For each Daily Task Master:**
   - ✅ Check 1: Is Task Master active? (`isActive: true`)
   - ✅ Check 2: Is today >= startDate? (if startDate is set)
   - ✅ Check 3: Was last generation before today? (`lastGenerated < today`)
   - ✅ Check 4: Does a task already exist for today? (duplicate check)

3. **If all checks pass:**
   - Creates **ONE task instance** with:
     - **Scheduled Date:** Today
     - **Due Date:** Today (same day for daily frequency)
   - Updates `lastGenerated` timestamp to now

4. **If any check fails:**
   - Skips that Task Master
   - No task created for that master

## Detailed Examples

### Example 1: Daily Task Master WITH Start Date (Same Day)

**Task Master Created:**
- Title: "Daily Safety Check"
- Frequency: Daily
- Start Date: **January 10, 2024** (same day as creation)
- Created: January 10, 2024

**Timeline:**

| Date | Action | Result |
|------|--------|--------|
| Jan 10 | Create Task Master | ✅ Task Master created (no tasks yet) |
| Jan 10 | Click "Generate Tasks" | ✅ **1 task created** (scheduled: Jan 10, due: Jan 10) |
| Jan 10 | Click "Generate Tasks" again | ❌ **0 tasks** (already generated today) |
| Jan 11 | Click "Generate Tasks" | ✅ **1 task created** (scheduled: Jan 11, due: Jan 11) |
| Jan 12 | Click "Generate Tasks" | ✅ **1 task created** (scheduled: Jan 12, due: Jan 12) |

**Summary:** 
- First generation: **On start date** (if start date is today or earlier)
- Each day: **1 task** per click
- Cannot generate twice on same day

---

### Example 2: Daily Task Master WITH Start Date

**Task Master Created:**
- Title: "Daily Equipment Inspection"
- Frequency: Daily
- Start Date: **January 15, 2024**
- Created: January 10, 2024

**Timeline:**

| Date | Action | Result |
|------|--------|--------|
| Jan 10 | Create Task Master | ✅ Task Master created (no tasks yet) |
| Jan 10 | Click "Generate Tasks" | ❌ **0 tasks** (today < startDate) |
| Jan 11 | Click "Generate Tasks" | ❌ **0 tasks** (today < startDate) |
| Jan 14 | Click "Generate Tasks" | ❌ **0 tasks** (today < startDate) |
| Jan 15 | Click "Generate Tasks" | ✅ **1 task created** (scheduled: Jan 15, due: Jan 15) |
| Jan 15 | Click "Generate Tasks" again | ❌ **0 tasks** (already generated today) |
| Jan 16 | Click "Generate Tasks" | ✅ **1 task created** (scheduled: Jan 16, due: Jan 16) |

**Summary:**
- First generation: **On or after start date** (Jan 15 or later)
- Before start date: **No tasks generated**
- After start date: **1 task per day** per click

---

### Example 3: Multiple Daily Task Masters

**Task Masters:**
- Master A: Daily, no start date
- Master B: Daily, start date = Jan 20
- Master C: Daily, no start date

**Action on Jan 18:**
- Click "Generate Tasks"

**Result:**
- ✅ Master A → **1 task created** (scheduled: Jan 18)
- ❌ Master B → **Skipped** (today < startDate)
- ✅ Master C → **1 task created** (scheduled: Jan 18)
- **Total: 2 tasks created**

---

## Code Logic Reference

### Generation Check (`shouldGenerateTask`)

```typescript
private shouldGenerateTask(master: TaskMaster, today: Date): boolean {
  // 1. Check if active
  if (!master.isActive) {
    return false;
  }

  // 2. Check startDate
  if (master.startDate) {
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (todayOnly < startDateOnly) {
      return false; // Don't generate before start date
    }
  }

  // 3. Check last generation (for daily frequency)
  const lastGenerated = master.lastGenerated?.toDate();
  
  if (master.frequency === 'daily') {
    // Generate if never generated, or last generation was before today
    return !lastGenerated || lastGenerated < today;
  }
  
  return false;
}
```

### Date Calculation (`calculateTaskDates`)

```typescript
private calculateTaskDates(master: TaskMaster, baseDate: Date): { scheduledDate: Date; dueDate: Date } {
  const scheduledDate = new Date(baseDate); // Today
  const dueDate = new Date(baseDate);       // Today

  if (master.frequency === 'daily') {
    // Scheduled today, due today
    // No changes needed
  }
  
  return { scheduledDate, dueDate };
}
```

## Important Notes

### ⚠️ **One Task Per Day Limitation**
- The system generates **ONE task per day** per Task Master
- If you need multiple tasks per day, create multiple Task Masters

### ⚠️ **Manual Generation Required**
- Tasks are **NOT** automatically generated
- You must click "Generate Tasks" **every day** (or set up automation)
- Consider setting up a Cloud Function scheduled job for automatic generation

### ⚠️ **Start Date Behavior (MANDATORY)**
- **Start Date is REQUIRED** - must be provided when creating a Task Master
- Start Date is a **minimum date** - tasks can only be generated on or after it
- If start date is in the future, tasks won't generate until that date
- If start date is today or past, tasks can generate immediately
- Cannot create a Task Master without specifying a start date

### ⚠️ **Duplicate Prevention**
- System checks if a task already exists for the scheduled date
- Prevents creating duplicate tasks for the same day
- Even if you click multiple times on the same day, only one task is created

## Best Practices

1. **Set Start Date** - Always specify when task generation should begin (required field)
2. **Use Today's Date** - If you want immediate generation, set start date to today
3. **Plan Ahead** - Set start date in the future if tasks should begin later
4. **Click "Generate Tasks" Daily** - For daily task masters, click daily (or automate it)
5. **Monitor `lastGenerated`** - Track when tasks were last created
6. **Use Automation** - Consider Cloud Functions to auto-generate tasks daily

## Summary Table

| Question | Answer |
|----------|--------|
| **How many tasks per click?** | 1 task per Task Master |
| **When are tasks generated?** | Only when "Generate Tasks" is clicked |
| **From which date?** | Start Date (mandatory field - tasks generate on or after this date) |
| **Scheduled Date** | Today (the day you click) |
| **Due Date** | Today (same day for daily) |
| **Can generate twice same day?** | No (duplicate prevention) |
| **Can generate before startDate?** | No (startDate is mandatory) |

## Visual Flow Diagram

```
Create Task Master (Daily Frequency)
         ↓
    [Start Date Set?]
         ↓
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │    Can generate immediately
    │         │
    │    Click "Generate Tasks"
    │         ↓
    │    Check: Today >= StartDate?
    │         ↓
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │    Skip (too early)
    │         │
    │    Check: LastGenerated < Today?
    │         ↓
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │    Skip (already generated today)
    │         │
    │    Check: Task exists for today?
    │         ↓
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   NO        YES
    │         │
    │    Skip (duplicate)
    │         │
    │    ✅ CREATE TASK
    │    Scheduled: Today
    │    Due: Today
    │    Update lastGenerated
    │         │
    └─────────┘
```

---

**Last Updated:** Based on current codebase implementation
**File Reference:** `src/modules/employee-task-manager/services/task-instance.service.ts`

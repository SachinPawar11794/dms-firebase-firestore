# Task Generation Logic - How Many Tasks Are Created

## Overview

When you click **"Generate Tasks"**, the system creates **Task Instances** from **Task Masters** based on their frequency settings. This document explains how many tasks are generated and when.

## Key Principle

**One Task Instance per Task Master per generation cycle**

The system generates **ONE task instance** per active Task Master, but only if:
1. The Task Master is **active** (`isActive: true`)
2. Enough time has passed since the last generation (based on frequency)
3. No task instance already exists for the scheduled date

## Generation Rules by Frequency

### Daily Frequency
- **Generates:** 1 task instance
- **When:** If no task was generated today, or last generation was before today
- **Scheduled Date:** Today
- **Due Date:** Today
- **Example:** If you click "Generate Tasks" on Monday, it creates 1 task for Monday. If you click again on Tuesday, it creates 1 task for Tuesday.

### Weekly Frequency
- **Generates:** 1 task instance
- **When:** If no task was generated in the last 7 days
- **Scheduled Date:** Today
- **Due Date:** Today + 7 days
- **Example:** If you click "Generate Tasks" on Monday, it creates 1 task due next Monday. If you click again within 7 days, it won't create another (unless you delete the previous one).

### Monthly Frequency
- **Generates:** 1 task instance
- **When:** If no task was generated in the last 30 days
- **Scheduled Date:** Today
- **Due Date:** Today + 30 days
- **Example:** If you click "Generate Tasks" on January 1st, it creates 1 task due January 31st. If you click again before February 1st, it won't create another.

### Quarterly Frequency
- **Generates:** 1 task instance
- **When:** If no task was generated in the last 90 days (3 months)
- **Scheduled Date:** Today
- **Due Date:** Today + 90 days
- **Example:** If you click "Generate Tasks" on January 1st, it creates 1 task due April 1st.

### Yearly Frequency
- **Generates:** 1 task instance
- **When:** If no task was generated in the last 365 days
- **Scheduled Date:** Today
- **Due Date:** Today + 365 days
- **Example:** If you click "Generate Tasks" on January 1st, 2024, it creates 1 task due January 1st, 2025.

### Custom Frequency
- **Generates:** 1 task instance
- **When:** Based on `frequencyValue` and `frequencyUnit`
  - If `frequencyUnit = 'days'`: Generates if last generation was more than `frequencyValue` days ago
  - If `frequencyUnit = 'weeks'`: Generates if last generation was more than `frequencyValue * 7` days ago
  - If `frequencyUnit = 'months'`: Generates if last generation was more than `frequencyValue` months ago
- **Scheduled Date:** Today
- **Due Date:** Today + (frequencyValue in days)
- **Example:** If `frequencyValue = 5` and `frequencyUnit = 'days'`, it generates 1 task every 5 days.

## Important Notes

### 1. **No Duplicate Prevention**
The system checks if a task instance already exists for the same Task Master and scheduled date. If one exists, it **skips** generating a new one.

### 2. **One Click = One Generation Cycle**
Each time you click "Generate Tasks":
- It processes **all active Task Masters**
- For each master, it generates **at most 1 task instance**
- If a master doesn't need generation (too soon), it's skipped

### 3. **Multiple Task Masters**
If you have **5 active Task Masters**:
- Clicking "Generate Tasks" will create **up to 5 task instances** (one per master)
- If 2 masters were generated recently, only **3 tasks** will be created

### 4. **Frequency is a Minimum Interval**
- **Daily:** Can generate once per day
- **Weekly:** Can generate once per week
- **Monthly:** Can generate once per month
- etc.

The system **prevents** generating tasks too frequently, but doesn't generate multiple tasks in one click.

## Example Scenarios

### Scenario 1: First Time Generation
- **Task Masters:** 3 active masters (Daily, Weekly, Monthly)
- **Last Generated:** Never (no `lastGenerated` timestamp)
- **Click "Generate Tasks":**
  - ✅ Daily master → Creates 1 task (scheduled today, due today)
  - ✅ Weekly master → Creates 1 task (scheduled today, due in 7 days)
  - ✅ Monthly master → Creates 1 task (scheduled today, due in 30 days)
- **Result:** 3 task instances created

### Scenario 2: Daily Master - Same Day
- **Task Master:** Daily frequency
- **Last Generated:** Today at 9:00 AM
- **Current Time:** Today at 3:00 PM
- **Click "Generate Tasks":**
  - ❌ Daily master → Skipped (already generated today)
- **Result:** 0 task instances created

### Scenario 3: Daily Master - Next Day
- **Task Master:** Daily frequency
- **Last Generated:** Yesterday
- **Current Time:** Today
- **Click "Generate Tasks":**
  - ✅ Daily master → Creates 1 task (scheduled today, due today)
- **Result:** 1 task instance created

### Scenario 4: Weekly Master - Too Soon
- **Task Master:** Weekly frequency
- **Last Generated:** 3 days ago
- **Click "Generate Tasks":**
  - ❌ Weekly master → Skipped (less than 7 days since last generation)
- **Result:** 0 task instances created

### Scenario 5: Weekly Master - Ready
- **Task Master:** Weekly frequency
- **Last Generated:** 8 days ago
- **Click "Generate Tasks":**
  - ✅ Weekly master → Creates 1 task (scheduled today, due in 7 days)
- **Result:** 1 task instance created

### Scenario 6: Multiple Masters - Mixed
- **Task Masters:**
  - Master A: Daily (last generated yesterday) ✅
  - Master B: Weekly (last generated 10 days ago) ✅
  - Master C: Monthly (last generated 5 days ago) ❌
- **Click "Generate Tasks":**
  - ✅ Master A → Creates 1 task
  - ✅ Master B → Creates 1 task
  - ❌ Master C → Skipped (too soon)
- **Result:** 2 task instances created

## Code Logic

### Generation Check (`shouldGenerateTask`)

```typescript
private shouldGenerateTask(master: TaskMaster, today: Date): boolean {
  if (!master.isActive) {
    return false; // Inactive masters are skipped
  }

  const lastGenerated = master.lastGenerated?.toDate();
  
  switch (master.frequency) {
    case 'daily':
      // Generate if never generated, or last generation was before today
      return !lastGenerated || lastGenerated < today;
    
    case 'weekly':
      // Generate if last generation was more than 7 days ago
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      return !lastGenerated || lastGenerated < lastWeek;
    
    // ... similar logic for other frequencies
  }
}
```

### Duplicate Prevention

```typescript
// Check if task instance already exists for this scheduled date
const existingInstance = await this.getTaskInstanceForDate(master.id, scheduledDate);
if (existingInstance) {
  continue; // Skip if already generated
}
```

## Summary

| Frequency | Tasks Generated Per Click | When Generated |
|-----------|---------------------------|----------------|
| Daily | 1 | Once per day (if not generated today) |
| Weekly | 1 | Once per week (if not generated in last 7 days) |
| Monthly | 1 | Once per month (if not generated in last 30 days) |
| Quarterly | 1 | Once per quarter (if not generated in last 90 days) |
| Yearly | 1 | Once per year (if not generated in last 365 days) |
| Custom | 1 | Based on custom interval |

**Key Takeaway:** The system generates **ONE task instance per Task Master per generation cycle**, respecting the frequency interval. It does **NOT** generate multiple tasks in one click, even for daily frequencies.

## Best Practices

1. **For Daily Tasks:** Click "Generate Tasks" once per day (or set up automated scheduling)
2. **For Weekly Tasks:** Click "Generate Tasks" once per week
3. **For Monthly Tasks:** Click "Generate Tasks" once per month
4. **Automation:** Consider setting up a Cloud Function or scheduled job to automatically generate tasks based on frequency

## Future Enhancements

Potential improvements:
- Generate multiple tasks in advance (e.g., next 30 days of daily tasks)
- Bulk generation for a date range
- Automatic generation via Cloud Functions on schedule
- Generation preview before creating tasks

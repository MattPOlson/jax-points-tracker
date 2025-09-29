# Intraclub Self-Ranking Prevention Setup

## Overview
This feature prevents users from ranking their own beer entries in positions 1-3 during intraclub competitions to maintain fairness.

## Implementation Complete
✅ **Client-side validation** - Prevents submission with clear error messages
✅ **Server-side database trigger** - Final validation safeguard
✅ **UI indicators** - Visual cues for own entries and validation errors
✅ **Competition type detection** - Only applies to intraclub competitions

## Database Setup Required
The database trigger needs to be applied to your Supabase database. Run the following SQL in your Supabase SQL Editor:

```sql
-- Apply the contents of prevent_intraclub_self_ranking.sql
-- This creates a database trigger that prevents self-ranking violations
```

Or copy the SQL from `prevent_intraclub_self_ranking.sql` and run it in the Supabase dashboard.

## How It Works

### Client-Side Validation (`/judge/competition/[id]/rankings/`)
- Detects intraclub competitions automatically
- Shows blue indicators for user's own entries
- Displays warning messages for ranking restrictions
- Prevents saving rankings that violate the rules
- Shows error toast with specific violation details

### Server-Side Protection (Database Trigger)
- Validates all ranking submissions at the database level
- Prevents any attempts to circumvent client validation
- Raises descriptive error messages for violations
- Only applies to intraclub competitions

### Visual Indicators
- **Blue highlight**: Marks user's own entries
- **Red highlight with animation**: Invalid self-ranking in top 3
- **Warning banners**: Explain intraclub competition rules
- **"👤 Your Entry" badge**: Clear ownership indicator

### Validation Logic
- Only applies to competitions with `competition_type = 'intraclub'`
- Only restricts positions 1, 2, and 3
- Allows self-ranking in positions 4+
- Works with both single categories and custom ranking groups

## Testing
To test the feature:
1. Create an intraclub competition
2. Submit entries as multiple users (including yourself)
3. Try to rank your own entry in position 1, 2, or 3
4. Verify both client and server validation prevent this

## File Changes Made
- `src/routes/judge/competition/[id]/rankings/+page.svelte` - Client validation & UI
- `prevent_intraclub_self_ranking.sql` - Database trigger
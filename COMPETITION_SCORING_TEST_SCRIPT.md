# Competition Scoring System - Comprehensive Manual Test Script

## Overview
This test script validates the complete competition scoring workflow from entry submission through results publication. Follow each section sequentially for a full end-to-end test.

## Prerequisites
- Application running at http://localhost:5173
- Admin/Officer account access
- Judge account access
- Regular member account access
- Sample competition data loaded

---

## Test Section 1: Competition Setup & Entry Submission

### 1.1 Competition Creation (Officer Account)
**Objective:** Create a new competition for judging

**Steps:**
1. Log in as Officer/Admin user
2. Navigate to `/officers/manage-competitions`
3. Click "Create New Competition"
4. Fill out competition form:
   - **Name:** "Test Homebrew Competition 2024"
   - **Description:** "Annual club competition"
   - **Entry Deadline:** Set 7 days from today
   - **Judging Date:** Set 10 days from today
   - **Results Published:** Unchecked
   - **Active:** Checked
5. Click "Create Competition"

**Expected Results:**
- ✅ Competition created successfully
- ✅ Redirected to competition management page
- ✅ New competition appears in active competitions list

### 1.2 Entry Submission (Member Account)
**Objective:** Submit beer entries for judging

**Steps:**
1. Log out and log in as regular Member user
2. Navigate to `/competitions/submit-entry`
3. Submit Entry #1:
   - **Competition:** Select "Test Homebrew Competition 2024"
   - **Beer Name:** "Hoppy Pale Ale"
   - **BJCP Category:** 18A - Blonde Ale
   - **Beer Notes:** "Late hopped with Citra"
   - Click "Submit Entry"
4. Submit Entry #2:
   - **Competition:** Select "Test Homebrew Competition 2024"
   - **Beer Name:** "Dark Porter"
   - **BJCP Category:** 20A - American Porter
   - **Beer Notes:** "Roasted malt character"
   - Click "Submit Entry"
5. Submit Entry #3:
   - **Competition:** Select "Test Homebrew Competition 2024"
   - **Beer Name:** "Belgian Wit"
   - **BJCP Category:** 24A - Witbier
   - **Beer Notes:** "Traditional spicing"
   - Click "Submit Entry"

**Expected Results:**
- ✅ Each entry submitted successfully
- ✅ Unique entry numbers generated (5-digit format)
- ✅ Entries appear in "My Entries" page
- ✅ Payment status shows "Pending"

### 1.3 Verify Entries (Officer Account)
**Objective:** Confirm entries are visible to officers

**Steps:**
1. Log out and log in as Officer user
2. Navigate to `/officers/manage-competitions/entries/[competition-id]`
3. Verify all submitted entries are listed
4. Check entry details, categories, and payment status

**Expected Results:**
- ✅ All 3 entries visible
- ✅ Entry numbers displayed correctly
- ✅ Categories assigned properly
- ✅ Member information shown

---

## Test Section 2: Judge Assignment & Setup

### 2.1 Judge Assignment (Officer Account)
**Objective:** Assign judges to the competition

**Steps:**
1. Stay logged in as Officer
2. Navigate to `/officers/manage-competitions/judges/[competition-id]`
3. Click "Add Judge"
4. Assign Judge #1:
   - **Judge:** Select a user with judging permissions
   - **Role:** BJCP Judge
   - **Categories:** Assign multiple categories including 18A, 20A, 24A
   - Click "Add Judge"
5. Assign Judge #2 (if available):
   - **Judge:** Select another judge user
   - **Role:** Club Judge
   - **Categories:** Assign overlapping categories
   - Click "Add Judge"

**Expected Results:**
- ✅ Judges assigned successfully
- ✅ Categories distributed appropriately
- ✅ Judge assignment visible in dashboard

### 2.2 Judging Dashboard Setup (Officer Account)
**Objective:** Configure judging sessions and flight assignments

**Steps:**
1. Navigate to `/officers/manage-competitions/judging-dashboard/[competition-id]`
2. Review judging dashboard layout
3. Verify entries are organized by category
4. Check judge assignments per category
5. Create judging flights if needed:
   - Group entries by category
   - Assign judges to flights
   - Set judging schedule

**Expected Results:**
- ✅ Dashboard shows all entries organized by category
- ✅ Judge assignments visible
- ✅ Flights can be created and managed
- ✅ Judging workflow ready to begin

---

## Test Section 3: Judging Process

### 3.1 Judge Login & Assignment Verification
**Objective:** Verify judges can access their assignments

**Steps:**
1. Log out and log in as Judge user
2. Navigate to `/judge`
3. Verify assigned competitions appear
4. Click on "Test Homebrew Competition 2024"
5. Review assigned entries and categories

**Expected Results:**
- ✅ Judge dashboard shows assigned competitions
- ✅ Competition details accessible
- ✅ Assigned entries visible by category
- ✅ Entry numbers properly masked/blurred (if configured)

### 3.2 Entry Judging - Scoresheet Completion
**Objective:** Complete BJCP scoresheets for entries

**Steps:**
1. From judge competition page, select first entry to judge
2. Navigate to scoresheet page `/judge/competition/[id]/scoresheet`
3. Complete BJCP Scoresheet for "Hoppy Pale Ale":
   - **Aroma:** Score: 10/12, Comments: "Citrus hop aroma, clean malt backbone"
   - **Appearance:** Score: 3/3, Comments: "Clear golden color, good head retention"
   - **Flavor:** Score: 16/20, Comments: "Balanced hop flavor, slight astringency"
   - **Mouthfeel:** Score: 4/5, Comments: "Medium body, appropriate carbonation"
   - **Overall:** Score: 8/10, Comments: "Well-executed pale ale, minor flaws"
   - **Total Score:** 41/50
   - **Judge Notes:** "Good example of style with room for improvement"
   - Select descriptors: "hoppy", "balanced"
   - Click "Submit Scoresheet"

4. Judge second entry "Dark Porter":
   - **Aroma:** Score: 11/12, Comments: "Rich roasted malt, chocolate notes"
   - **Appearance:** Score: 3/3, Comments: "Dark brown, tan head"
   - **Flavor:** Score: 18/20, Comments: "Excellent roasted character, well balanced"
   - **Mouthfeel:** Score: 5/5, Comments: "Perfect body and carbonation"
   - **Overall:** Score: 9/10, Comments: "Outstanding porter"
   - **Total Score:** 46/50
   - **Judge Notes:** "Excellent example of American Porter"
   - Select descriptors: "roasted", "balanced", "smooth"
   - Click "Submit Scoresheet"

5. Judge third entry "Belgian Wit":
   - **Aroma:** Score: 9/12, Comments: "Spice present but muted, some tartness"
   - **Appearance:** Score: 2/3, Comments: "Cloudy white, thin head"
   - **Flavor:** Score: 14/20, Comments: "Spicing evident but unbalanced"
   - **Mouthfeel:** Score: 3/5, Comments: "Light body, over-carbonated"
   - **Overall:** Score: 6/10, Comments: "Needs work on balance"
   - **Total Score:** 34/50
   - **Judge Notes:** "Style elements present but execution needs improvement"
   - Select descriptors: "spicy", "tart"
   - Click "Submit Scoresheet"

**Expected Results:**
- ✅ Scoresheet form accepts all inputs correctly
- ✅ Total scores calculate automatically
- ✅ Descriptors can be selected/deselected
- ✅ Comments save properly
- ✅ Submissions successful for all entries
- ✅ Judged entries marked as complete

### 3.3 Ranking Entries (Judge Account)
**Objective:** Rank entries within categories for final placement

**Steps:**
1. Navigate to `/judge/competition/[id]/rankings`
2. Review all judged entries by category
3. Rank Category 18A (if multiple entries):
   - Drag and drop entries in order of preference
   - Confirm ranking matches scores
4. Rank Category 20A entries
5. Rank Category 24A entries
6. Submit final rankings

**Expected Results:**
- ✅ All judged entries appear in ranking interface
- ✅ Entries can be reordered by drag-and-drop
- ✅ Rankings save correctly
- ✅ Higher scores generally rank higher

---

## Test Section 4: Results Processing & Publication

### 4.1 Results Review (Officer Account)
**Objective:** Review judging results before publication

**Steps:**
1. Log out and log in as Officer user
2. Navigate to `/officers/manage-competitions/results/[competition-id]`
3. Review judging results:
   - Check all entries have been judged
   - Verify scores and rankings
   - Review judge comments
   - Check for any incomplete judging
4. Validate scoring accuracy:
   - **Dark Porter** should rank 1st (46/50)
   - **Hoppy Pale Ale** should rank 2nd (41/50)
   - **Belgian Wit** should rank 3rd (34/50)

**Expected Results:**
- ✅ All entries show completed judging
- ✅ Scores and rankings display correctly
- ✅ Judge comments visible
- ✅ Results ready for publication

### 4.2 Results Publication (Officer Account)
**Objective:** Publish competition results

**Steps:**
1. From results management page, click "Publish Results"
2. Confirm publication dialog
3. Verify competition status updates to "Results Published"
4. Check that results are now publicly visible

**Expected Results:**
- ✅ Results publication successful
- ✅ Competition marked as "Results Published"
- ✅ Public results page accessible

---

## Test Section 5: Public Results & Member Experience

### 5.1 Public Results Viewing
**Objective:** Verify public can view published results

**Steps:**
1. Log out completely (or use incognito browser)
2. Navigate to `/competitions/results`
3. Select "Test Homebrew Competition 2024"
4. Review published results:
   - Check all categories display
   - Verify entry rankings
   - Confirm scores are visible (if configured)
   - Check award placements (1st, 2nd, 3rd, HM)

**Expected Results:**
- ✅ Results page loads without authentication
- ✅ All categories and entries displayed
- ✅ Rankings show correctly
- ✅ Award medals/badges display properly

### 5.2 Member Results Access
**Objective:** Verify members can view their own detailed results

**Steps:**
1. Log in as the Member who submitted entries
2. Navigate to `/competitions/my-entries`
3. Verify entries show results:
   - **Dark Porter:** Shows 1st place medal 🥇
   - **Hoppy Pale Ale:** Shows 2nd place medal 🥈
   - **Belgian Wit:** Shows 3rd place medal 🥉
4. Click "View Scoresheet" on each entry
5. Review detailed scoresheet data:
   - Check all judge scores display
   - Verify comments are visible
   - Confirm descriptors show correctly

**Expected Results:**
- ✅ All entries show appropriate award placement
- ✅ Scoresheet details accessible
- ✅ Judge feedback visible and complete
- ✅ Scores match judging input

---

## Test Section 6: Filter System Validation

### 6.1 My Entries Filtering (Member Account)
**Objective:** Test the new filtering system on my-entries page

**Steps:**
1. Stay logged in as Member user
2. Navigate to `/competitions/my-entries`
3. Test Competition Filter:
   - Select "Test Homebrew Competition 2024"
   - Verify only entries from this competition show
   - Select "All Competitions"
4. Test Category Filter:
   - Select "20 - American Porter"
   - Verify only Dark Porter entry shows
   - Test other categories
5. Test Award Filter:
   - Select "🏅 Medal Winners Only"
   - Verify all 3 entries show (all placed)
   - Select "🥇 1st Place"
   - Verify only Dark Porter shows
   - Select "🥈 2nd Place"
   - Verify only Hoppy Pale Ale shows
6. Test Status Filter:
   - Select "🔴 Past (Closed)"
   - Verify entries show (competition is closed)
7. Test Clear All Filters:
   - Set multiple filters
   - Click "✨ Clear All Filters"
   - Verify all filters reset

**Expected Results:**
- ✅ All filters work independently and in combination
- ✅ Results count updates correctly
- ✅ Clear filters resets all selections
- ✅ Empty states show when no matches found

---

## Test Section 7: Edge Cases & Error Handling

### 7.1 Incomplete Judging Scenarios
**Objective:** Test handling of incomplete judging

**Steps:**
1. Create a second test competition with entries
2. Assign judges but leave some entries un-judged
3. Attempt to publish results with incomplete judging
4. Verify appropriate warnings/errors

**Expected Results:**
- ✅ System prevents publishing incomplete results
- ✅ Clear feedback on what needs completion
- ✅ Officer can identify un-judged entries

### 7.2 Data Validation Testing
**Objective:** Test form validation and data integrity

**Steps:**
1. Try submitting scoresheets with:
   - Missing required fields
   - Invalid score values (negative, over maximum)
   - Empty comments where required
2. Test entry submission with:
   - Invalid BJCP categories
   - Missing required fields
   - Duplicate entries (if prevented)

**Expected Results:**
- ✅ Appropriate validation errors shown
- ✅ Invalid data rejected
- ✅ User-friendly error messages

### 7.3 Permission Testing
**Objective:** Verify role-based access controls

**Steps:**
1. Try accessing officer pages as member user
2. Try accessing other members' scoresheets
3. Try modifying results as non-officer
4. Test judge access to non-assigned competitions

**Expected Results:**
- ✅ Unauthorized access properly blocked
- ✅ Appropriate error messages shown
- ✅ Users redirected to appropriate pages

---

## Test Section 8: Performance & Usability

### 8.1 Mobile Responsiveness
**Objective:** Test mobile experience

**Steps:**
1. Test all key pages on mobile viewport:
   - Competition submission
   - Judge scoresheet
   - Results viewing
   - My entries with filters
2. Verify touch interactions work
3. Check responsive layout breaks

**Expected Results:**
- ✅ All pages responsive on mobile
- ✅ Touch interactions functional
- ✅ Content readable and accessible

### 8.2 Print Functionality
**Objective:** Test printing features

**Steps:**
1. From my-entries page, click "Print Entry Labels"
2. Verify print preview shows:
   - 3 labels per entry (for 3 bottles)
   - Correct entry information
   - Proper formatting for labels
3. Test printing scoresheets (if available)

**Expected Results:**
- ✅ Print preview loads correctly
- ✅ Labels format appropriately
- ✅ All required information included

---

## Test Completion Checklist

### Core Functionality ✅
- [ ] Competition creation and management
- [ ] Entry submission and tracking
- [ ] Judge assignment and workflow
- [ ] BJCP scoresheet completion
- [ ] Entry ranking and placement
- [ ] Results publication and viewing
- [ ] Member access to personal results

### Filter System ✅
- [ ] Competition filtering
- [ ] Category filtering
- [ ] Award/medal filtering
- [ ] Status filtering (active/past)
- [ ] Payment filtering
- [ ] Clear all filters functionality
- [ ] Results count accuracy

### User Experience ✅
- [ ] Role-based access control
- [ ] Mobile responsiveness
- [ ] Error handling and validation
- [ ] Print functionality
- [ ] Performance under load
- [ ] Data integrity maintenance

### Security & Data ✅
- [ ] Authentication and authorization
- [ ] Data privacy (judge anonymity)
- [ ] Input validation and sanitization
- [ ] Secure scoresheet access
- [ ] Proper error messaging

---

## Reporting Issues

When reporting issues found during testing:

1. **Page/Component:** Specify exact page URL
2. **User Role:** Which account type you were using
3. **Steps to Reproduce:** Exact sequence of actions
4. **Expected Behavior:** What should have happened
5. **Actual Behavior:** What actually happened
6. **Browser/Device:** Testing environment details
7. **Screenshots:** If applicable

## Notes
- Test with realistic data volumes (10+ entries)
- Test concurrency (multiple judges scoring simultaneously)
- Verify data persistence across browser sessions
- Test with various BJCP categories and styles
- Validate scoring calculations and ranking logic

---

**Test Script Version:** 1.0
**Last Updated:** Current Date
**Estimated Testing Time:** 3-4 hours for complete validation
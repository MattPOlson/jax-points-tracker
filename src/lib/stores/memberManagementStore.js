// src/stores/memberManagementStore.js
import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { userProfile } from './userProfile';

// Core data stores
export const members = writable([]);
export const isLoading = writable(false);
export const error = writable(null);
export const lastRefresh = writable(null);

// Filter and search stores
export const searchTerm = writable('');
export const roleFilter = writable('all'); // 'all', 'member', 'officer', 'vice_president', 'president'
export const activityFilter = writable('all'); // 'all', 'active', 'inactive'

// Derived stores for filtered data
export const filteredMembers = derived(
  [members, searchTerm, roleFilter, activityFilter],
  ([$members, $searchTerm, $roleFilter, $activityFilter]) => {
    if (!$members || $members.length === 0) return [];
    
    let filtered = $members;
    
    // Search filter
    if ($searchTerm.trim()) {
      const term = $searchTerm.toLowerCase().trim();
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term) ||
        member.role_display?.toLowerCase().includes(term)
      );
    }
    
    // Role filter
    if ($roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === $roleFilter);
    }
    
    // Activity filter
    if ($activityFilter !== 'all') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      filtered = filtered.filter(member => {
        const parseTimestamp = (timestamp) => {
          if (!timestamp) return new Date(0);
          try {
            let isoString = timestamp;
            if (timestamp.includes(' ') && !timestamp.includes('T')) {
              isoString = timestamp.replace(' ', 'T');
              if (!isoString.includes('+') && !isoString.includes('Z')) {
                isoString += 'Z';
              }
            }
            return new Date(isoString);
          } catch {
            return new Date(0);
          }
        };
        
        const lastActivity = member.last_submission_date ? 
          parseTimestamp(member.last_submission_date) : 
          parseTimestamp(member.created_at);
        
        if ($activityFilter === 'active') {
          return lastActivity >= ninetyDaysAgo;
        } else if ($activityFilter === 'inactive') {
          return lastActivity < ninetyDaysAgo;
        }
        return true;
      });
    }
    
    return filtered;
  }
);

// Statistics derived stores
export const memberStats = derived(
  [members],
  ([$members]) => {
    if (!$members || $members.length === 0) {
      return {
        totalMembers: 0,
        totalOfficers: 0,
        activeMembers: 0,
        inactiveMembers: 0,
        totalPoints: 0,
        avgPointsPerMember: 0
      };
    }
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const stats = $members.reduce((acc, member) => {
      acc.totalMembers++;
      
      if (member.is_officer) {
        acc.totalOfficers++;
      }
      
      const parseTimestamp = (timestamp) => {
        if (!timestamp) return new Date(0);
        try {
          let isoString = timestamp;
          if (timestamp.includes(' ') && !timestamp.includes('T')) {
            isoString = timestamp.replace(' ', 'T');
            if (!isoString.includes('+') && !isoString.includes('Z')) {
              isoString += 'Z';
            }
          }
          return new Date(isoString);
        } catch {
          return new Date(0);
        }
      };
      
      const lastActivity = member.last_submission_date ? 
        parseTimestamp(member.last_submission_date) : 
        parseTimestamp(member.created_at);
      
      if (lastActivity >= ninetyDaysAgo) {
        acc.activeMembers++;
      } else {
        acc.inactiveMembers++;
      }
      
      acc.totalPoints += member.total_points || 0;
      
      return acc;
    }, {
      totalMembers: 0,
      totalOfficers: 0,
      activeMembers: 0,
      inactiveMembers: 0,
      totalPoints: 0
    });
    
    stats.avgPointsPerMember = stats.totalMembers > 0 ? 
      Math.round(stats.totalPoints / stats.totalMembers) : 0;
    
    return stats;
  }
);

// Permission check for current user
export const canManageOfficers = derived(
  [userProfile],
  ([$userProfile]) => {
    if (!$userProfile) return false;
    return $userProfile.role === 'president' || $userProfile.role === 'vice_president';
  }
);

// Core functions
export const memberManagementStore = {
  // Load all members with their points and stats
  async loadMembers(forceRefresh = false) {
    const currentData = get(members);
    const lastRefreshTime = get(lastRefresh);
    
    // Skip if data is fresh and not forcing refresh
    if (!forceRefresh && currentData.length > 0 && lastRefreshTime) {
      const timeSinceRefresh = Date.now() - lastRefreshTime;
      if (timeSinceRefresh < 30000) { // 30 seconds cache
        return currentData;
      }
    }
    
    isLoading.set(true);
    error.set(null);
    
    try {
      console.log('🔄 Loading members with points...');
      
      const { data, error: fetchError } = await supabase
        .rpc('get_members_with_points');
      
      if (fetchError) {
        throw fetchError;
      }
      
      console.log(`✅ Loaded ${data?.length || 0} members`);
      
      members.set(data || []);
      lastRefresh.set(Date.now());
      
      return data || [];
      
    } catch (err) {
      console.error('❌ Error loading members:', err);
      error.set(err.message || 'Failed to load members');
      return [];
    } finally {
      isLoading.set(false);
    }
  },

  // Update a member's role
  async updateMemberRole(memberId, newRole) {
    const currentUser = get(userProfile);
    
    // Check permissions
    if (!currentUser || !['president', 'vice_president'].includes(currentUser.role)) {
      throw new Error('Insufficient permissions to manage member roles');
    }
    
    // Prevent self-demotion for presidents
    if (currentUser.id === memberId && currentUser.role === 'president' && newRole !== 'president') {
      throw new Error('Presidents cannot demote themselves');
    }
    
    // Prevent non-presidents from creating presidents
    if (newRole === 'president' && currentUser.role !== 'president') {
      throw new Error('Only presidents can promote members to president');
    }
    
    isLoading.set(true);
    error.set(null);
    
    try {
      console.log(`🔄 Updating member ${memberId} role to ${newRole}...`);

      // Determine if the new role should have officer status
      const officerRoles = ['officer', 'competition_director', 'vice_president', 'president'];
      const isOfficer = officerRoles.includes(newRole);

      const { data, error: updateError } = await supabase
        .from('members')
        .update({
          role: newRole,
          is_officer: isOfficer
        })
        .eq('id', memberId)
        .select();

      if (updateError) {
        throw updateError;
      }
      
      console.log('✅ Member role updated successfully');
      
      // Refresh the members list
      await this.loadMembers(true);
      
      return data;
      
    } catch (err) {
      console.error('❌ Error updating member role:', err);
      error.set(err.message || 'Failed to update member role');
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  // Get member details with recent activity
  async getMemberDetails(memberId) {
    isLoading.set(true);
    error.set(null);
    
    try {
      console.log(`🔄 Loading details for member ${memberId}...`);
      
      // Get member basic info
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select(`
          *,
          join_date
        `)
        .eq('id', memberId)
        .single();
      
      if (memberError) {
        throw memberError;
      }
      
      // Get recent submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('point_submissions')
        .select(`
          *,
          submitted_at
        `)
        .eq('member_id', memberId)
        .order('submitted_at', { ascending: false })
        .limit(10);
      
      if (submissionsError) {
        throw submissionsError;
      }
      
      console.log(`✅ Loaded member details with ${submissions?.length || 0} recent submissions`);
      
      return {
        member: memberData,
        recentSubmissions: submissions || []
      };
      
    } catch (err) {
      console.error('❌ Error loading member details:', err);
      error.set(err.message || 'Failed to load member details');
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  // Export members data for printing/reporting
  async exportMembersData() {
    const membersData = get(members);
    
    if (membersData.length === 0) {
      await this.loadMembers();
    }
    
    const exportData = get(members).map(member => ({
      name: member.name,
      email: member.email,
      role: member.role_display,
      totalPoints: member.total_points,
      monthlyPoints: member.monthly_points,
      joinDate: (() => {
        if (!member.created_at) return 'N/A';
        try {
          let isoString = member.created_at;
          if (member.created_at.includes(' ') && !member.created_at.includes('T')) {
            isoString = member.created_at.replace(' ', 'T');
            if (!isoString.includes('+') && !isoString.includes('Z')) {
              isoString += 'Z';
            }
          }
          return new Date(isoString).toLocaleDateString();
        } catch {
          return 'Invalid Date';
        }
      })(),
      lastActivity: member.last_submission_date ? (() => {
        try {
          let isoString = member.last_submission_date;
          if (member.last_submission_date.includes(' ') && !member.last_submission_date.includes('T')) {
            isoString = member.last_submission_date.replace(' ', 'T');
            if (!isoString.includes('+') && !isoString.includes('Z')) {
              isoString += 'Z';
            }
          }
          return new Date(isoString).toLocaleDateString();
        } catch {
          return 'Invalid Date';
        }
      })() : 
        'Never',
      totalSubmissions: member.total_approved_submissions
    }));
    
    return exportData;
  },

  // Reset all filters
  resetFilters() {
    searchTerm.set('');
    roleFilter.set('all');
    activityFilter.set('all');
  },

  // Refresh data
  async refresh() {
    return await this.loadMembers(true);
  },

  // Clear all data (for logout)
  clear() {
    members.set([]);
    error.set(null);
    lastRefresh.set(null);
    this.resetFilters();
  }
};

// Auto-refresh on user profile changes
userProfile.subscribe(($userProfile) => {
  if ($userProfile?.is_officer) {
    // Auto-load when officer logs in
    memberManagementStore.loadMembers();
  } else {
    // Clear data when non-officer logs in
    memberManagementStore.clear();
  }
});

export default memberManagementStore;
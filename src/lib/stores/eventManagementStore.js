// Event Management Store
// Tracks club events (beer festivals, pours, etc.) and member signups.
import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import { userProfile } from '$lib/stores/userProfile.js';

// =============================================
// Store State
// =============================================

export const events = writable([]);
export const isLoading = writable(false);
export const error = writable(null);
export const lastRefresh = writable(null);

// =============================================
// Derived
// =============================================

function computeStatus(ev, now) {
    const eventDate = ev.event_date ? new Date(ev.event_date) : null;
    const endDate = ev.end_date ? new Date(ev.end_date) : eventDate;
    if (!ev.active) return 'inactive';
    if (endDate && endDate < now) return 'past';
    return 'upcoming';
}

export const stats = derived(events, ($events) => {
    const now = new Date();
    if (!Array.isArray($events) || $events.length === 0) {
        return { total: 0, upcoming: 0, past: 0, totalSignups: 0 };
    }

    const total = $events.length;
    const upcoming = $events.filter((e) => computeStatus(e, now) === 'upcoming').length;
    const past = $events.filter((e) => computeStatus(e, now) === 'past').length;
    const totalSignups = $events.reduce((sum, e) => sum + (e.signup_count || 0), 0);

    return { total, upcoming, past, totalSignups };
});

// =============================================
// Loaders
// =============================================

export async function loadEvents(forceRefresh = false) {
    const now = new Date();
    const lastRefreshTime = get(lastRefresh);

    if (!forceRefresh && lastRefreshTime && now - lastRefreshTime < 30000) {
        return;
    }

    isLoading.set(true);
    error.set(null);

    try {
        const { data, error: loadError } = await supabase
            .from('events')
            .select('*, event_signups(count)')
            .order('event_date', { ascending: true });

        if (loadError) throw loadError;

        const enriched = (data || []).map((ev) => {
            const signup_count = ev.event_signups?.[0]?.count ?? 0;
            const status = computeStatus(ev, now);
            const { event_signups: _ignored, ...rest } = ev;
            return { ...rest, signup_count, status };
        });

        events.set(enriched);
        lastRefresh.set(now);
    } catch (err) {
        console.error('Failed to load events:', err);
        error.set(err.message || 'Failed to load events');
        events.set([]);
    } finally {
        isLoading.set(false);
    }
}

export async function loadEvent(eventId) {
    if (!eventId) return null;

    const { data, error: loadError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (loadError) throw loadError;
    return data;
}

export async function loadEventSignups(eventId) {
    if (!eventId) return [];

    const { data: signupData, error: signupError } = await supabase
        .from('event_signups')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

    if (signupError) throw signupError;
    if (!signupData || signupData.length === 0) return [];

    const memberIds = [...new Set(signupData.map((s) => s.member_id))];
    const { data: membersData } = await supabase
        .from('members')
        .select('id, name, email, phone')
        .in('id', memberIds);

    return signupData.map((s) => {
        const member = membersData?.find((m) => m.id === s.member_id);
        return {
            ...s,
            member_name: member?.name || 'Unknown',
            member_email: member?.email || '',
            member_phone: member?.phone || ''
        };
    });
}

// =============================================
// Officer mutations
// =============================================

export async function createEvent(eventData) {
    const $userProfile = get(userProfile);
    const payload = { ...eventData, created_by: $userProfile?.id ?? null };

    const { data, error: insertError } = await supabase
        .from('events')
        .insert([payload])
        .select()
        .single();

    if (insertError) throw insertError;
    await loadEvents(true);
    return data;
}

export async function updateEvent(eventId, updates) {
    const { data, error: updateError } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

    if (updateError) throw updateError;
    await loadEvents(true);
    return data;
}

export async function deleteEvent(eventId) {
    const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

    if (deleteError) throw deleteError;
    await loadEvents(true);
}

// =============================================
// Member signup mutations
// =============================================

export async function upsertMySignup(eventId, { bringing, notes }) {
    const $userProfile = get(userProfile);
    if (!$userProfile?.id) throw new Error('You must be signed in to RSVP.');

    const { data, error: upsertError } = await supabase
        .from('event_signups')
        .upsert(
            {
                event_id: eventId,
                member_id: $userProfile.id,
                bringing: bringing ?? null,
                notes: notes ?? null
            },
            { onConflict: 'event_id,member_id' }
        )
        .select()
        .single();

    if (upsertError) throw upsertError;
    return data;
}

export async function removeMySignup(eventId) {
    const $userProfile = get(userProfile);
    if (!$userProfile?.id) throw new Error('You must be signed in.');

    const { error: deleteError } = await supabase
        .from('event_signups')
        .delete()
        .eq('event_id', eventId)
        .eq('member_id', $userProfile.id);

    if (deleteError) throw deleteError;
}

export async function loadMySignup(eventId) {
    const $userProfile = get(userProfile);
    if (!$userProfile?.id) return null;

    const { data, error: loadError } = await supabase
        .from('event_signups')
        .select('*')
        .eq('event_id', eventId)
        .eq('member_id', $userProfile.id)
        .maybeSingle();

    if (loadError) throw loadError;
    return data;
}

// =============================================
// Helpers
// =============================================

export function resetStore() {
    events.set([]);
    isLoading.set(false);
    error.set(null);
    lastRefresh.set(null);
}

export const eventManagementStore = {
    subscribe: derived([events, isLoading, error, stats], ([$events, $isLoading, $error, $stats]) => ({
        events: $events,
        isLoading: $isLoading,
        error: $error,
        stats: $stats
    })).subscribe,

    loadEvents,
    loadEvent,
    loadEventSignups,
    createEvent,
    updateEvent,
    deleteEvent,
    upsertMySignup,
    removeMySignup,
    loadMySignup,
    initialize: async () => {
        await loadEvents(false);
    }
};

import { supabase } from '$lib/supabaseClient';

/**
 * Generate a unique 5-digit entry number for a competition.
 * Retries up to `maxAttempts` times on uniqueness collisions.
 */
export async function generateUniqueEntryNumber(competitionId, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = Math.floor(Math.random() * 99999 + 1).toString().padStart(5, '0');

    const { count, error } = await supabase
      .from('competition_entries')
      .select('id', { count: 'exact', head: true })
      .eq('competition_id', competitionId)
      .eq('entry_number', candidate);

    if (error) throw new Error(`Failed to check entry number uniqueness: ${error.message}`);
    if (count === 0) return candidate;
  }

  throw new Error('Could not generate a unique entry number after maximum attempts. Please try again.');
}

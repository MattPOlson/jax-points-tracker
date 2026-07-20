-- Fix get_bjcp_categories() crashing on non-numeric category numbers (#141).
--
-- The function ordered by `category_number::INTEGER`, which raises
-- 22P02 invalid_text_representation on cider (C1–C4) and mead (M1–M4) rows,
-- aborting the whole RETURN QUERY so the RPC yields nothing.
--
-- Replace the cast with a cast-safe natural sort: order by the leading numeric
-- run (NULL for a non-numeric prefix, sorted last), then the raw category
-- number, then subcategory letter. Numbered beer categories keep their numeric
-- order (1, 2, … 34); cider/mead fall after them, alphabetically.
--
-- create-or-replace preserves the existing SECURITY DEFINER and the pinned
-- search_path from #140. Only the ORDER BY changed.

create or replace function public.get_bjcp_categories()
returns table(
  id uuid,
  category_number character varying,
  category_name character varying,
  subcategory_letter character varying,
  subcategory_name character varying,
  description text,
  full_name text,
  created_at timestamp without time zone,
  updated_at timestamp without time zone
)
language plpgsql
security definer
set search_path to 'public'
as $function$
BEGIN
    RETURN QUERY
    SELECT
        bc.id,
        bc.category_number,
        bc.category_name,
        bc.subcategory_letter,
        bc.subcategory_name,
        bc.description,
        CASE
            WHEN bc.subcategory_letter IS NOT NULL THEN
                (bc.category_number || bc.subcategory_letter || ' - ' || bc.subcategory_name)::TEXT
            ELSE
                (bc.category_number || ' - ' || bc.category_name)::TEXT
        END as full_name,
        bc.created_at,
        bc.updated_at
    FROM bjcp_categories bc
    ORDER BY nullif(regexp_replace(bc.category_number, '\D.*$', ''), '')::int nulls last,
             bc.category_number,
             bc.subcategory_letter;
END;
$function$;

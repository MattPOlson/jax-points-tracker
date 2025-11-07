export async function GET() {
  try {
    // Google Calendar iCal feed URL
    const calendarId = 'jaxaleexchange@gmail.com';
    const icalUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;

    const response = await fetch(icalUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch calendar');
    }

    const icalData = await response.text();

    // Simple iCal parser to extract events
    const events = parseICalEvents(icalData);

    // Filter future events and sort by date
    const now = new Date();
    const upcomingEvents = events
      .filter(event => new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 2); // Get next 2 events

    return new Response(JSON.stringify(upcomingEvents), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error('Calendar fetch error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch calendar events' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function parseICalEvents(icalData) {
  const events = [];
  const eventBlocks = icalData.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    const event = {};

    // Extract SUMMARY (title)
    const summaryMatch = block.match(/SUMMARY:(.*?)(\r\n|\n)/);
    if (summaryMatch) {
      event.title = summaryMatch[1].trim();
    }

    // Extract DTSTART (start date)
    const dtstartMatch = block.match(/DTSTART(?:;[^:]*)?:(.*?)(\r\n|\n)/);
    if (dtstartMatch) {
      event.start = parseICalDate(dtstartMatch[1].trim());
    }

    // Extract DTEND (end date)
    const dtendMatch = block.match(/DTEND(?:;[^:]*)?:(.*?)(\r\n|\n)/);
    if (dtendMatch) {
      event.end = parseICalDate(dtendMatch[1].trim());
    }

    // Extract LOCATION
    const locationMatch = block.match(/LOCATION:(.*?)(\r\n|\n)/);
    if (locationMatch) {
      event.location = locationMatch[1].trim();
    }

    // Extract DESCRIPTION
    const descriptionMatch = block.match(/DESCRIPTION:(.*?)(\r\n|\n)/);
    if (descriptionMatch) {
      event.description = descriptionMatch[1].trim();
    }

    if (event.title && event.start) {
      events.push(event);
    }
  }

  return events;
}

function parseICalDate(dateString) {
  // Handle both date-time and date-only formats
  // Format: 20250115T190000Z or 20250115
  if (dateString.includes('T')) {
    // Date-time format
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(9, 11);
    const minute = dateString.substring(11, 13);
    const second = dateString.substring(13, 15);

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  } else {
    // Date-only format
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    return new Date(`${year}-${month}-${day}`);
  }
}

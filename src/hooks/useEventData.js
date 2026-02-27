import { useState, useEffect } from 'react';
import { parseCSV } from '../utils/parseCSV';
import { SHEET_URL_EVENTS, SHEET_URL_ATTENDANCE } from '../utils/constants';

/**
 * Hook que carrega i parseja els events i l'assistència des de Google Sheets.
 */
export const useEventData = () => {
  const [events, setEvents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsRes, attendanceRes] = await Promise.all([
        fetch(SHEET_URL_EVENTS),
        fetch(SHEET_URL_ATTENDANCE),
      ]);

      if (!eventsRes.ok || !attendanceRes.ok)
        throw new Error('Error de connexió amb el servidor');

      const eventsText = await eventsRes.text();
      const attendanceText = await attendanceRes.text();

      const parsedEvents = parseCSV(eventsText)
        .filter(e => e.codi || e.id || e.event || e.code)
        .map((e, index) => {
          const dateStr = e.data || e.date;
          let year = 'N/A';
          let month = -1;
          if (dateStr) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              year = parts[2];
              month = parseInt(parts[1]) - 1;
            }
          }
          return {
            id: e.codi || e.id || e.event || e.code,
            name: e.nom || e.name || e.eventname,
            team: e.organitzador || e.team || e.organizer,
            date: dateStr,
            year,
            month,
            attendees: parseInt(e.assistents || e.attendees || 0),
            location: e.localitzacio || e.location || 'Sabadell',
            order: index + 1,
          };
        })
        .filter(e => e.year !== 'N/A');

      setEvents(parsedEvents);
      setAttendanceRecords(
        parseCSV(attendanceText).map(a => ({
          eventId: a.event || a.eventid || a.codi,
          attendee: a.equip || a.attendee || a.user,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { events, attendanceRecords, isLoading, error, refetch: fetchData };
};

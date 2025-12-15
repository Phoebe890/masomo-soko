import React, { useState, useEffect, useRef } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const AvailabilityCalendar: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchAvailability = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8089/api/availability', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch availability.');
            const data = await response.json();
            const formattedEvents = data.map((slot: any) => ({
                id: slot.id,
                start: slot.startTime,
                end: slot.endTime,
                title: 'Available',
                backgroundColor: slot.booked ? '#d32f2f' : '#2e7d32', // Red if booked, green if available
                borderColor: slot.booked ? '#d32f2f' : '#2e7d32',
                extendedProps: { booked: slot.booked }
            }));
            setEvents(formattedEvents);
        } catch (err: any) { setError(err.message); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchAvailability(); }, []);

    const handleSelect = async (selectInfo: any) => {
        const { start, end } = selectInfo;
        setIsSaving(true);
        setError(null);
        const newSlotRequest = [{ start: start.toISOString(), end: end.toISOString() }];
        try {
            const response = await fetch('http://localhost:8089/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSlotRequest),
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Could not save the new time slot.');
            fetchAvailability();
        } catch (err: any) { setError(err.message); } 
        finally { setIsSaving(false); }
        selectInfo.view.calendar.unselect();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button onClick={() => navigate('/dashboard/teacher')} sx={{ mb: 2 }}>← Back to Dashboard</Button>
            <Typography variant="h4" fontWeight={700} gutterBottom>Set My Availability</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Click and drag on the calendar to create time slots when you are available for booking.</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Paper sx={{ p: { xs: 1, md: 2 }, borderRadius: 2 }}>
                {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' }}
                        initialView="timeGridWeek"
                        editable={false}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        events={events}
                        select={handleSelect}
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        height="auto"
                    />
                )}
                 {isSaving && <Typography sx={{mt: 1, color: 'primary.main', textAlign: 'center'}}>Saving slot...</Typography>}
            </Paper>
        </Container>
    );
};
export default AvailabilityCalendar;
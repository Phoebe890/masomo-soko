import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Grid, CircularProgress, Alert, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const CoachingServiceManager: React.FC = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        durationInMinutes: 60,
        price: 1000,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8089/api/coaching/my-services', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch services.');
            const data = await response.json();
            setServices(data);
        } catch (err: any) { setError(err.message); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8089/api/coaching/service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formState,
                    durationInMinutes: Number(formState.durationInMinutes),
                    price: Number(formState.price)
                }),
                credentials: 'include',
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to create service.');
            setFormState({ title: '', description: '', durationInMinutes: 60, price: 1000 });
            fetchServices();
        } catch (err: any) { setError(err.message); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button onClick={() => navigate('/dashboard/teacher')} sx={{ mb: 2 }}>← Back to Dashboard</Button>
            <Typography variant="h4" fontWeight={700} gutterBottom>Manage My Coaching Services</Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                    <Paper component="form" onSubmit={handleFormSubmit} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Create New Service</Typography>
                        <TextField name="title" label="Service Title" fullWidth margin="normal" value={formState.title} onChange={handleInputChange} required placeholder="e.g., KCSE Physics Paper 2 Revision" />
                        <TextField name="description" label="Description" fullWidth multiline rows={4} margin="normal" value={formState.description} onChange={handleInputChange} required placeholder="What will be covered in this session?" />
                        <TextField name="durationInMinutes" label="Duration (in minutes)" type="number" fullWidth margin="normal" value={formState.durationInMinutes} onChange={handleInputChange} required />
                        <TextField name="price" label="Price (in KES)" type="number" fullWidth margin="normal" value={formState.price} onChange={handleInputChange} required />
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                        <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting} sx={{ mt: 2, py: 1.5 }}>{isSubmitting ? 'Saving...' : 'Save New Service'}</Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={7}>
                     <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>My Active Services</Typography>
                        {isLoading ? <CircularProgress /> : services.length === 0 ? <Typography color="text.secondary">You have not created any services yet.</Typography> : (
                            <List>
                                {services.map((service, index) => (
                                    <React.Fragment key={service.id}>
                                        <ListItem secondaryAction={<><IconButton edge="end" disabled><EditIcon /></IconButton><IconButton edge="end" sx={{ ml: 1 }} disabled><DeleteIcon /></IconButton></>}>
                                            <ListItemText primary={<Typography fontWeight="600">{service.title}</Typography>} secondary={`Duration: ${service.durationInMinutes} mins | Price: KES ${service.price}`} />
                                        </ListItem>
                                        {index < services.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
export default CoachingServiceManager;
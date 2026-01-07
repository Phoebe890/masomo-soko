import React, { useState } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, MenuItem, InputAdornment, 
    Stack, IconButton, Alert, Snackbar, CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherLayout from '../../components/TeacherLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadFirstResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', type: 'success' as 'success'|'error' });

    const [formData, setFormData] = useState({
        title: '', description: '', price: '', subject: '', grade: '', curriculum: '',
        thumbnailFile: null as File | null,
        resourceFile: null as File | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnailFile' | 'resourceFile') => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, [field]: e.target.files[0] });
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.resourceFile) {
            setSnackbar({ open: true, msg: "Title and Resource File are required", type: 'error' });
            return;
        }

        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('subject', formData.subject);
        data.append('grade', formData.grade);
        data.append('curriculum', formData.curriculum);
        data.append('pricing', parseFloat(formData.price) > 0 ? "Paid" : "Free");
        if(parseFloat(formData.price) > 0) data.append('price', formData.price);
        data.append('file', formData.resourceFile);
        if (formData.thumbnailFile) data.append('thumbnail', formData.thumbnailFile);

        try {
            await axios.post('http://localhost:8081/api/teacher/resources', data, {
                headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true 
            });
            setSnackbar({ open: true, msg: "Resource Published!", type: 'success' });
            setTimeout(() => navigate('/dashboard/teacher'), 1500);
        } catch (error) {
            setSnackbar({ open: true, msg: "Upload failed", type: 'error' });
            setLoading(false);
        }
    };

    return (
        <TeacherLayout title="Create Resource" selectedRoute="/dashboard/teacher/upload-first-resource">
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/dashboard/teacher')} sx={{ bgcolor: 'white', border: '1px solid #E5E7EB' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" fontWeight={700}>Upload New Material</Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Resource Details</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField label="Title" name="title" fullWidth value={formData.title} onChange={handleChange} placeholder="e.g. Form 4 History Notes" />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField select label="Subject" name="subject" fullWidth value={formData.subject} onChange={handleChange}>
                                        {['Math', 'English', 'Science', 'History'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField select label="Grade" name="grade" fullWidth value={formData.grade} onChange={handleChange}>
                                        {['Form 1', 'Form 2', 'Form 3', 'Form 4'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField select label="Curriculum" name="curriculum" fullWidth value={formData.curriculum} onChange={handleChange}>
                                        {['KCSE', 'CBC', 'IGCSE'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Price (KES)" name="price" type="number" fullWidth value={formData.price} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }} placeholder="0 for Free" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Description" name="description" multiline rows={4} fullWidth value={formData.description} onChange={handleChange} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                                <Typography fontWeight={700} sx={{ mb: 2 }}>Files</Typography>
                                
                                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2, height: 100, borderStyle: 'dashed' }}>
                                    <Stack alignItems="center">
                                        <CloudUploadIcon color="action" />
                                        <Typography variant="caption">{formData.resourceFile ? formData.resourceFile.name : "Upload Document"}</Typography>
                                    </Stack>
                                    <input type="file" hidden accept=".pdf,.doc,.docx" onChange={(e) => handleFile(e, 'resourceFile')} />
                                </Button>

                                <Button variant="outlined" component="label" fullWidth sx={{ height: 100, borderStyle: 'dashed' }}>
                                    <Stack alignItems="center">
                                        <CloudUploadIcon color="action" />
                                        <Typography variant="caption">{formData.thumbnailFile ? "Thumbnail Selected" : "Upload Cover Image"}</Typography>
                                    </Stack>
                                    <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e, 'thumbnailFile')} />
                                </Button>
                            </Paper>

                            <Button 
                                variant="contained" size="large" fullWidth onClick={handleSubmit} disabled={loading}
                                sx={{ py: 1.5, fontWeight: 700 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Publish Resource"}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.type}>{snackbar.msg}</Alert></Snackbar>
        </TeacherLayout>
    );
};

export default UploadFirstResource;
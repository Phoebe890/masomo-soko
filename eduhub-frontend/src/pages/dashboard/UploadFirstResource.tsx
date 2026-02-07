import React, { useState } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, MenuItem, InputAdornment, 
    Stack, IconButton, Alert, Snackbar, CircularProgress, ListSubheader
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadFirstResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', type: 'success' as 'success'|'error' });

    const [formData, setFormData] = useState({
        title: '', description: '', price: '', subject: '', grade: '', curriculum: 'CBC',
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
        if (!formData.title || !formData.resourceFile || !formData.thumbnailFile) {
            setSnackbar({ 
                open: true, 
                msg: "All fields are required: Title, Resource File, and Cover Image", 
                type: 'error' 
            });
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
            await api.post('/api/teacher/resources', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
                    {/* LEFT COLUMN: FORM DETAILS */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Resource Details</Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField label="Title" name="title" fullWidth value={formData.title} onChange={handleChange} placeholder="e.g. Grade 9 Integrated Science Project" />
                                </Grid>

                                {/* CURRICULUM SELECTION */}
                                <Grid item xs={12} md={6}>
                                    <TextField select label="Curriculum" name="curriculum" fullWidth value={formData.curriculum} onChange={handleChange}>
                                        <MenuItem value="CBC">CBC (Competency Based)</MenuItem>
                                        <MenuItem value="8-4-4">8-4-4 / KCSE (Legacy)</MenuItem>
                                        <MenuItem value="IGCSE">IGCSE</MenuItem>
                                        <MenuItem value="General">General / Books & Novels</MenuItem>
                                    </TextField>
                                </Grid>
                                
                                {/* GRADE / FORM SECTION */}
                                <Grid item xs={12} md={6}>
                                    <TextField select label="Grade / Form" name="grade" fullWidth value={formData.grade} onChange={handleChange}>
                                        <ListSubheader>General</ListSubheader>
                                        <MenuItem value="General Audience">General Audience (Books)</MenuItem>
                                        <MenuItem value="All Grades">All Grades</MenuItem>
                                        
                                        <ListSubheader>Junior School (CBC)</ListSubheader>
                                        <MenuItem value="Grade 7">Grade 7</MenuItem>
                                        <MenuItem value="Grade 8">Grade 8</MenuItem>
                                        <MenuItem value="Grade 9">Grade 9</MenuItem>
                                        
                                        <ListSubheader>Senior School (CBC)</ListSubheader>
                                        <MenuItem value="Grade 10">Grade 10</MenuItem>
                                        <MenuItem value="Grade 11">Grade 11</MenuItem>
                                        <MenuItem value="Grade 12">Grade 12</MenuItem>

                                        <ListSubheader>Legacy System (8-4-4)</ListSubheader>
                                        <MenuItem value="Form 1">Form 1</MenuItem>
                                        <MenuItem value="Form 2">Form 2</MenuItem>
                                        <MenuItem value="Form 3">Form 3</MenuItem>
                                        <MenuItem value="Form 4">Form 4</MenuItem>
                                    </TextField>
                                </Grid>

                                {/* SUBJECT / LEARNING AREA SECTION */}
                                <Grid item xs={12} md={12}>
                                    <TextField select label="Subject / Learning Area" name="subject" fullWidth value={formData.subject} onChange={handleChange}>
                                        <ListSubheader sx={{ bgcolor: '#f8fafc', fontWeight: 'bold' }}>Books & Creative Works</ListSubheader>
                                        <MenuItem value="Literature">Literature / Novels</MenuItem>
                                        <MenuItem value="Fiction">Fiction / Storybooks</MenuItem>
                                        <MenuItem value="Non-Fiction">Non-Fiction / Biographies</MenuItem>
                                        <MenuItem value="Poetry">Poetry & Anthologies</MenuItem>
                                        <MenuItem value="Set Books">Set Books Analysis</MenuItem>

                                        <ListSubheader sx={{ bgcolor: '#f8fafc', fontWeight: 'bold' }}>Primary School (CBC)</ListSubheader>
                                        <MenuItem value="Mathematics Primary">Mathematics</MenuItem>
                                        <MenuItem value="English Primary">English Language / Literacy</MenuItem>
                                        <MenuItem value="Kiswahili Primary">Kiswahili / Kusoma na Kuandika</MenuItem>
                                        <MenuItem value="Environmental Activities">Environmental Activities</MenuItem>
                                        <MenuItem value="Hygiene and Nutrition">Hygiene and Nutrition</MenuItem>
                                        <MenuItem value="Religious Education">Religious Education (CRE/IRE/HRE)</MenuItem>
                                        <MenuItem value="Science and Technology">Science and Technology</MenuItem>

                                        <ListSubheader sx={{ bgcolor: '#f8fafc', fontWeight: 'bold' }}>Junior School (CBC)</ListSubheader>
                                        <MenuItem value="Integrated Science">Integrated Science</MenuItem>
                                        <MenuItem value="Health Education">Health Education</MenuItem>
                                        <MenuItem value="Pre-Technical Studies">Pre-Technical Studies</MenuItem>
                                        <MenuItem value="Social Studies">Social Studies</MenuItem>
                                        <MenuItem value="Agriculture and Nutrition">Agriculture and Nutrition</MenuItem>
                                        <MenuItem value="Creative Arts and Sports">Creative Arts and Sports</MenuItem>
                                        <MenuItem value="Business Studies JS">Business Studies</MenuItem>
                                        <MenuItem value="Computer Studies JS">Computer Studies</MenuItem>

                                        <ListSubheader sx={{ bgcolor: '#f8fafc', fontWeight: 'bold' }}>Senior School (CBC Pathways)</ListSubheader>
                                        <MenuItem value="Biology">Biology</MenuItem>
                                        <MenuItem value="Chemistry">Chemistry</MenuItem>
                                        <MenuItem value="Physics">Physics</MenuItem>
                                        <MenuItem value="History and Citizenship">History and Citizenship</MenuItem>
                                        <MenuItem value="Geography">Geography</MenuItem>
                                        <MenuItem value="Business Studies Senior">Business Studies</MenuItem>
                                        <MenuItem value="Home Science">Home Science</MenuItem>
                                        <MenuItem value="Computer Science">Computer Science</MenuItem>
                                        <MenuItem value="Media Studies">Media Studies</MenuItem>
                                        <MenuItem value="Performing Arts">Performing Arts</MenuItem>
                                    </TextField>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <TextField label="Price (KES)" name="price" type="number" fullWidth value={formData.price} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }} placeholder="0 for Free" />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField label="Description" name="description" multiline rows={4} fullWidth value={formData.description} onChange={handleChange} placeholder="Describe the content or provide a book summary..." />
                                </Grid>
                            </Grid> {/* End of inner Grid container */}
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: FILE UPLOAD & SUBMIT */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                                <Typography fontWeight={700} sx={{ mb: 2 }}>Files</Typography>
                                
                                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2, height: 100, borderStyle: 'dashed' }}>
                                    <Stack alignItems="center">
                                        <CloudUploadIcon color="action" />
                                        <Typography variant="caption">{formData.resourceFile ? formData.resourceFile.name : "Upload Document"}</Typography>
                                    </Stack>
                                    <input type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => handleFile(e, 'resourceFile')} />
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
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.type} variant="filled">{snackbar.msg}</Alert></Snackbar>
        </TeacherLayout>
    );
};

export default UploadFirstResource;
import React, { useState } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, 
    MenuItem, InputAdornment, Container, Card, CardMedia, 
    CardContent, Chip, IconButton, Stack, useTheme, Divider, 
    FormControl, FormLabel, OutlinedInput, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import Sidebar
import TeacherSidebar from './TeacherSidebar';

const UploadFirstResource = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        subject: '',
        grade: '',        // ADDED: Required by backend
        curriculum: '',   // ADDED: Required by backend
        thumbnailPreview: '',
        resourceFile: null as File | null
    });

    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ 
                ...formData, 
                // Note: Your backend currently generates previews automatically from the resource file
                // so we only use this for local preview in the UI
                thumbnailPreview: URL.createObjectURL(file) 
            });
        }
    };

    const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resourceFile: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if(!formData.resourceFile || !formData.title || !formData.subject || !formData.grade || !formData.curriculum) {
            alert("Please fill in all required fields and upload a resource file.");
            return;
        }

        setLoading(true);

        const uploadData = new FormData();
        // Backend expects 'file' for the resource
        uploadData.append('file', formData.resourceFile); 
        uploadData.append('title', formData.title);
        uploadData.append('description', formData.description);
        uploadData.append('subject', formData.subject);
        uploadData.append('grade', formData.grade);
        uploadData.append('curriculum', formData.curriculum);
        
        // Logic for Pricing
        const priceValue = parseFloat(formData.price);
        uploadData.append('pricing', priceValue > 0 ? "Paid" : "Free");
        if(priceValue > 0) {
            uploadData.append('price', formData.price);
        }

        try {
            // REPLACE WITH YOUR BACKEND URL
            const API_URL = "http://localhost:8081/api/teacher/resources"; 
            
            await axios.post(API_URL, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true // IMPORTANT: Sends cookies for @AuthenticationPrincipal
            });

            alert("Resource Published Successfully!"); 
            navigate('/dashboard/teacher');
        } catch (error: any) {
            console.error("Upload Error:", error);
            const errorMsg = error.response?.data || "Failed to upload resource.";
            alert(typeof errorMsg === 'string' ? errorMsg : "Error uploading resource");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
            <TeacherSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                selectedRoute="/dashboard/teacher/upload-first-resource"
            />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` } }}>
                {/* --- TOP BAR --- */}
                <Box sx={{ 
                    bgcolor: 'white', px: 4, py: 2, 
                    borderBottom: '1px solid #eee', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'sticky', top: 0, zIndex: 100
                }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton onClick={() => navigate('/dashboard/teacher')}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={700}>Create New Resource</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button variant="text" color="inherit" onClick={() => navigate('/dashboard/teacher')}>Cancel</Button>
                        <Button 
                            variant="contained" 
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ px: 4, fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Publish"}
                        </Button>
                    </Stack>
                </Box>

                <Container maxWidth="xl" sx={{ p: 4 }}>
                    <Grid container spacing={6}>
                        {/* --- LEFT COLUMN: EDITOR --- */}
                        <Grid item xs={12} lg={7}>
                            <Stack spacing={4}>
                                
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Resource Details</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Title</FormLabel>
                                                <TextField 
                                                    name="title" value={formData.title} onChange={handleChange}
                                                    variant="outlined" fullWidth placeholder="e.g. Form 4 History Notes"
                                                />
                                            </FormControl>
                                        </Grid>

                                        {/* ADDED: Grade & Curriculum Inputs (Required by Backend) */}
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Subject</FormLabel>
                                                <TextField 
                                                    select name="subject" value={formData.subject} onChange={handleChange}
                                                    variant="outlined" fullWidth
                                                >
                                                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                                                    <MenuItem value="English">English</MenuItem>
                                                    <MenuItem value="Science">Science</MenuItem>
                                                    <MenuItem value="History">History</MenuItem>
                                                </TextField>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Grade / Level</FormLabel>
                                                <TextField 
                                                    select name="grade" value={formData.grade} onChange={handleChange}
                                                    variant="outlined" fullWidth
                                                >
                                                    <MenuItem value="Form 1">Form 1</MenuItem>
                                                    <MenuItem value="Form 2">Form 2</MenuItem>
                                                    <MenuItem value="Form 3">Form 3</MenuItem>
                                                    <MenuItem value="Form 4">Form 4</MenuItem>
                                                </TextField>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Curriculum</FormLabel>
                                                <TextField 
                                                    select name="curriculum" value={formData.curriculum} onChange={handleChange}
                                                    variant="outlined" fullWidth
                                                >
                                                    <MenuItem value="KCSE">KCSE</MenuItem>
                                                    <MenuItem value="CBC">CBC</MenuItem>
                                                    <MenuItem value="IGCSE">IGCSE</MenuItem>
                                                </TextField>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Price (KES)</FormLabel>
                                                <OutlinedInput 
                                                    name="price" type="number" value={formData.price} onChange={handleChange}
                                                    startAdornment={<InputAdornment position="start">KES</InputAdornment>}
                                                    placeholder="0 for Free"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>Description</FormLabel>
                                                <TextField 
                                                    multiline rows={5} 
                                                    name="description" value={formData.description} onChange={handleChange}
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {/* Cover Image - Optional in UI, not sent to backend in this specific setup */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Cover Image (Optional)</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        For preview purposes only. The system will auto-generate a preview from your file.
                                    </Typography>
                                    <Box sx={{ border: '2px dashed #e0e0e0', borderRadius: 3, p: 4, textAlign: 'center' }}>
                                        <input accept="image/*" style={{ display: 'none' }} id="thumbnail-upload" type="file" onChange={handleThumbnailChange} />
                                        <label htmlFor="thumbnail-upload" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                                            {formData.thumbnailPreview ? (
                                                <img src={formData.thumbnailPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                                            ) : (
                                                <Stack alignItems="center" spacing={1}>
                                                    <ImageIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                                                    <Typography fontWeight={600} color="primary">Click to upload thumbnail</Typography>
                                                </Stack>
                                            )}
                                        </label>
                                    </Box>
                                </Paper>

                                {/* Resource File - MANDATORY */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Resource File</Typography>
                                    <Box sx={{ border: '2px dashed #e0e0e0', borderRadius: 3, p: 4, bgcolor: '#fafafa' }}>
                                        <input accept=".pdf,.doc,.docx,.ppt,.pptx" style={{ display: 'none' }} id="resource-upload" type="file" onChange={handleResourceFileChange} />
                                        <label htmlFor="resource-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                            {formData.resourceFile ? (
                                                <Stack direction="row" alignItems="center" spacing={2} sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}>
                                                    <CheckCircleIcon color="success" />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography fontWeight={600}>{formData.resourceFile.name}</Typography>
                                                    </Box>
                                                    <Typography color="primary" fontWeight={600}>Change</Typography>
                                                </Stack>
                                            ) : (
                                                <Stack alignItems="center" spacing={1}>
                                                    <CloudUploadIcon sx={{ fontSize: 40, color: '#999' }} />
                                                    <Typography fontWeight={600}>Click to upload file</Typography>
                                                </Stack>
                                            )}
                                        </label>
                                    </Box>
                                </Paper>
                            </Stack>
                        </Grid>
                        
                        {/* RIGHT COLUMN (Preview) - Same as before... */}
                        <Grid item xs={12} lg={5}>
                             {/* ... (Keep your existing Preview Card code here) ... */}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default UploadFirstResource;
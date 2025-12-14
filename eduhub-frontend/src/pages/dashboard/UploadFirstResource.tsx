import React, { useState } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, 
    MenuItem, InputAdornment, Container, Card, CardMedia, 
    CardContent, Chip, IconButton, Stack, useTheme, Divider, 
    FormControl, FormLabel, OutlinedInput
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import Sidebar
import TeacherSidebar from './TeacherSidebar';

const UploadFirstResource = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        subject: '',
        thumbnail: null as File | null,
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
                thumbnail: file,
                thumbnailPreview: URL.createObjectURL(file) // Create local preview URL
            });
        }
    };

    const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resourceFile: e.target.files[0] });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Backend Logic here
        console.log("Submitting:", formData);
        alert("Resource Published!"); // Replace with Toast
        navigate('/dashboard/teacher');
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
                            sx={{ px: 4, fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}
                        >
                            Publish
                        </Button>
                    </Stack>
                </Box>

                <Container maxWidth="xl" sx={{ p: 4 }}>
                    <Grid container spacing={6}>
                        
                        {/* --- LEFT COLUMN: EDITOR --- */}
                        <Grid item xs={12} lg={7}>
                            <Stack spacing={4}>
                                
                                {/* Section 1: Basic Info */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Resource Details</Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600, color: '#333' }}>Title</FormLabel>
                                                <TextField 
                                                    placeholder="e.g. Form 4 History Notes Complete Guide" 
                                                    name="title" value={formData.title} onChange={handleChange}
                                                    variant="outlined" fullWidth
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600, color: '#333' }}>Category</FormLabel>
                                                <TextField 
                                                    select name="subject" value={formData.subject} onChange={handleChange}
                                                    variant="outlined" fullWidth defaultValue=""
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                                                <FormLabel sx={{ mb: 1, fontWeight: 600, color: '#333' }}>Price (KES)</FormLabel>
                                                <OutlinedInput 
                                                    name="price" type="number" value={formData.price} onChange={handleChange}
                                                    startAdornment={<InputAdornment position="start">KES</InputAdornment>}
                                                    sx={{ borderRadius: 2 }}
                                                    placeholder="0"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <FormLabel sx={{ mb: 1, fontWeight: 600, color: '#333' }}>Description</FormLabel>
                                                <TextField 
                                                    multiline rows={5} 
                                                    name="description" value={formData.description} onChange={handleChange}
                                                    placeholder="What will students learn from this resource?"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                {/* Section 2: Media (Thumbnail) */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Cover Image</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Upload a clear image to attract students (JPG, PNG).
                                    </Typography>
                                    
                                    <Box sx={{ 
                                        border: '2px dashed #e0e0e0', borderRadius: 3, p: 4, 
                                        textAlign: 'center', bgcolor: '#fafafa', transition: '0.2s',
                                        '&:hover': { borderColor: theme.palette.primary.main, bgcolor: '#f0f7ff' } 
                                    }}>
                                        <input accept="image/*" style={{ display: 'none' }} id="thumbnail-upload" type="file" onChange={handleThumbnailChange} />
                                        <label htmlFor="thumbnail-upload" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                                            {formData.thumbnailPreview ? (
                                                <Box sx={{ position: 'relative', width: '100%', height: 200, borderRadius: 2, overflow: 'hidden' }}>
                                                    <img src={formData.thumbnailPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', '&:hover': { opacity: 1 } }}>
                                                        <Typography color="white" fontWeight={600}>Change Image</Typography>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Stack alignItems="center" spacing={1}>
                                                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                        <ImageIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                                                    </Box>
                                                    <Typography fontWeight={600} color="primary">Click to upload thumbnail</Typography>
                                                    <Typography variant="caption" color="text.secondary">1280x720 pixels recommended</Typography>
                                                </Stack>
                                            )}
                                        </label>
                                    </Box>
                                </Paper>

                                {/* Section 3: Content (The File) */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Resource File</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        The actual file students will download after purchase.
                                    </Typography>

                                    <Box sx={{ 
                                        border: '2px dashed #e0e0e0', borderRadius: 3, p: 4, 
                                        bgcolor: '#fafafa', transition: '0.2s',
                                        '&:hover': { borderColor: theme.palette.primary.main } 
                                    }}>
                                        <input accept=".pdf,.doc,.docx,.ppt" style={{ display: 'none' }} id="resource-upload" type="file" onChange={handleResourceFileChange} />
                                        <label htmlFor="resource-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                            {formData.resourceFile ? (
                                                <Stack direction="row" alignItems="center" spacing={2} sx={{ bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid #eee' }}>
                                                    <CheckCircleIcon color="success" />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography fontWeight={600}>{formData.resourceFile.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {(formData.resourceFile.size / 1024 / 1024).toFixed(2)} MB
                                                        </Typography>
                                                    </Box>
                                                    <Typography color="primary" fontWeight={600} fontSize="0.9rem">Change</Typography>
                                                </Stack>
                                            ) : (
                                                <Stack alignItems="center" spacing={1}>
                                                    <CloudUploadIcon sx={{ fontSize: 40, color: '#999' }} />
                                                    <Typography fontWeight={600} color="text.primary">Drag and drop or click to upload</Typography>
                                                    <Typography variant="caption" color="text.secondary">PDF, DOCX, PPT (Max 50MB)</Typography>
                                                </Stack>
                                            )}
                                        </label>
                                    </Box>
                                </Paper>
                            </Stack>
                        </Grid>

                        {/* --- RIGHT COLUMN: LIVE PREVIEW --- */}
                        <Grid item xs={12} lg={5}>
                            <Box sx={{ position: 'sticky', top: 100 }}>
                                <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1 }}>
                                    Live Preview
                                </Typography>
                                
                                {/* PREVIEW CARD */}
                                <Card sx={{ 
                                    borderRadius: 3, 
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                                    border: 'none',
                                    maxWidth: 400
                                }}>
                                    <Box sx={{ position: 'relative', bgcolor: '#eee', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {formData.thumbnailPreview ? (
                                            <CardMedia component="img" image={formData.thumbnailPreview} sx={{ height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon sx={{ fontSize: 60, color: '#ccc' }} />
                                        )}
                                        <Chip 
                                            label={formData.price ? `KES ${formData.price}` : 'FREE'} 
                                            sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'white', fontWeight: 700 }} 
                                        />
                                    </Box>

                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="caption" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                            {formData.subject || "Category"}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={700} sx={{ mt: 1, mb: 1, lineHeight: 1.3 }}>
                                            {formData.title || "Your Resource Title"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ 
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '4.5em'
                                        }}>
                                            {formData.description || "Your description will appear here. Make it catchy so students know exactly what they are buying."}
                                        </Typography>

                                        <Divider sx={{ my: 2 }} />

                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#eee' }} />
                                            <Typography variant="caption" fontWeight={600}>Instructor Name</Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, color: '#0d47a1', fontSize: '0.9rem', display: 'flex', gap: 1 }}>
                                    <CheckCircleIcon fontSize="small" />
                                    <Typography variant="body2">
                                        Once published, your resource will be available instantly in the marketplace.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default UploadFirstResource;
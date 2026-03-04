import React, { useState } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, Grid, MenuItem, InputAdornment, 
    Stack, IconButton, Alert, Snackbar, CircularProgress, ListSubheader, 
    alpha, Divider, createTheme, ThemeProvider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';
import AppNotification from '@/components/AppNotification';
// High-End Icons (Lucide)
import { 
    ArrowLeft, UploadCloud, FileText, Image as ImageIcon, 
    CheckCircle, Info, DollarSign, Layout 
} from 'lucide-react';

const BRAND_BLUE = '#2563EB';
const BORDER_COLOR = '#E2E8F0';

const uploadTheme = createTheme({
    typography: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    components: {
        MuiTypography: {
            styleOverrides: { root: { fontFamily: "'Plus Jakarta Sans', sans-serif !important" } },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: { borderRadius: '2px', backgroundColor: '#F8FAFC' },
            },
        },
    },
});

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
            setSnackbar({ open: true, msg: "All fields are required: Title, Resource File, and Cover Image", type: 'error' });
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

    // Helper for File Upload UI
    const FileBox = ({ file, type, label, icon }: any) => (
        <Box 
            component="label"
            sx={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                p: 3, border: `1px dashed ${BORDER_COLOR}`, borderRadius: '2px', cursor: 'pointer',
                bgcolor: file ? alpha(BRAND_BLUE, 0.02) : '#FFF',
                transition: '0.2s', '&:hover': { borderColor: BRAND_BLUE, bgcolor: '#F8FAFC' }
            }}
        >
            <input type="file" hidden accept={type} onChange={(e) => handleFile(e, label)} />
            <Box sx={{ p: 1, bgcolor: file ? alpha('#10B981', 0.1) : alpha(BRAND_BLUE, 0.05), borderRadius: '2px', mb: 1.5, color: file ? '#10B981' : BRAND_BLUE }}>
                {file ? <CheckCircle size={24} /> : icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {file ? file.name : `Select ${label === 'resourceFile' ? 'Document' : 'Thumbnail'}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {label === 'resourceFile' ? 'PDF, DOCX, PPT' : 'JPG, PNG (16:9 recommended)'}
            </Typography>
        </Box>
    );

    return (
        <ThemeProvider theme={uploadTheme}>
            <TeacherLayout title="Create Resource" selectedRoute="/dashboard/teacher/upload-first-resource">
                <Box sx={{ maxWidth: 1100, mx: 'auto', animation: 'fadeIn 0.5s ease-out' }}>
                    
                    {/* TOP ACTION BAR */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton onClick={() => navigate('/dashboard/teacher')} sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', bgcolor: 'white' }}>
                                <ArrowLeft size={20} />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>New Material</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Publish your educational resources to the marketplace.</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Grid container spacing={4}>
                        {/* LEFT COLUMN: PRIMARY DETAILS */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={0} sx={{ p: 4, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <Layout size={20} color={BRAND_BLUE} />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Resource Information</Typography>
                                </Box>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>RESOURCE TITLE</Typography>
                                        <TextField name="title" fullWidth value={formData.title} onChange={handleChange} placeholder="e.g. Grade 9 Integrated Science Project" />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>CURRICULUM</Typography>
                                        <TextField select name="curriculum" fullWidth value={formData.curriculum} onChange={handleChange}>
                                            <MenuItem value="CBC">CBC (Competency Based)</MenuItem>
                                            <MenuItem value="8-4-4">8-4-4 / KCSE (Legacy)</MenuItem>
                                            <MenuItem value="IGCSE">IGCSE</MenuItem>
                                            <MenuItem value="General">General / Books & Novels</MenuItem>
                                        </TextField>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>LEVEL / GRADE</Typography>
                                        <TextField select name="grade" fullWidth value={formData.grade} onChange={handleChange}>
                                            <ListSubheader>Junior School (CBC)</ListSubheader>
                                            {['Grade 7', 'Grade 8', 'Grade 9'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                            <ListSubheader>Senior School (CBC)</ListSubheader>
                                            {['Grade 10', 'Grade 11', 'Grade 12'].map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                            <ListSubheader>Legacy System</ListSubheader>
                                            {['Form 1', 'Form 2', 'Form 3', 'Form 4'].map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                                            <ListSubheader>Other</ListSubheader>
                                            <MenuItem value="General Audience">General Audience</MenuItem>
                                            <MenuItem value="All Grades">All Grades</MenuItem>
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>SUBJECT / LEARNING AREA</Typography>
                                        <TextField select name="subject" fullWidth value={formData.subject} onChange={handleChange}>
                                            <ListSubheader sx={{ fontWeight: 800 }}>Core Subjects</ListSubheader>
                                            {['Mathematics', 'English', 'Kiswahili', 'Integrated Science', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Social Studies'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                            <ListSubheader sx={{ fontWeight: 800 }}>Electives & Creative</ListSubheader>
                                            {['Literature', 'Agriculture', 'Business Studies', 'Computer Science', 'Media Studies', 'Home Science', 'Performing Arts'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>DESCRIPTION & SUMMARY</Typography>
                                        <TextField name="description" multiline rows={5} fullWidth value={formData.description} onChange={handleChange} placeholder="What will students learn from this material?" />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* RIGHT COLUMN: PRICING & UPLOADS */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                {/* PRICING CARD */}
                                <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <DollarSign size={18} color={BRAND_BLUE} />
                                        <Typography sx={{ fontWeight: 800 }}>Pricing</Typography>
                                    </Box>
                                    <TextField 
                                        name="price" type="number" fullWidth value={formData.price} onChange={handleChange} 
                                        InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }} 
                                        placeholder="0 for Free" 
                                    />
                                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha(BRAND_BLUE, 0.05), borderRadius: '2px', display: 'flex', gap: 1.5 }}>
                                        <Info size={16} style={{ color: BRAND_BLUE, flexShrink: 0, marginTop: 2 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            Resources set to 0 KES will be listed as <strong>Free</strong> for all students.
                                        </Typography>
                                    </Box>
                                </Paper>

                               {/* FILE UPLOAD CARD */}
<Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Media & Files</Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Ensure your files are clear and professional.
    </Typography>
    
    <Stack spacing={2}>
        {/* 1. THE MAIN DOCUMENT */}
        <FileBox 
            file={formData.resourceFile} 
            label="resourceFile" 
            type=".pdf,.doc,.docx,.ppt,.pptx" 
            icon={<FileText size={24}/>} 
        />

        {/* 2. THE COVER IMAGE */}
        <Box 
            component="label"
            sx={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                p: 3, border: `1px dashed ${BORDER_COLOR}`, borderRadius: '2px', cursor: 'pointer',
                bgcolor: formData.thumbnailFile ? alpha('#10B981', 0.02) : '#FFF',
                transition: '0.2s', '&:hover': { borderColor: BRAND_BLUE, bgcolor: '#F8FAFC' }
            }}
        >
            <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e, 'thumbnailFile')} />
            
            <Box sx={{ p: 1, bgcolor: formData.thumbnailFile ? alpha('#10B981', 0.1) : alpha(BRAND_BLUE, 0.05), borderRadius: '2px', mb: 1.5, color: formData.thumbnailFile ? '#10B981' : BRAND_BLUE }}>
                {formData.thumbnailFile ? <CheckCircle size={24} /> : <ImageIcon size={24} />}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {formData.thumbnailFile ? formData.thumbnailFile.name : "Upload Cover Image"}
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 0.5, px: 1 }}>
                This is the "Book Cover" students see when browsing the Website.
            </Typography>
        </Box>
    </Stack>
    
    {/* PRO TIP FOR TEACHERS */}
    <Box sx={{ mt: 2, p: 2, bgcolor: '#F0F9FF', border: '1px solid #B9E6FE', borderRadius: '2px', display: 'flex', gap: 1 }}>
        <Info size={14} style={{ color: '#0284C7', flexShrink: 0, marginTop: 2 }} />
        <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 500 }}>
            <strong>Pro-tip:</strong> Use a clear image or a screenshot of the first page to attract more students.
        </Typography>
    </Box>
</Paper>

                                <Button 
                                    variant="contained" size="large" fullWidth onClick={handleSubmit} disabled={loading}
                                    sx={{ 
                                        py: 2, fontWeight: 800, borderRadius: '2px', bgcolor: '#0F172A', 
                                        '&:hover': { bgcolor: '#1E293B' }, boxShadow: 'none' 
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Publish Resource"}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
                
              
                <AppNotification 
                    open={snackbar.open}
                    message={snackbar.msg} 
                    severity={snackbar.type} 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                />
            </TeacherLayout>
        </ThemeProvider>
    );
};

export default UploadFirstResource;
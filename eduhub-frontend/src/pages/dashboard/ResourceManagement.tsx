import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Paper, Button, IconButton, CircularProgress, 
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, 
    OutlinedInput, InputAdornment, Grid, Chip, alpha, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    TablePagination, createTheme, ThemeProvider,Stack,Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import AppNotification from '@/components/AppNotification';
// Layout & UI Logic
import TeacherLayout from '../../components/TeacherLayout';
import { 
    Plus, Search, Filter, Download, 
    Edit3, Trash2, FileText, UploadCloud, ArrowLeft, AlertCircle, Image as ImageIcon
} from 'lucide-react';

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Physics', 'Chemistry', 'Biology', 'CRE', 'Computer Studies', 'Business'];
const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];
const CURRICULA = ['CBC', '8-4-4', 'IGCSE', 'KCSE'];

const BRAND_BLUE = '#2563EB'; 
const BRAND_ORANGE = '#F97316'; 
const BORDER_COLOR = '#E2E8F0';

const dashboardTheme = createTheme({
    typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    components: {
        MuiTypography: { styleOverrides: { root: { fontFamily: "'Plus Jakarta Sans', sans-serif !important" } } },
        MuiButton: { styleOverrides: { root: { borderRadius: '2px', textTransform: 'none', fontWeight: 700 } } }
    }
});

const ResourceManagement = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- TABLE & FILTER STATE ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('All');

    // --- ACTION STATES ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // --- FORM DATA STATE ---
    const [editFormData, setEditFormData] = useState({
        title: '', description: '', subject: '', grade: '', curriculum: '', price: '',
        resourceFile: null as File | null, thumbnailFile: null as File | null
    });

    useEffect(() => { fetchResources(); }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/teacher/dashboard');
            setResources(response.data.resources || []);
        } catch (err) { console.error('Fetch error:', err); } 
        finally { setLoading(false); }
    };

    // ---  FILTER LOGIC ---
    
    const filteredResources = useMemo(() => {
        return resources.filter(res => {
            const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = filterSubject === 'All' || 
                                   res.subject?.toString().trim() === filterSubject.trim();
            return matchesSearch && matchesSubject;
        });
    }, [resources, searchTerm, filterSubject]);

    const paginatedResources = filteredResources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleExportCSV = () => {
        const headers = ["Title", "Subject", "Grade", "Curriculum", "Price"];
        const rows = filteredResources.map(r => [`"${r.title}"`, r.subject, r.grade, r.curriculum, r.price || 0].join(","));
        const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resources-export.csv`;
        a.click();
    };

    // --EDIT LOGIC ---
    const handleEditClick = (res: any) => {
        setEditingResource(res);
        setEditFormData({
            title: res.title || '',
            description: res.description || '',
            subject: res.subject || '',
            grade: res.grade || '',
            curriculum: res.curriculum || '',
            price: res.price ? res.price.toString() : '',
            resourceFile: null,
            thumbnailFile: null
        });
        setEditDialogOpen(true);
    };

    // UPDATE LOGIC
    const handleUpdateSubmit = async () => {
        if (!editingResource) return;
        setIsUpdating(true);

        const formData = new FormData();
        formData.append('title', editFormData.title);
        formData.append('description', editFormData.description);
        formData.append('subject', editFormData.subject);
        formData.append('grade', editFormData.grade);
        formData.append('curriculum', editFormData.curriculum);
        
        const priceVal = parseFloat(editFormData.price);
        formData.append('pricing', priceVal > 0 ? "Paid" : "Free");
        if (priceVal > 0) formData.append('price', editFormData.price);

        if (editFormData.resourceFile) formData.append('file', editFormData.resourceFile);
        if (editFormData.thumbnailFile) formData.append('thumbnail', editFormData.thumbnailFile);

        try {
            await api.post(`/api/teacher/resources/update/${editingResource.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setSnackbar({ open: true, message: 'Resource updated successfully', severity: 'success' });
            setEditDialogOpen(false);
            fetchResources();
        } catch (error: any) {
            console.error("Update failed", error);
            setSnackbar({ open: true, message: 'Failed to update resource', severity: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/teacher/resources/${resourceToDelete}`);
            setSnackbar({ open: true, message: 'Resource deleted', severity: 'success' });
            fetchResources();
        } catch (e) { setSnackbar({ open: true, message: 'Could not delete resource', severity: 'error' }); }
        finally { setDeleteDialogOpen(false); }
    };

    return (
        <ThemeProvider theme={dashboardTheme}>
            <TeacherLayout title="Resources" selectedRoute="/dashboard/teacher/resources">
                <Box sx={{ width: '100%', pb: 5 }}>
                    
                  {/* --- HEADER --- */}
<Box sx={{ 
    mb: 4, 
    display: 'flex', 
    flexDirection: { xs: 'column', sm: 'row' }, 
    justifyContent: 'space-between', 
    alignItems: { xs: 'flex-start', sm: 'center' }, 
    gap: 2,
    pb: 3, 
    borderBottom: `1px solid ${BORDER_COLOR}` 
}}>
    {/* LEFT SIDE: BACK ARROW + TITLE */}
    <Stack direction="row" spacing={2} alignItems="center">
        <IconButton 
            onClick={() => navigate('/dashboard/teacher')} 
            sx={{ 
                border: `1px solid ${BORDER_COLOR}`, 
                borderRadius: '2px', 
                bgcolor: 'white',
                '&:hover': { bgcolor: '#F8FAFC' } 
            }}
        >
            <ArrowLeft size={20} />
        </IconButton>
        
        <Box>
            <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#0F172A', 
                letterSpacing: '-0.04em',
                fontSize: { xs: '1.5rem', md: '2rem' } 
            }}>
                My Resources
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Dashboard • Content Management
            </Typography>
        </Box>
    </Stack>

    {/* RIGHT SIDE: NEW RESOURCE BUTTON */}
    <Button 
        variant="contained" 
        startIcon={<Plus size={18} />}
        fullWidth={window.innerWidth < 600}
        onClick={() => navigate('/dashboard/teacher/upload-first-resource')}
        sx={{ 
            bgcolor: '#0F172A', 
            px: 3, 
            py: 1.2, 
            boxShadow: 'none', 
            '&:hover': { bgcolor: '#1E293B' } 
        }}
    >
        New Resource
    </Button>
</Box>
                   {/* --- FILTER BAR --- */}
<Box sx={{ 
    mb: 3, 
    display: 'flex', 
    flexDirection: { xs: 'column', md: 'row' }, // Stack inputs on mobile
    gap: 2, 
    alignItems: 'center', 
    justifyContent: 'space-between' 
}}>
    <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, // Stack search/select on small mobile
        gap: 1.5, 
        width: { xs: '100%', md: 'auto' }, // Full width on mobile
        flex: 1 
    }}>
        <OutlinedInput
            placeholder="Search resources..."
            value={searchTerm}
            fullWidth // Take available space
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={<InputAdornment position="start"><Search size={18} color="#94A3B8" /></InputAdornment>}
            sx={{ height: 42, borderRadius: '2px', bgcolor: '#FFF', '& fieldset': { borderColor: BORDER_COLOR } }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
            <Select
                value={filterSubject}
                onChange={(e) => { setFilterSubject(e.target.value); setPage(0); }}
                displayEmpty
                sx={{ borderRadius: '2px', height: 42, bgcolor: '#FFF' }}
            >
                <MenuItem value="All">All Subjects</MenuItem>
                {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
        </FormControl>
    </Box>
    <Button 
        variant="outlined" 
        startIcon={<Download size={16}/>} 
        onClick={handleExportCSV}
        fullWidth={window.innerWidth < 900} // Full width button on tablets/mobile
        sx={{ borderColor: BORDER_COLOR, color: '#475569', height: 42, borderRadius: '2px', fontWeight: 700 }}
    >
        Export
    </Button>
</Box>

                   {/* --- PREMIUM TABLE SECTION --- */}
<TableContainer 
    component={Paper} 
    elevation={0} 
    sx={{ 
        border: `1px solid ${BORDER_COLOR}`, 
        borderRadius: '2px',
        width: '100%',
        overflowX: 'auto', 
        bgcolor: '#FFF'
    }}
>
    <Table sx={{ minWidth: { xs: 700, md: '100%' } }}>
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', py: 2 }}>
                    Resource Name
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Subject
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Grade
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    Action
                </TableCell>
            </TableRow>
        </TableHead>
        
      <TableBody>
    {loading ? (
        // Show 5 skeleton rows while loading
        [...Array(5)].map((_, index) => (
            <TableRow key={index}>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: '2px' }} />
                        <Skeleton variant="text" width="150px" height={25} />
                    </Box>
                </TableCell>
                <TableCell><Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '2px' }} /></TableCell>
                <TableCell><Skeleton variant="text" width={60} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: '2px' }} /></TableCell>
                <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Skeleton variant="rectangular" width={32} height={32} />
                        <Skeleton variant="rectangular" width={32} height={32} />
                    </Box>
                </TableCell>
            </TableRow>
        ))
            ) : paginatedResources.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            <FileText size={40} style={{ opacity: 0.2, marginBottom: 8 }} />
                            <Typography variant="body2">No resources found matching your criteria.</Typography>
                        </Box>
                    </TableCell>
                </TableRow>
            ) : (
                paginatedResources.map((res) => (
                    <TableRow key={res.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ 
                                    p: 1, 
                                    bgcolor: alpha(BRAND_BLUE, 0.05), 
                                    borderRadius: '2px',
                                    display: { xs: 'none', sm: 'flex' } // Hide icon on very small screens to save space
                                }}>
                                    <FileText size={20} color={BRAND_BLUE} />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                                    {res.title}
                                </Typography>
                            </Box>
                        </TableCell>
                        
                        <TableCell>
                            <Chip 
                                label={res.subject} 
                                size="small" 
                                sx={{ 
                                    borderRadius: '2px', 
                                    fontWeight: 800, 
                                    fontSize: '0.65rem', 
                                    bgcolor: alpha(BRAND_BLUE, 0.1), 
                                    color: BRAND_BLUE 
                                }} 
                            />
                        </TableCell>
                        
                        <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8rem' }}>
                            {res.grade}
                        </TableCell>
                        
                        <TableCell>
                            <Chip 
                                label={res.price > 0 ? `KES ${res.price}` : 'Free'} 
                                size="small" 
                                sx={{ 
                                    borderRadius: '2px', 
                                    fontWeight: 900, 
                                    fontSize: '0.65rem',
                                    bgcolor: res.price > 0 ? alpha(BRAND_ORANGE, 0.1) : alpha('#10B981', 0.1),
                                    color: res.price > 0 ? BRAND_ORANGE : '#059669'
                                }} 
                            />
                        </TableCell>
                        
                        <TableCell align="right">
                            {/* Box ensures buttons stay side-by-side even on small screens */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, whiteSpace: 'nowrap' }}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleEditClick(res)} 
                                    sx={{ 
                                        color: BRAND_BLUE, 
                                        border: `1px solid ${alpha(BRAND_BLUE, 0.2)}`, 
                                        borderRadius: '2px',
                                        '&:hover': { bgcolor: alpha(BRAND_BLUE, 0.05) }
                                    }}
                                >
                                    <Edit3 size={16} />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    onClick={() => { setResourceToDelete(res.id); setDeleteDialogOpen(true); }} 
                                    sx={{ 
                                        color: '#EF4444', 
                                        border: `1px solid ${alpha('#EF4444', 0.2)}`, 
                                        borderRadius: '2px',
                                        '&:hover': { bgcolor: alpha('#EF4444', 0.05) }
                                    }}
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            </Box>
                        </TableCell>
                    </TableRow>
                ))
            )}
        </TableBody>
    </Table>
    
    <TablePagination
        component="div"
        count={filteredResources.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        sx={{ 
            borderTop: `1px solid ${BORDER_COLOR}`,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.75rem',
                fontWeight: 600
            }
        }}
    />
</TableContainer>

                    {/* --- EDIT DIALOG  --- */}
                    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '2px' } }}>
                        <DialogTitle sx={{ fontWeight: 800, borderBottom: `1px solid ${BORDER_COLOR}` }}>Edit Resource</DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}><TextField label="Title" fullWidth value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} /></Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth><InputLabel>Subject</InputLabel>
                                        <Select label="Subject" value={editFormData.subject} onChange={(e) => setEditFormData({...editFormData, subject: e.target.value})}>
                                            {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth><InputLabel>Grade</InputLabel>
                                        <Select label="Grade" value={editFormData.grade} onChange={(e) => setEditFormData({...editFormData, grade: e.target.value})}>
                                            {GRADES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth><InputLabel>Curriculum</InputLabel>
                                        <Select label="Curriculum" value={editFormData.curriculum} onChange={(e) => setEditFormData({...editFormData, curriculum: e.target.value})}>
                                            {CURRICULA.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}><TextField label="Description" fullWidth multiline rows={3} value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} /></Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField label="Price (KES)" fullWidth type="number" value={editFormData.price} onChange={(e) => setEditFormData({...editFormData, price: e.target.value})} />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Button component="label" fullWidth variant="outlined" startIcon={<UploadCloud size={16}/>} sx={{ height: 56, borderColor: BORDER_COLOR }}>
                                        {editFormData.resourceFile ? "New File Ready" : "Change File"}
                                        <input type="file" hidden onChange={(e) => setEditFormData({...editFormData, resourceFile: e.target.files?.[0] || null})} />
                                    </Button>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Button component="label" fullWidth variant="outlined" startIcon={<ImageIcon size={16}/>} sx={{ height: 56, borderColor: BORDER_COLOR }}>
                                        {editFormData.thumbnailFile ? "New Image Ready" : "Change Thumb"}
                                        <input type="file" hidden accept="image/*" onChange={(e) => setEditFormData({...editFormData, thumbnailFile: e.target.files?.[0] || null})} />
                                    </Button>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: `1px solid ${BORDER_COLOR}` }}>
                            <Button onClick={() => setEditDialogOpen(false)} color="inherit">Cancel</Button>
                            <Button variant="contained" onClick={handleUpdateSubmit} disabled={isUpdating} sx={{ bgcolor: BRAND_BLUE, px: 4 }}>
                                {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* --- DELETE DIALOG --- */}
                    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '2px' } }}>
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <AlertCircle size={48} color="#EF4444" style={{ marginBottom: 16 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Confirm Deletion</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>This action will remove the resource permanently.</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button fullWidth variant="outlined" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                                <Button fullWidth variant="contained" onClick={handleConfirmDelete} sx={{ bgcolor: '#EF4444' }}>Delete</Button>
                            </Box>
                        </Box>
                    </Dialog>

                    {/*  NOTIFICATION */}
                    <AppNotification 
                        open={snackbar.open}
                        message={snackbar.message}
                        severity={snackbar.severity}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                    />
                </Box>
            </TeacherLayout>
        </ThemeProvider>
    );
};

export default ResourceManagement;
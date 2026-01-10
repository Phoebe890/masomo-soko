import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Container, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  CircularProgress, useTheme, useMediaQuery, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput, 
  InputAdornment, Grid, Chip, Tooltip, alpha, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';

// Icons
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudUploadIcon from '@mui/icons-material/CloudUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Components
import TeacherSidebar from '../../components/TeacherSidebar';

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Physics', 'Chemistry', 'Biology', 'CRE', 'Computer Studies', 'Business'];
const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];
const CURRICULA = ['CBC', '8-4-4', 'IGCSE', 'KCSE'];

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER & SEARCH STATE (New) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');

  // --- DELETE STATE ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);

  // --- EDIT STATE ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    title: '', description: '', subject: '', grade: '', curriculum: '', price: '',
    resourceFile: null as File | null, thumbnailFile: null as File | null
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/teacher/dashboard'); 
      setResources(response.data.resources || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'All' || resource.subject === filterSubject;
    const matchesGrade = filterGrade === 'All' || resource.grade === filterGrade;
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const handleUploadClick = () => {
    navigate('/dashboard/teacher/upload-first-resource');
  };

  const handleDeleteClick = (id: number) => {
    setResourceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;
    try {
        await api.delete(`/api/teacher/resources/${resourceToDelete}`);
        setSnackbar({ open: true, message: 'Resource deleted successfully', severity: 'success' });
        fetchResources(); 
    } catch (e) {
        setSnackbar({ open: true, message: 'Could not delete resource', severity: 'error' });
    } finally {
        setDeleteDialogOpen(false);
        setResourceToDelete(null);
    }
  };

  const handleEditClick = (resource: any) => {
    setEditingResource(resource);
    setEditFormData({
        title: resource.title || '',
        description: resource.description || '',
        subject: resource.subject || '',
        grade: resource.grade || '',
        curriculum: resource.curriculum || '',
        price: resource.price ? resource.price.toString() : '',
        resourceFile: null,
        thumbnailFile: null
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'resourceFile' | 'thumbnailFile') => {
    if (e.target.files && e.target.files[0]) {
        setEditFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

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
            headers: {
                'Content-Type': 'multipart/form-data'
            }
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

  return (
    <Container maxWidth={false} disableGutters sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA', p: 0 }}>
      <TeacherSidebar 
        selectedRoute="/dashboard/teacher/resources"
        mobileOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 5 }, width: '100%' }}>
        
        {/* PAGE HEADER */}
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && <IconButton onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>}
            <Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#111827' }}>My Resources</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Teacher</Typography>
                  <Typography variant="caption" color="text.secondary">•</Typography>
                  <Typography variant="body2" color="text.secondary">Content Management</Typography>
                </Box>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleUploadClick}
            sx={{ 
                bgcolor: '#2563EB', // The specific blue from the image button
                textTransform: 'none',
                fontWeight: 600, 
                borderRadius: 1.5, 
                boxShadow: 'none',
                px: 3,
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
            }}
          >
            New Resource
          </Button>
        </Box>

        {/* TOOLBAR & FILTERS */}
        <Paper 
            elevation={0} 
            sx={{ 
                border: '1px solid #E5E7EB',
                borderBottom: 'none',
                borderTopLeftRadius: 12, 
                borderTopRightRadius: 12,
                p: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#fff'
            }}
        >
            <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 300 }}>
                {/* Search Bar */}
                <OutlinedInput
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    startAdornment={<InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>}
                    sx={{ 
                        height: 40, 
                        bgcolor: '#fff',
                        borderRadius: 1,
                        fieldset: { borderColor: '#E5E7EB' },
                        '&:hover fieldset': { borderColor: '#D1D5DB' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                        width: { xs: '100%', sm: 250 }
                    }}
                />

                {/* Filter Subjects */}
                <Select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    displayEmpty
                    sx={{ 
                        height: 40, 
                        minWidth: 120, 
                        fontSize: '0.875rem',
                        bgcolor: '#fff',
                        fieldset: { borderColor: '#E5E7EB' },
                        '& .MuiSelect-select': { py: 1 }
                    }}
                    renderValue={(selected) => {
                        if (selected === 'All') return <Box sx={{ display: 'flex', gap: 1, color: '#6B7280' }}>Filter Subject</Box>;
                        return selected;
                    }}
                >
                    <MenuItem value="All">All Subjects</MenuItem>
                    {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>

                 {/* Filter Grades */}
                 <Select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    displayEmpty
                    sx={{ 
                        height: 40, 
                        minWidth: 120, 
                        fontSize: '0.875rem',
                        bgcolor: '#fff',
                        fieldset: { borderColor: '#E5E7EB' },
                        '& .MuiSelect-select': { py: 1 }
                    }}
                    renderValue={(selected) => {
                        if (selected === 'All') return <Box sx={{ display: 'flex', gap: 1, color: '#6B7280' }}>Filter Grade</Box>;
                        return selected;
                    }}
                >
                    <MenuItem value="All">All Grades</MenuItem>
                    {GRADES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                 <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                    Displaying {filteredResources.length} results
                 </Typography>
                 
                 <Button 
                    variant="outlined" 
                    startIcon={<FileDownloadIcon />}
                    size="small"
                    sx={{ 
                        borderColor: '#E5E7EB', 
                        color: '#374151', 
                        textTransform: 'none',
                        height: 40,
                        '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
                    }}
                 >
                    Export
                 </Button>
                 
                 <IconButton 
                    size="small" 
                    sx={{ 
                        border: '1px solid #E5E7EB', 
                        borderRadius: 1, 
                        p: 1,
                        height: 40,
                        width: 40
                    }}
                 >
                    <MoreVertIcon fontSize="small" />
                 </IconButton>
            </Box>
        </Paper>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <Table sx={{ minWidth: 650 }}>
            <TableHead>
                {/* Changed header background to light gray as per request */}
                <TableRow sx={{ bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Resource Name</TableCell>
                <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Subject</TableCell>
                <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Grade</TableCell>
                <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Curriculum</TableCell>
                <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Status</TableCell>
                <TableCell align="right" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                            <CircularProgress size={30} thickness={4} />
                        </TableCell>
                    </TableRow>
                ) : filteredResources.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography variant="body2" color="text.secondary">No resources found matching your filters.</Typography>
                    </TableCell>
                </TableRow>
                ) : (
                filteredResources.map((resource) => (
                    <TableRow 
                        key={resource.id} 
                        hover
                        sx={{ 
                            '&:hover': { bgcolor: '#F9FAFB' },
                            borderBottom: '1px solid #F3F4F6'
                        }}
                    >
                    <TableCell sx={{ fontWeight: 500, color: '#111827' }}>
                        {resource.title}
                    </TableCell>
                    <TableCell>
                        {/* Styled to look like the image chips */}
                        <Chip 
                            label={resource.subject} 
                            size="small" 
                            sx={{ 
                                bgcolor: alpha('#6366F1', 0.1), 
                                color: '#4338ca', 
                                fontWeight: 600, 
                                borderRadius: 1,
                                height: 24,
                                fontSize: '0.75rem'
                            }} 
                        />
                    </TableCell>
                    <TableCell sx={{ color: '#374151' }}>{resource.grade}</TableCell>
                    <TableCell sx={{ color: '#374151' }}>{resource.curriculum}</TableCell>
                    <TableCell>
                        {resource.price && parseFloat(resource.price) > 0 
                            ? <Chip 
                                label={`KES ${resource.price}`} 
                                size="small" 
                                sx={{ 
                                    bgcolor: alpha('#F59E0B', 0.1), 
                                    color: '#B45309', 
                                    fontWeight: 600, 
                                    borderRadius: 1,
                                    height: 24
                                }} 
                              />
                            : <Chip 
                                label="Free" 
                                size="small" 
                                sx={{ 
                                    bgcolor: alpha('#10B981', 0.1), 
                                    color: '#059669', 
                                    fontWeight: 600, 
                                    borderRadius: 1,
                                    height: 24
                                }} 
                              />
                        }
                    </TableCell>
                    <TableCell align="right">
                        <IconButton 
                            onClick={() => handleEditClick(resource)} 
                            size="small" 
                            sx={{ color: '#9CA3AF', '&:hover': { color: '#2563EB' } }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                            onClick={() => handleDeleteClick(resource.id)} 
                            size="small" 
                            sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
            </Table>
        </TableContainer>

        {/* Edit Dialog - Kept Logic */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Edit Resource</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3} sx={{ mt: 0 }}>
                    <Grid item xs={12}><TextField label="Title" name="title" fullWidth value={editFormData.title} onChange={handleEditChange} /></Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth><InputLabel>Subject</InputLabel><Select name="subject" value={editFormData.subject} label="Subject" onChange={handleEditChange}>{SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth><InputLabel>Grade</InputLabel><Select name="grade" value={editFormData.grade} label="Grade" onChange={handleEditChange}>{GRADES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}</Select></FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth><InputLabel>Curriculum</InputLabel><Select name="curriculum" value={editFormData.curriculum} label="Curriculum" onChange={handleEditChange}>{CURRICULA.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl>
                    </Grid>
                    <Grid item xs={12}><TextField label="Description" name="description" fullWidth multiline rows={4} value={editFormData.description} onChange={handleEditChange} /></Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth><InputLabel>Price (Optional)</InputLabel><OutlinedInput name="price" type="number" startAdornment={<InputAdornment position="start">KES</InputAdornment>} label="Price (Optional)" value={editFormData.price} onChange={handleEditChange} placeholder="0 for Free" /></FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                         <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>Update File (Optional)</Typography>
                            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} size="small">
                                {editFormData.resourceFile ? "New File Selected" : "Choose New File"}
                                <input type="file" hidden accept=".pdf,.doc,.docx,.ppt" onChange={(e) => handleEditFileChange(e, 'resourceFile')} />
                            </Button>
                         </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setEditDialogOpen(false)} color="inherit">Cancel</Button>
                <Button onClick={handleUpdateSubmit} variant="contained" disabled={isUpdating}>{isUpdating ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}</Button>
            </DialogActions>
        </Dialog>

        {/* Delete Dialog - Kept Logic */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#DC2626' }}><WarningAmberIcon /> Confirm Deletion</DialogTitle>
            <DialogContent><DialogContentText>Are you sure you want to delete this resource?</DialogContentText></DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" color="inherit">Cancel</Button>
                <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>Delete Resource</Button>
            </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ResourceManagement;

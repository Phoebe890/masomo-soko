import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Container, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  CircularProgress, useTheme, useMediaQuery, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, OutlinedInput, 
  InputAdornment, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Components
import TeacherSidebar from '../../components/TeacherSidebar';

// --- CONFIGURATION ---
const BACKEND_URL = "http://localhost:8081";

// Dropdown Options
const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Physics', 'Chemistry', 'Biology', 'CRE', 'Computer Studies', 'Business'];
const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];
const CURRICULA = ['CBC', '8-4-4', 'IGCSE', 'KCSE'];

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- DELETE STATE ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);

  // --- EDIT STATE ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit Form Fields
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    curriculum: '',
    price: '',
    resourceFile: null as File | null,
    thumbnailFile: null as File | null
  });

  // --- NOTIFICATION STATE ---
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/teacher/dashboard`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  const handleUploadClick = () => {
    navigate('/dashboard/teacher/upload-first-resource');
  };

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (id: number) => {
    setResourceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/resources/${resourceToDelete}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if(response.ok) {
            setSnackbar({ open: true, message: 'Resource deleted successfully', severity: 'success' });
            fetchResources(); 
        } else {
            throw new Error("Failed to delete");
        }
    } catch (e) {
        setSnackbar({ open: true, message: 'Could not delete resource', severity: 'error' });
    } finally {
        setDeleteDialogOpen(false);
        setResourceToDelete(null);
    }
  };

  // --- EDIT HANDLERS ---

  // 1. Open Dialog and Populate Data
  const handleEditClick = (resource: any) => {
    setEditingResource(resource);
    setEditFormData({
        title: resource.title || '',
        description: resource.description || '',
        subject: resource.subject || '',
        grade: resource.grade || '',
        curriculum: resource.curriculum || '',
        price: resource.price ? resource.price.toString() : '',
        resourceFile: null, // Reset files on open
        thumbnailFile: null
    });
    setEditDialogOpen(true);
  };

  // 2. Handle Input Changes in Edit Form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Handle File Changes in Edit Form
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'resourceFile' | 'thumbnailFile') => {
    if (e.target.files && e.target.files[0]) {
        setEditFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  // 4. Submit Update
  const handleUpdateSubmit = async () => {
    if (!editingResource) return;
    setIsUpdating(true);

    const formData = new FormData();
    formData.append('title', editFormData.title);
    formData.append('description', editFormData.description);
    formData.append('subject', editFormData.subject);
    formData.append('grade', editFormData.grade);
    formData.append('curriculum', editFormData.curriculum);
    
    // Pricing Logic
    const priceVal = parseFloat(editFormData.price);
    formData.append('pricing', priceVal > 0 ? "Paid" : "Free");
    if (priceVal > 0) formData.append('price', editFormData.price);

    // Only append files if user selected new ones
    if (editFormData.resourceFile) {
        formData.append('file', editFormData.resourceFile);
    }
    if (editFormData.thumbnailFile) {
        formData.append('thumbnail', editFormData.thumbnailFile);
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/teacher/resources/${editingResource.id}`, {
            method: 'PUT',
            credentials: 'include',
            body: formData // No Content-Type header when sending FormData
        });

        if (!response.ok) throw new Error("Update failed");

        setSnackbar({ open: true, message: 'Resource updated successfully', severity: 'success' });
        setEditDialogOpen(false);
        fetchResources(); // Refresh table
    } catch (error) {
        console.error(error);
        setSnackbar({ open: true, message: 'Failed to update resource', severity: 'error' });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA', p: 0 }}>
      <TeacherSidebar 
        selectedRoute="/dashboard/teacher/resources"
        mobileOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, width: '100%' }}>
        
        {/* --- HEADER --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
                <IconButton onClick={() => setSidebarOpen(true)}>
                <MenuIcon />
                </IconButton>
            )}
            <Typography variant="h4" fontWeight={700} color="text.primary">
                My Resources
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleUploadClick}
            sx={{ 
                py: 1.5, px: 3, 
                fontWeight: 600, 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            Upload New Resource
          </Button>
        </Box>

        {/* --- TABLE --- */}
        <Paper elevation={0} sx={{ border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>
            {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
            ) : (
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#fafafa' }}>
                    <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Curriculum</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {resources.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h6" color="text.secondary">No resources found</Typography>
                                <Button variant="outlined" onClick={handleUploadClick}>Upload Now</Button>
                            </Box>
                        </TableCell>
                    </TableRow>
                    ) : (
                    resources.map((resource) => (
                        <TableRow key={resource.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{resource.title}</TableCell>
                        <TableCell>
                            <Box component="span" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.875rem' }}>
                                {resource.subject}
                            </Box>
                        </TableCell>
                        <TableCell>{resource.grade}</TableCell>
                        <TableCell>{resource.curriculum}</TableCell>
                        <TableCell>
                            {resource.price && parseFloat(resource.price) > 0 
                                ? `KES ${resource.price}` 
                                : <Box component="span" sx={{ color: 'green', fontWeight: 600 }}>Free</Box>
                            }
                        </TableCell>
                        <TableCell align="right">
                            <IconButton onClick={() => handleEditClick(resource)} size="small" sx={{ color: theme.palette.primary.main, mr: 1 }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteClick(resource.id)} size="small" sx={{ color: theme.palette.error.main }}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
            </TableContainer>
            )}
        </Paper>

        {/* --- EDIT DIALOG --- */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Edit Resource</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3} sx={{ mt: 0 }}>
                    <Grid item xs={12}>
                        <TextField 
                            label="Title" name="title" fullWidth 
                            value={editFormData.title} onChange={handleEditChange} 
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Subject</InputLabel>
                            <Select name="subject" value={editFormData.subject} label="Subject" onChange={handleEditChange}>
                                {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Grade</InputLabel>
                            <Select name="grade" value={editFormData.grade} label="Grade" onChange={handleEditChange}>
                                {GRADES.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Curriculum</InputLabel>
                            <Select name="curriculum" value={editFormData.curriculum} label="Curriculum" onChange={handleEditChange}>
                                {CURRICULA.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="Description" name="description" fullWidth multiline rows={4}
                            value={editFormData.description} onChange={handleEditChange} 
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Price (Optional)</InputLabel>
                            <OutlinedInput
                                name="price" type="number"
                                startAdornment={<InputAdornment position="start">KES</InputAdornment>}
                                label="Price (Optional)"
                                value={editFormData.price} onChange={handleEditChange}
                                placeholder="0 for Free"
                            />
                        </FormControl>
                    </Grid>
                    
                    {/* File Update Section */}
                    <Grid item xs={12} md={6}>
                         <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>Update Resource File (Optional)</Typography>
                            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} size="small">
                                {editFormData.resourceFile ? "New File Selected" : "Choose New File"}
                                <input type="file" hidden accept=".pdf,.doc,.docx,.ppt" onChange={(e) => handleEditFileChange(e, 'resourceFile')} />
                            </Button>
                         </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                         <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>Update Cover Image (Optional)</Typography>
                            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} size="small">
                                {editFormData.thumbnailFile ? "New Image Selected" : "Choose New Image"}
                                <input type="file" hidden accept="image/*" onChange={(e) => handleEditFileChange(e, 'thumbnailFile')} />
                            </Button>
                         </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setEditDialogOpen(false)} color="inherit">Cancel</Button>
                <Button onClick={handleUpdateSubmit} variant="contained" disabled={isUpdating}>
                    {isUpdating ? <CircularProgress size={24} /> : "Save Changes"}
                </Button>
            </DialogActions>
        </Dialog>

        {/* --- DELETE CONFIRMATION DIALOG --- */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <WarningAmberIcon /> Confirm Deletion
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this resource? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
                    Delete Resource
                </Button>
            </DialogActions>
        </Dialog>

        {/* --- SNACKBAR --- */}
        <Snackbar 
            open={snackbar.open} 
            autoHideDuration={4000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>

      </Box>
    </Container>
  );
};

export default ResourceManagement;
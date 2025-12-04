import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, MenuItem, Select, InputLabel, FormControl, 
  RadioGroup, FormControlLabel, Radio, Grid, Chip, Container, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Alert, CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TeacherSidebar from './TeacherSidebar';
import { useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';

const SUBJECTS = [
  'Math', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Art', 'Music', 'ICT', 'Business', 'CRE', 'Physics', 'Chemistry', 'Biology', 'Other'
];

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Other'
];

const CURRICULA = [
  'CBC', '8-4-4', 'IGCSE', 'KCSE', 'Other'
];

const ResourceManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Upload form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<string[]>([]);
  const [grade, setGrade] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [pricing, setPricing] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/teacher/dashboard', {
        credentials: 'include'
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubjectChange = (e: any) => {
    setSubject(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file || !title.trim() || !description.trim() || subject.length === 0 || !grade || !curriculum || (pricing === 'paid' && !price)) {
      setError('Please fill in all required fields.');
      return;
    }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', subject.join(','));
      formData.append('grade', grade);
      formData.append('curriculum', curriculum);
      formData.append('pricing', pricing);
      if (pricing === 'paid') formData.append('price', price);
      
      const response = await fetch('/api/teacher/resources', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload resource');
      }
      setUploadLoading(false);
      setSuccess(true);
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setSubject([]);
      setGrade('');
      setCurriculum('');
      setPricing('free');
      setPrice('');
      // Refresh resources list
      setTimeout(() => {
        setSuccess(false);
        setUploadDialogOpen(false);
        fetchResources();
      }, 1500);
    } catch (err: any) {
      setUploadLoading(false);
      setError(err.message || 'Failed to upload resource.');
    }
  };

  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleCloseUploadDialog = () => {
    if (!uploadLoading) {
      setUploadDialogOpen(false);
      setFile(null);
      setTitle('');
      setDescription('');
      setSubject([]);
      setGrade('');
      setCurriculum('');
      setPricing('free');
      setPrice('');
      setError(null);
      setSuccess(false);
    }
  };

  const handleDelete = async (resourceId: number) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    // TODO: Implement delete API call
    console.log('Delete resource:', resourceId);
  };

  const handleEdit = (resource: any) => {
    // TODO: Implement edit functionality
    console.log('Edit resource:', resource);
  };

  const selectedRoute = location.pathname;

  return (
    <Container maxWidth={false} disableGutters sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50', p: 0 }}>
      <TeacherSidebar selectedRoute={selectedRoute} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h4" fontWeight={700}>
            Resource Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenUploadDialog}
            size="large"
          >
            Upload New Resource
          </Button>
        </Box>

        {/* Resources Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Curriculum</TableCell>
                  <TableCell>Price (KES)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No resources uploaded yet. Click "Upload New Resource" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>{resource.title}</TableCell>
                      <TableCell>{resource.subject}</TableCell>
                      <TableCell>{resource.grade}</TableCell>
                      <TableCell>{resource.curriculum}</TableCell>
                      <TableCell>{resource.price ? `KES ${resource.price}` : 'Free'}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(resource)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(resource.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Upload Dialog */}
        <Dialog 
          open={uploadDialogOpen} 
          onClose={handleCloseUploadDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { p: 2 }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={700}>
              Upload New Resource
            </Typography>
          </DialogTitle>
          <DialogContent>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Resource uploaded successfully!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleUploadSubmit}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ py: 3, fontSize: '1.1rem', borderStyle: 'dashed', borderWidth: 2 }}
                >
                  {file ? file.name : 'Choose File or Drag & Drop'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    onChange={handleFileChange}
                    required
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Accepted formats: .pdf, .doc, .docx
                </Typography>
              </FormControl>
              <TextField
                fullWidth
                label="Resource Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                minRows={3}
                maxRows={6}
                value={description}
                onChange={e => setDescription(e.target.value)}
                sx={{ mb: 3 }}
                required
                placeholder="Describe the content, purpose, and audience of your resource."
              />
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Subject</InputLabel>
                <Select
                  multiple
                  value={subject}
                  onChange={handleSubjectChange}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map(value => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  required
                >
                  {SUBJECTS.map(subj => (
                    <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Grade/Level</InputLabel>
                <Select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  required
                >
                  {GRADES.map(g => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Curriculum</InputLabel>
                <Select
                  value={curriculum}
                  onChange={e => setCurriculum(e.target.value)}
                  required
                >
                  {CURRICULA.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                  row
                  value={pricing}
                  onChange={e => setPricing(e.target.value as 'free' | 'paid')}
                >
                  <FormControlLabel value="free" control={<Radio />} label="Free" />
                  <FormControlLabel value="paid" control={<Radio />} label="Set a Price" />
                </RadioGroup>
                {pricing === 'paid' && (
                  <TextField
                    type="number"
                    label="Price (KES)"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    sx={{ mt: 2, maxWidth: 200 }}
                    required
                    inputProps={{ min: 1 }}
                  />
                )}
              </FormControl>
              <DialogActions sx={{ px: 0, pb: 0 }}>
                <Button onClick={handleCloseUploadDialog} disabled={uploadLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Resource'}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ResourceManagement;


import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, 
    IconButton, CircularProgress, Link, Avatar, Chip, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, TextField, InputAdornment
} from '@mui/material';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const BACKEND_URL = "http://localhost:8081";

interface Resource {
    id: number;
    title: string;
    teacherName: string; // Ensure backend sends this, or map it
    subject: string;
    price: number;
    filePath: string;
    previewImageUrl?: string;
}

const AdminResources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

    // Fetch Data
    const fetchResources = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/admin/resources`, { withCredentials: true });
            // The backend returns raw entities, we might need to map user to teacherName if not present
            // Assuming your backend returns a list of entities where `user` object exists
            const mapped = res.data.map((r: any) => ({
                id: r.id,
                title: r.title,
                teacherName: r.user?.name || 'Unknown',
                subject: r.subject,
                price: r.price,
                filePath: r.filePath,
                previewImageUrl: r.previewImageUrl // If available
            }));
            setResources(mapped);
            setFilteredResources(mapped);
        } catch (err) {
            console.error(err);
            setToast({ open: true, msg: "Failed to load resources", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResources(); }, []);

    // Filter
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        setFilteredResources(resources.filter(r => 
            r.title.toLowerCase().includes(lowerTerm) || 
            r.teacherName.toLowerCase().includes(lowerTerm) ||
            r.subject.toLowerCase().includes(lowerTerm)
        ));
    }, [searchTerm, resources]);

    // Handle Delete
    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await axios.delete(`${BACKEND_URL}/api/admin/resources/${deleteId}`, { withCredentials: true });
            setResources(resources.filter(r => r.id !== deleteId));
            setFilteredResources(filteredResources.filter(r => r.id !== deleteId));
            setToast({ open: true, msg: "Resource taken down successfully", type: 'success' });
        } catch (e) {
            setToast({ open: true, msg: "Failed to delete resource", type: 'error' });
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AdminSidebar selected="/admin/resources" />
            
            <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: '#111827' }}>
                    Content Moderation
                </Typography>

                {/* Search Bar */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <TextField 
                        fullWidth 
                        placeholder="Search by title, subject, or teacher..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                            sx: { borderRadius: 2 }
                        }}
                        size="small"
                    />
                </Paper>

                <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {loading ? (
                        <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
                    ) : (
                        <Table>
                            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                <TableRow>
                                     <TableCell sx={{ fontWeight: 700 }}>Resource</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Teacher</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                                     <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredResources.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar variant="rounded" src={row.previewImageUrl} sx={{ bgcolor: '#F3F4F6', color: '#9CA3AF' }}>
                                                    <PictureAsPdfIcon />
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{row.teacherName}</TableCell>
                                        <TableCell><Chip label={row.subject} size="small" /></TableCell>
                                        <TableCell>KES {row.price}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View File">
                                                <IconButton 
                                                    component={Link} 
                                                    href={row.filePath} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    color="primary"
                                                >
                                                    <VisibilityOutlinedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Resource">
                                                <IconButton 
                                                    color="error" 
                                                    onClick={() => setDeleteId(row.id)}
                                                    sx={{ ml: 1 }}
                                                >
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredResources.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No resources found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Paper>
            </Box>

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="error" />
                    Confirm Takedown
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete this resource? This will remove it from the marketplace and all student libraries.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error" disableElevation>
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>

            {/* TOAST NOTIFICATION */}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminResources;
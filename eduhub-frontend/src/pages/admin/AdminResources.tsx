import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    IconButton, CircularProgress, Avatar, Chip, Tooltip, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, Snackbar, Alert, TextField, InputAdornment 
} from '@mui/material';
import { api } from '@/api/axios';
import AdminLayout from './AdminLayout';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const AdminResources: React.FC = () => {
    const [resources, setResources] = useState<any[]>([]);
    const [filteredResources, setFilteredResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [takedownReason, setTakedownReason] = useState('');
    const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

    const fetchResources = async () => {
        try {
            // FIXED: Using relative path
            const res = await api.get('/api/admin/resources');
            setResources(res.data);
            setFilteredResources(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchResources(); }, []);

    useEffect(() => {
        setFilteredResources(resources.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())));
    }, [searchTerm, resources]);

    const confirmTakedown = async () => {
        if(!deleteId) return;
        try {
            // FIXED: Using relative path
            await api.post(`/api/admin/resources/${deleteId}/takedown`, { reason: takedownReason });
            setResources(prev => prev.filter(p => p.id !== deleteId));
            setToast({ open: true, msg: "Resource removed successfully", type: 'success' });
            setDeleteId(null);
        } catch (e) { setToast({ open: true, msg: "Failed to remove resource", type: 'error' }); }
    };

    return (
        <AdminLayout title="Content Moderation" selectedRoute="/admin/resources">
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                <TextField 
                    fullWidth placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} size="small"
                />
            </Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {loading ? <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box> : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 700 }}>
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
                                                <Avatar variant="rounded" src={row.previewImageUrl} sx={{ bgcolor: '#F3F4F6', color: '#9CA3AF' }}><PictureAsPdfIcon /></Avatar>
                                                <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{row.user?.name || row.teacherName}</TableCell>
                                        <TableCell><Chip label={row.subject} size="small" /></TableCell>
                                        <TableCell>KES {row.price}</TableCell>
                                        <TableCell align="right">
                                            <IconButton color="primary"><VisibilityOutlinedIcon /></IconButton>
                                            <IconButton color="error" onClick={() => setDeleteId(row.id)}><DeleteOutlineIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#DC2626' }}><WarningAmberIcon /> Confirm Takedown</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Reason for removal:</Typography>
                    <TextField fullWidth value={takedownReason} onChange={(e) => setTakedownReason(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button onClick={confirmTakedown} variant="contained" color="error">Remove</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})}><Alert severity={toast.type} variant="filled">{toast.msg}</Alert></Snackbar>
        </AdminLayout>
    );
};

export default AdminResources;
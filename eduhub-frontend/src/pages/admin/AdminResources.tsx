import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    IconButton, CircularProgress, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, Snackbar, Alert, TextField, Tooltip 
} from '@mui/material';
import { api } from '@/api/axios';
import AdminLayout from './AdminLayout';
import FileViewerModal from '@/components/FileViewerModal'; 

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const THEME_COLORS = {
    teal: '#2DD4BF',
    navy: '#0F172A',
    slate: '#94A3B8',
    danger: '#F87171'
};

const AdminResources: React.FC = () => {
    const [resources, setResources] = useState<any[]>([]);
    const [filteredResources, setFilteredResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [viewFile, setViewFile] = useState<{ url: string, title: string } | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [takedownReason, setTakedownReason] = useState('');
    const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

    const fetchResources = async () => {
        try {
            const res = await api.get('/api/admin/resources');
            setResources(res.data);
            setFilteredResources(res.data);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchResources(); }, []);

    useEffect(() => {
        setFilteredResources(resources.filter(r => 
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.subject?.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    }, [searchTerm, resources]);

    // --- UPDATED VIEW HANDLER ---
    const handleViewResource = (row: any) => {
        // 1. Log to debug exactly what the backend sent
        console.log("Viewing Resource:", row);

        // 2. Get the path (Backend sends 'filePath')
        const path = row.filePath || row.file_path; 

        if (!path) {
            setToast({ open: true, msg: "Error: No file path found for this resource.", type: 'error' });
            return;
        }

        // 3. Construct URL
        let fullUrl = "";
        
        // If it's an external URL (Cloudinary/S3), use it directly
        if (String(path).startsWith('http')) {
            fullUrl = path;
        } 
        // If it's a local file (e.g. "uploads/file.pdf"), prepend the backend URL
        else {
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";
            // Remove leading slash if both have it to avoid double slash
            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            fullUrl = `${baseUrl}/${cleanPath}`;
        }
            
        setViewFile({
            url: fullUrl,
            title: row.title
        });
    };

    const confirmTakedown = async () => {
        if(!deleteId) return;
        try {
            await api.post(`/api/admin/resources/${deleteId}/takedown`, { reason: takedownReason });
            setResources(prev => prev.filter(p => p.id !== deleteId));
            setToast({ open: true, msg: "Resource removed successfully", type: 'success' });
            setDeleteId(null);
            setTakedownReason('');
        } catch (e) { 
            setToast({ open: true, msg: "Failed to remove resource", type: 'error' }); 
        }
    };

    return (
        <AdminLayout title="Content Moderation" selectedRoute="/admin/resources">
            <Paper elevation={0} sx={{ 
                p: 2, mb: 3, borderRadius: 3, 
                bgcolor: 'white', border: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center'
            }}>
                <TextField 
                    fullWidth 
                    placeholder="Search resources by title or subject..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="standard"
                    InputProps={{ 
                        disableUnderline: true,
                        startAdornment: <SearchIcon sx={{ color: THEME_COLORS.slate, mr: 1 }} /> 
                    }} 
                />
            </Paper>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                {loading ? (
                    <Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress sx={{ color: THEME_COLORS.teal }} /></Box>
                ) : (
                    <TableContainer>
                        <Table sx={{ minWidth: 700 }}>
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.navy }}>Resource Details</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.navy }}>Teacher</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.navy }}>Category</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.navy }}>Price</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: THEME_COLORS.navy }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredResources.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No resources found matching your search.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredResources.map((row) => (
                                        <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F1F5F9' }, transition: '0.2s' }}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar 
                                                        variant="rounded" 
                                                        // Ensure coverImageUrl is used here
                                                        src={row.coverImageUrl || row.cover_image_url} 
                                                        sx={{ width: 45, height: 45, borderRadius: 2, bgcolor: '#E2E8F0' }}
                                                    >
                                                        <PictureAsPdfRoundedIcon sx={{ color: THEME_COLORS.slate }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700} color={THEME_COLORS.navy}>
                                                            {row.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: #{row.id} • {row.curriculum || 'General'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>{row.user?.name || 'Unknown'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.subject} 
                                                    size="small" 
                                                    sx={{ bgcolor: '#F0FDFA', color: '#0D9488', fontWeight: 600, borderRadius: 1.5 }} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700} color={THEME_COLORS.navy}>
                                                    KES {row.price}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    <Tooltip title="View Content">
                                                        <IconButton 
                                                            onClick={() => handleViewResource(row)}
                                                            sx={{ color: THEME_COLORS.teal, bgcolor: '#F0FDFA', '&:hover': { bgcolor: '#CCFBF1' } }}
                                                        >
                                                            <VisibilityRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Takedown (Violation)">
                                                        <IconButton 
                                                            onClick={() => setDeleteId(row.id)}
                                                            sx={{ color: THEME_COLORS.danger, bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}
                                                        >
                                                            <DeleteOutlineRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* View Modal */}
            {viewFile && (
                <FileViewerModal 
                    open={!!viewFile} 
                    onClose={() => setViewFile(null)} 
                    fileUrl={viewFile.url} 
                    title={viewFile.title} 
                />
            )}

            {/* Takedown Dialog */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3, width: '400px' } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: THEME_COLORS.danger }}>
                    <WarningAmberRoundedIcon /> Confirm Takedown
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Removing this resource will notify the teacher.
                    </Typography>
                    <TextField 
                        fullWidth placeholder="Reason (e.g. Copyright infringement)" 
                        value={takedownReason} onChange={(e) => setTakedownReason(e.target.value)} size="small"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button onClick={confirmTakedown} variant="contained" color="error" disabled={!takedownReason}>Confirm Removal</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})}>
                <Alert severity={toast.type} variant="filled">{toast.msg}</Alert>
            </Snackbar>
        </AdminLayout>
    );
};

export default AdminResources;
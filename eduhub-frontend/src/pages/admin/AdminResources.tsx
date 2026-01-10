import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    IconButton, CircularProgress, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, Snackbar, Alert, TextField, Tooltip, OutlinedInput, 
    InputAdornment, useTheme, alpha, Select, MenuItem, Stack
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
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const AdminResources: React.FC = () => {
    const theme = useTheme();
    const [resources, setResources] = useState<any[]>([]);
    const [filteredResources, setFilteredResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    // Actions State
    const [viewFile, setViewFile] = useState<{ url: string, title: string } | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [takedownReason, setTakedownReason] = useState('');
    const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

    // Brand Colors (Matching other tables)
    const BRAND_BLUE = '#2563EB';
    const BRAND_ORANGE = '#F97316';

    const fetchResources = async () => {
        setLoading(true);
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
        let result = resources.filter(r => 
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (categoryFilter !== 'All') {
            result = result.filter(r => r.subject === categoryFilter);
        }

        setFilteredResources(result);
    }, [searchTerm, categoryFilter, resources]);

    // Unique subjects for filter dropdown
    const subjects = Array.from(new Set(resources.map(r => r.subject))).sort();

    // --- VIEW HANDLER ---
    const handleViewResource = (row: any) => {
        const path = row.filePath || row.file_path; 

        if (!path) {
            setToast({ open: true, msg: "Error: No file path found for this resource.", type: 'error' });
            return;
        }

        let fullUrl = "";
        if (String(path).startsWith('http')) {
            fullUrl = path;
        } else {
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8081";
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
            
            {/* 1. TOP HEADER */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#111827' }}>Content Moderation</Typography>
                    <Typography variant="body1" color="text.secondary">Manage uploaded resources and ensure quality.</Typography>
                </Box>
            </Box>

            {/* 2. DIGILAB STYLE TOOLBAR */}
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
                    bgcolor: '#fff'
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <OutlinedInput
                        placeholder="Search resources..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startAdornment={<InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>}
                        sx={{ 
                            bgcolor: '#fff', 
                            borderRadius: 1,
                            width: { xs: '100%', sm: 300 },
                            fieldset: { borderColor: '#E5E7EB' }
                        }}
                    />
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        size="small"
                        displayEmpty
                        sx={{ minWidth: 150, bgcolor: '#fff', fieldset: { borderColor: '#E5E7EB' } }}
                    >
                        <MenuItem value="All">Filter: All Subjects</MenuItem>
                        {subjects.map(sub => (
                            <MenuItem key={sub as string} value={sub as string}>{sub as string}</MenuItem>
                        ))}
                    </Select>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={<RefreshIcon />} onClick={fetchResources} sx={{ color: '#6B7280', textTransform: 'none' }}>
                        Refresh
                    </Button>
                    <IconButton size="small" sx={{ border: '1px solid #E5E7EB', borderRadius: 1 }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Paper>

            {/* 3. CLEAN TABLE */}
            <Paper 
                elevation={0} 
                sx={{ 
                    border: '1px solid #E5E7EB',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 12, 
                    borderBottomRightRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}
            >
                {loading ? (
                    <Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress sx={{ color: BRAND_BLUE }} /></Box>
                ) : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                {/* Light Gray Header matching image style */}
                                <TableRow sx={{ bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Resource Details</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Teacher</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Category</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Price</TableCell>
                                    <TableCell align="right" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', py: 2 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredResources.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography variant="body2" color="text.secondary">No resources found matching your search.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredResources.map((row) => (
                                        <TableRow 
                                            key={row.id} 
                                            hover 
                                            sx={{ 
                                                '&:hover': { bgcolor: '#F9FAFB' },
                                                borderBottom: '1px solid #F3F4F6'
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar 
                                                        variant="rounded" 
                                                        src={row.coverImageUrl || row.cover_image_url} 
                                                        sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#F1F5F9' }}
                                                    >
                                                        <PictureAsPdfRoundedIcon sx={{ color: '#94A3B8' }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#111827' }}>
                                                            {row.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: #{row.id} • {row.curriculum || 'General'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500} sx={{ color: '#374151' }}>
                                                    {row.user?.name || 'Unknown'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.subject} 
                                                    size="small" 
                                                    sx={{ 
                                                        bgcolor: alpha(BRAND_BLUE, 0.1), 
                                                        color: BRAND_BLUE, 
                                                        fontWeight: 600, 
                                                        borderRadius: 1,
                                                        fontSize: '0.75rem',
                                                        height: 24
                                                    }} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.price && parseFloat(row.price) > 0 
                                                    ? <Chip label={`KES ${row.price}`} size="small" sx={{ bgcolor: alpha(BRAND_ORANGE, 0.1), color: '#C2410C', fontWeight: 700, borderRadius: 1, height: 24 }} />
                                                    : <Chip label="Free" size="small" sx={{ bgcolor: alpha('#10B981', 0.1), color: '#047857', fontWeight: 700, borderRadius: 1, height: 24 }} />
                                                }
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    <Tooltip title="View Content">
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => handleViewResource(row)}
                                                            sx={{ color: '#6B7280', '&:hover': { color: BRAND_BLUE, bgcolor: alpha(BRAND_BLUE, 0.1) } }}
                                                        >
                                                            <VisibilityRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Takedown (Violation)">
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => setDeleteId(row.id)}
                                                            sx={{ color: '#6B7280', '&:hover': { color: '#EF4444', bgcolor: alpha('#EF4444', 0.1) } }}
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
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB' }}>
                    <Typography variant="caption" color="text.secondary">
                        Displaying {filteredResources.length} results
                    </Typography>
                </Box>
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
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#B91C1C', bgcolor: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
                    <WarningAmberRoundedIcon /> Confirm Takedown
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Removing this resource will make it unavailable to students and notify the teacher.
                    </Typography>
                    <TextField 
                        fullWidth 
                        placeholder="Reason (e.g. Copyright infringement)" 
                        value={takedownReason} 
                        onChange={(e) => setTakedownReason(e.target.value)} 
                        size="small"
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
                    <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
                    <Button onClick={confirmTakedown} variant="contained" color="error" disabled={!takedownReason} sx={{ borderRadius: 2 }}>
                        Confirm Removal
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})}>
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
            </Snackbar>
        </AdminLayout>
    );
};

export default AdminResources;
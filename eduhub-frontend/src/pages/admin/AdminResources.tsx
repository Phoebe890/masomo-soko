import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    IconButton, CircularProgress, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, Snackbar, Alert, TextField, Tooltip, OutlinedInput, 
    InputAdornment, alpha, Select, MenuItem, Grid,Stack
} from '@mui/material';
import { api } from '@/api/axios';
import AdminLayout from './AdminLayout';
import AppNotification from '@/components/AppNotification';
// High-End Icons (Lucide)
import { 
    Search, Trash2, Eye, RefreshCw, Filter, 
    AlertTriangle, FileText, CheckCircle, 
    DollarSign, BookOpen, Layers, MoreHorizontal
} from 'lucide-react';

const BRAND_BLUE = '#2563EB';
const BRAND_ORANGE = '#F97316';
const BORDER_COLOR = '#E2E8F0';
const SHARP_RADIUS = '2px';

const AdminResources: React.FC = () => {
    const [resources, setResources] = useState<any[]>([]);
    const [filteredResources, setFilteredResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    // Actions State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [takedownReason, setTakedownReason] = useState('');
    const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

    // --- LOGIC: FETCH DATA  ---
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

    // --- LOGIC: FILTERING  ---
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

    const subjects = Array.from(new Set(resources.map(r => r.subject))).sort();

    // --- LOGIC: VIEW IN BROWSER ---
    const handleViewInBrowser = (row: any) => {
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
        
        // Opens directly in browser tab
        window.open(fullUrl, '_blank');
    };

    // --- LOGIC: TAKEDOWN  ---
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

    // --- UI: STAT WIDGET ---
    const QuickStat = ({ label, value, icon, color }: any) => (
        <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER_COLOR}`, borderRadius: SHARP_RADIUS, display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box sx={{ p: 1, bgcolor: alpha(color, 0.1), color: color, borderRadius: SHARP_RADIUS, display: 'flex' }}>
                {React.cloneElement(icon, { size: 18 })}
            </Box>
            <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
            </Box>
        </Paper>
    );

    return (
        <AdminLayout title="Content Moderation" selectedRoute="/admin/resources">
            
            {/* 1. COMMAND HEADER */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 3, borderBottom: `1px solid ${BORDER_COLOR}` }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>Content Moderation</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Audit and manage community-uploaded teaching resources.</Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<RefreshCw size={16} />} 
                    onClick={fetchResources}
                    sx={{ borderRadius: SHARP_RADIUS, fontWeight: 700, borderColor: BORDER_COLOR, color: '#0F172A', textTransform: 'none' }}
                >
                    Refresh List
                </Button>
            </Box>

            {/* 2. STATS OVERVIEW */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <QuickStat label="Total Content" value={resources.length} icon={<BookOpen />} color={BRAND_BLUE} />
                <QuickStat label="Active Subjects" value={subjects.length} icon={<Layers />} color="#8B5CF6" />
                <QuickStat label="Paid Resources" value={resources.filter(r => parseFloat(r.price) > 0).length} icon={<DollarSign />} color={BRAND_ORANGE} />
                <QuickStat label="Free Access" value={resources.filter(r => !r.price || parseFloat(r.price) === 0).length} icon={<CheckCircle />} color="#10B981" />
            </Box>

            {/* 3. TOOLBAR */}
            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER_COLOR}`, borderRadius: SHARP_RADIUS, mb: 3, bgcolor: '#FFF' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <OutlinedInput
                            fullWidth
                            placeholder="Search by title, subject, or teacher..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startAdornment={<InputAdornment position="start"><Search size={18} color="#94A3B8" /></InputAdornment>}
                            sx={{ borderRadius: SHARP_RADIUS, bgcolor: '#F8FAFC' }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Select
                            fullWidth
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            size="small"
                            displayEmpty
                            sx={{ borderRadius: SHARP_RADIUS, bgcolor: '#F8FAFC' }}
                        >
                            <MenuItem value="All">All Subjects</MenuItem>
                            {subjects.map(sub => (
                                <MenuItem key={sub as string} value={sub as string}>{sub as string}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                         <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                            SHOWING {filteredResources.length} OF {resources.length} ITEMS
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* 4. CONTENT TABLE */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: SHARP_RADIUS, overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 1000 }}>
                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Resource Details</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Teacher</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Classification</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Price</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                                ))
                            ) : filteredResources.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary', fontWeight: 600 }}>No resources found.</TableCell></TableRow>
                            ) : (
                                filteredResources.map((row) => (
                                    <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar 
                                                    variant="rounded" 
                                                    src={row.coverImageUrl || row.cover_image_url} 
                                                    sx={{ width: 44, height: 44, borderRadius: SHARP_RADIUS, bgcolor: '#F1F5F9', border: `1px solid ${BORDER_COLOR}` }}
                                                >
                                                    <FileText size={20} color="#94A3B8" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{row.title}</Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>ID: #{row.id} • {row.curriculum || 'Standard'}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', fontWeight: 800, bgcolor: BRAND_BLUE }}>{row.user?.name?.[0]}</Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{row.user?.name || 'Instructor'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Chip label={row.subject} size="small" sx={{ bgcolor: alpha(BRAND_BLUE, 0.05), color: BRAND_BLUE, fontWeight: 800, borderRadius: SHARP_RADIUS, fontSize: '0.65rem' }} />
                                                {row.grade && <Chip label={row.grade} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, borderRadius: SHARP_RADIUS, fontSize: '0.65rem' }} />}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {row.price && parseFloat(row.price) > 0 
                                                ? <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>KES {row.price}</Typography>
                                                : <Chip label="FREE" size="small" sx={{ bgcolor: alpha('#10B981', 0.1), color: '#059669', fontWeight: 800, borderRadius: SHARP_RADIUS, fontSize: '0.65rem' }} />
                                            }
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                <Tooltip title="View in Browser">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleViewInBrowser(row)}
                                                        sx={{ color: '#64748B', borderRadius: SHARP_RADIUS, '&:hover': { color: BRAND_BLUE, bgcolor: alpha(BRAND_BLUE, 0.05) } }}
                                                    >
                                                        <Eye size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Takedown">
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => setDeleteId(row.id)}
                                                        sx={{ color: '#64748B', borderRadius: SHARP_RADIUS, '&:hover': { color: '#EF4444', bgcolor: alpha('#EF4444', 0.05) } }}
                                                    >
                                                        <Trash2 size={18} />
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
            </Paper>

            {/* TAKEDOWN DIALOG */}
            <Dialog 
                open={!!deleteId} 
                onClose={() => setDeleteId(null)} 
                PaperProps={{ sx: { borderRadius: SHARP_RADIUS, width: '400px' } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800, color: '#B91C1C' }}>
                    <AlertTriangle size={20} /> Content Takedown
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: '#475569', fontWeight: 500 }}>
                        This resource will be permanently removed from the public marketplace. Please provide a formal reason for this action.
                    </Typography>
                    <TextField 
                        fullWidth 
                        multiline
                        rows={3}
                        placeholder="Violation description (e.g. Copyright infringement, Incorrect data)" 
                        value={takedownReason} 
                        onChange={(e) => setTakedownReason(e.target.value)} 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: SHARP_RADIUS } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                    <Button onClick={() => setDeleteId(null)} sx={{ fontWeight: 700, color: '#64748B', textTransform: 'none' }}>Cancel</Button>
                    <Button 
                        onClick={confirmTakedown} 
                        variant="contained" 
                        color="error" 
                        disabled={!takedownReason} 
                        sx={{ borderRadius: SHARP_RADIUS, fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
                    >
                        Confirm Removal
                    </Button>
                </DialogActions>
            </Dialog>

            {/* CONSISTENT ECITIZEN STYLE NOTIFICATION */}
            <AppNotification 
                open={toast.open}
                message={toast.msg} // Mapping your 'msg' to 'message'
                severity={toast.type} // Mapping your 'type' to 'severity'
                onClose={() => setToast({ ...toast, open: false })}
            />
        </AdminLayout>
    );
};

export default AdminResources;
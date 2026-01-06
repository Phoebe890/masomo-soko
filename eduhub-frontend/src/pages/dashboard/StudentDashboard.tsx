import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Card, 
  CardContent, CardMedia, CardActions, Stack, CircularProgress, Divider, 
  Tooltip, IconButton, alpha, Snackbar, Alert, InputAdornment
} from '@mui/material';
import axios from 'axios';
import StudentLayout from '../../components/StudentLayout';
import ReviewModal from '../../components/ReviewModal';

// Icons
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SaveIcon from '@mui/icons-material/Save';
import SchoolIcon from '@mui/icons-material/School';

const BACKEND_URL = "http://localhost:8081";

// --- INTERFACES ---
interface Resource {
    id: number;
    title: string;
    teacherName: string;
    subject: string;
    grade?: string;
    previewImageUrl?: string;
}

interface DashboardData {
    student: { name: string; email: string; avatar?: string };
    stats: { downloads: number; sessions: number; wishlist: number; totalSpent: number; };
    recentPurchase?: { title: string; teacher: string; id: number } | null;
}

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, color }: any) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            border: '1px solid #E5E7EB', borderRadius: 4,
            transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color }}>{icon}</Box>
            <Chip icon={<ArrowUpwardIcon sx={{ width: 14 }} />} label="Active" size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 700, borderRadius: 1 }} />
        </Box>
        <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
        </Box>
    </Paper>
);

const ContinueLearning = ({ recent, onResume }: any) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 0, borderRadius: 4, mb: 5, overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(120deg, #2563eb 0%, #1d4ed8 100%)', color: 'white',
            boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.4)'
        }}
    >
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
            <Box sx={{ flex: 1 }}>
                <Chip label={recent ? "Jump back in" : "Start fresh"} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, mb: 2, border: '1px solid rgba(255,255,255,0.1)' }} />
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                    {recent ? `Continue: ${recent.title}` : 'Ready to start learning?'}
                </Typography>
                <Button 
                    variant="contained" size="large" onClick={onResume} startIcon={recent ? <PlayArrowIcon /> : <SearchIcon />}
                    sx={{ borderRadius: 3, px: 4, bgcolor: 'white', color: '#2563eb', textTransform: 'none', fontWeight: 800, mt: 2 }}
                >
                    {recent ? 'Resume Learning' : 'Browse Resources'}
                </Button>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <LocalLibraryOutlinedIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
        </Box>
    </Paper>
);

// --- SECTIONS ---

function LibrarySection({ onReview }: { onReview: (res: Resource) => void }) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/purchases`, { withCredentials: true })
            .then(res => {
                const data = res.data.resources || [];
                setResources(data);
                setFilteredResources(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = resources;
        if (searchTerm) {
            result = result.filter(r => 
                r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                r.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedSubject !== 'All') {
            result = result.filter(r => r.subject === selectedSubject);
        }
        setFilteredResources(result);
    }, [searchTerm, selectedSubject, resources]);

    const subjects = ['All', ...Array.from(new Set(resources.map(r => r.subject)))];

    if (loading) return <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box>
            {/* Search Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#fff', border: '1px solid #E5E7EB' }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Find in Library</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth
                            placeholder="Search by title or teacher..." 
                            size="small"
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ 
                                startAdornment: (<SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />), 
                                sx: { borderRadius: 2, bgcolor: '#F9FAFB' } 
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                            {subjects.map((subject) => (
                                <Chip 
                                    key={subject} label={subject} onClick={() => setSelectedSubject(subject)}
                                    sx={{ 
                                        fontWeight: 600, cursor: 'pointer', borderRadius: 2,
                                        bgcolor: selectedSubject === subject ? '#1e293b' : '#F3F4F6',
                                        color: selectedSubject === subject ? 'white' : '#4B5563',
                                        '&:hover': { bgcolor: selectedSubject === subject ? '#374151' : '#E5E7EB' }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Empty State */}
            {filteredResources.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.7 }}>
                    <LocalLibraryOutlinedIcon sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No resources found.</Typography>
                    {resources.length === 0 && <Button sx={{ mt: 2 }} variant="outlined">Browse Marketplace</Button>}
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredResources.map((res) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={res.id}>
                            <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #E5E7EB', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }, transition: 'all 0.2s' }}>
                                <Box sx={{ height: 140, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                    {res.previewImageUrl ? 
                                        <CardMedia component="img" image={res.previewImageUrl} sx={{ height: '100%', objectFit: 'cover' }} /> : 
                                        <Typography variant="h3" fontWeight={800} sx={{ opacity: 0.1, color: '#374151' }}>{res.subject[0]}</Typography>
                                    }
                                    <Chip label="PDF" size="small" sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{res.subject}</Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ my: 0.5, fontSize: '1rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 42 }}>{res.title}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <SchoolIcon sx={{ fontSize: 14 }} /> {res.teacherName}
                                    </Typography>
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ p: 2, gap: 1 }}>
                                    <Button 
                                        variant="contained" fullWidth href={`${BACKEND_URL}/api/student/download/${res.id}`} 
                                        startIcon={<CloudDownloadOutlinedIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#2563EB' }}
                                    >
                                        Download
                                    </Button>
                                    <Tooltip title="Leave Review">
                                        <IconButton onClick={() => onReview(res)} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                                            <RateReviewOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

// --- HISTORY SECTION (THIS WAS MISSING BEFORE) ---
function HistorySection() {
    const [orders, setOrders] = useState<any[]>([]);
    
    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/order-history`, { withCredentials: true })
            .then(res => setOrders(res.data.orders || []))
            .catch(err => console.error(err));
    }, []);

    return (
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Resource</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No purchase history found.</TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{order.resource?.title}</TableCell>
                                    <TableCell>KES {order.price || 0}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            icon={<CheckCircleIcon style={{ fontSize: 16 }}/>} 
                                            label="Paid" 
                                            size="small" 
                                            color="success" 
                                            sx={{ borderRadius: 1, fontWeight: 700 }} 
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

// --- ACCOUNT SETTINGS SECTION ---
function AccountSettingsSection() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{open: boolean, msg: string, type: 'success'|'error'}>({ open: false, msg: '', type: 'success' });

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/account-settings`, { withCredentials: true })
            .then(res => { 
                setName(res.data.name || ''); 
                setEmail(res.data.email || ''); 
            })
            .catch(err => console.error("Failed to load settings", err));
    }, []);

    const handleSave = () => {
        setSaving(true);
        // Ensure backend expects form-data or JSON properly. 
        // Using URLSearchParams as it worked for you previously.
        const params = new URLSearchParams();
        params.append('name', name);
        
        axios.post(`${BACKEND_URL}/api/student/account-settings`, params, { withCredentials: true })
            .then(() => setToast({ open: true, msg: 'Profile updated successfully!', type: 'success' }))
            .catch(() => setToast({ open: true, msg: 'Failed to save changes.', type: 'error' }))
            .finally(() => setSaving(false));
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, maxWidth: 600, border: '1px solid #E5E7EB' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Edit Profile</Typography>
            <Stack spacing={3}>
                <TextField 
                    label="Full Name" value={name} onChange={e => setName(e.target.value)} fullWidth 
                    variant="outlined" 
                />
                <TextField 
                    label="Email Address" value={email} disabled fullWidth 
                    helperText="Contact support to change email."
                />
                <Button 
                    variant="contained" 
                    onClick={handleSave} 
                    disabled={saving} 
                    size="large" 
                    startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                    sx={{ alignSelf: 'flex-start', borderRadius: 2, fontWeight: 700, px: 4 }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Stack>
            
            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={() => setToast({...toast, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
            </Snackbar>
        </Paper>
    );
}

// --- MAIN DASHBOARD ---
const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewResource, setSelectedReviewResource] = useState<{id: number, title: string} | null>(null);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/dashboard`, { withCredentials: true })
            .then(res => setData(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleOpenReview = (res: Resource) => {
        setSelectedReviewResource({ id: res.id, title: res.title });
        setReviewModalOpen(true);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    return (
        <StudentLayout 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            userAvatar={data?.student.avatar} 
            userName={data?.student.name}
        >
            {activeTab === 'overview' && data && (
                <>
                    <ContinueLearning recent={data.recentPurchase} onResume={() => setActiveTab('library')} />
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Resources Owned" value={data.stats.downloads} icon={<LocalLibraryOutlinedIcon fontSize="large" />} color="#3b82f6" /></Grid>
                        <Grid item xs={12} sm={6} md={4}><StatCard title="Active Sessions" value={data.stats.sessions} icon={<CalendarTodayOutlinedIcon fontSize="large" />} color="#8b5cf6" /></Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatCard title="Total Spent" value={data.stats.totalSpent ? `KES ${data.stats.totalSpent.toLocaleString()}` : 'KES 0'} icon={<ReceiptLongOutlinedIcon fontSize="large" />} color="#10b981" />
                        </Grid>
                    </Grid>
                    <Typography variant="h5" fontWeight={800} color="#1e293b" sx={{ mb: 3 }}>Recent Resources</Typography>
                    <LibrarySection onReview={handleOpenReview} />
                </>
            )}
            {activeTab === 'library' && <LibrarySection onReview={handleOpenReview} />}
            {activeTab === 'history' && <HistorySection />}
            {activeTab === 'settings' && <AccountSettingsSection />}

            <ReviewModal 
                open={reviewModalOpen} 
                onClose={() => setReviewModalOpen(false)} 
                resourceId={selectedReviewResource?.id || null} 
                resourceTitle={selectedReviewResource?.title || ''}
                onSuccess={() => alert("Thanks for your review!")}
            />
        </StudentLayout>
    );
};

export default StudentDashboard;
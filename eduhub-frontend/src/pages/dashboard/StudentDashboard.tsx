import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Card, 
  CardContent, CardMedia, CardActions, Stack, CircularProgress, 
  IconButton, alpha, Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios'; 
import StudentLayout from '../../components/StudentLayout';
import ReviewModal from '../../components/ReviewModal';

// Icons
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SaveIcon from '@mui/icons-material/Save';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const BACKEND_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081";

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

// --- EMPTY STATE COMPONENT ---
const EmptyState = ({ title, description, buttonText, onButtonClick, icon }: any) => (
    <Box sx={{ 
        textAlign: 'center', py: 8, px: 2, 
        bgcolor: '#F9FAFB', borderRadius: 4, 
        border: '1px dashed #E5E7EB',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
        <Box sx={{ p: 2, bgcolor: '#EFF6FF', color: '#3B82F6', borderRadius: '50%', mb: 2 }}>
            {icon}
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#111827' }}>
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
            {description}
        </Typography>
        {buttonText && (
            <Button 
                variant="contained" 
                onClick={onButtonClick}
                sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
            >
                {buttonText}
            </Button>
        )}
    </Box>
);

const StatCard = ({ title, value, icon, color }: any) => (
    <Paper elevation={0} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #E5E7EB', borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color }}>{icon}</Box>
            <Chip icon={<ArrowUpwardIcon sx={{ width: 14 }} />} label="Active" size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 700, borderRadius: 1 }} />
        </Box>
        <Box><Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>{value}</Typography><Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography></Box>
    </Paper>
);

const ContinueLearning = ({ recent, onAction }: any) => (
    <Paper elevation={0} sx={{ p: 0, borderRadius: 4, mb: 5, overflow: 'hidden', position: 'relative', background: 'linear-gradient(120deg, #2563eb 0%, #1d4ed8 100%)', color: 'white' }}>
        <Box sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
                <Chip label={recent ? "Jump back in" : "Start fresh"} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2 }} />
                <Typography variant="h4" fontWeight={800}>{recent ? `Continue: ${recent.title}` : 'Ready to start learning?'}</Typography>
                <Button variant="contained" onClick={onAction} sx={{ mt: 2, bgcolor: 'white', color: '#2563eb', fontWeight: 800 }}>{recent ? 'Resume Learning' : 'Browse Resources'}</Button>
            </Box>
        </Box>
    </Paper>
);

function LibrarySection({ onReview }: { onReview: (res: Resource) => void }) {
    const navigate = useNavigate();
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');

    useEffect(() => {
        api.get('/api/student/purchases')
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
        if (searchTerm) result = result.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
        if (selectedSubject !== 'All') result = result.filter(r => r.subject === selectedSubject);
        setFilteredResources(result);
    }, [searchTerm, selectedSubject, resources]);

    if (loading) return <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    if (resources.length === 0) {
        return (
            <EmptyState 
                title="Your library is empty" 
                description="You haven't purchased any resources yet. Browse our collection to find exams, notes, and schemes of work."
                buttonText="Browse Resources"
                // FIXED: Changed from /resources to /browse to match App.js
                onButtonClick={() => navigate('/browse')} 
                icon={<MenuBookIcon fontSize="large" />}
            />
        );
    }

    return (
        <Box>
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #E5E7EB' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}><TextField fullWidth placeholder="Search..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />), sx: { borderRadius: 2 } }}/></Grid>
                </Grid>
            </Paper>
            
            {filteredResources.length === 0 && resources.length > 0 ? (
                 <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>No matching resources found.</Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredResources.map((res) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={res.id}>
                            <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid #E5E7EB' }}>
                                <Box sx={{ height: 140, bgcolor: '#F3F4F6' }}>
                                    {res.previewImageUrl && <CardMedia component="img" image={res.previewImageUrl} sx={{ height: '100%', objectFit: 'cover' }} />}
                                </Box>
                                <CardContent><Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', height: 42, overflow: 'hidden' }}>{res.title}</Typography></CardContent>
                                <CardActions sx={{ p: 2, gap: 1 }}>
                                    <Button 
                                        variant="contained" fullWidth 
                                        href={`${BACKEND_API_BASE}/api/student/download/${res.id}`} 
                                        startIcon={<CloudDownloadOutlinedIcon />} 
                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                    >
                                        Download
                                    </Button>
                                    <IconButton onClick={() => onReview(res)} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}><RateReviewOutlinedIcon fontSize="small" /></IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

function HistorySection() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/order-history')
            .then(res => setOrders(res.data.orders || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    if (orders.length === 0) {
        return (
            <EmptyState 
                title="No purchase history" 
                description="You haven't made any purchases yet. Once you buy a resource, your receipt will appear here."
                buttonText="Start Shopping"
                // FIXED: Changed from /resources to /browse to match App.js
                onButtonClick={() => navigate('/browse')}
                icon={<ReceiptLongOutlinedIcon fontSize="large" />}
            />
        );
    }

    return (
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 4 }}>
            <TableContainer><Table><TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Resource</TableCell><TableCell sx={{ fontWeight: 700 }}>Price</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.id}><TableCell>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell><TableCell sx={{ fontWeight: 600 }}>{order.resource?.title}</TableCell><TableCell>KES {order.price}</TableCell><TableCell><Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }}/></TableCell></TableRow>
                    ))}
                </TableBody>
            </Table></TableContainer>
        </Paper>
    );
}

function AccountSettingsSection() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{open: boolean, msg: string, type: 'success'|'error'}>({ open: false, msg: '', type: 'success' });

    useEffect(() => {
        api.get('/api/student/account-settings').then(res => { setName(res.data.name || ''); setEmail(res.data.email || ''); });
    }, []);

    const handleSave = () => {
        setSaving(true);
        const params = new URLSearchParams();
        params.append('name', name);
        api.post('/api/student/account-settings', params)
            .then(() => setToast({ open: true, msg: 'Profile updated!', type: 'success' }))
            .catch(() => setToast({ open: true, msg: 'Error saving profile', type: 'error' }))
            .finally(() => setSaving(false));
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, maxWidth: 600, border: '1px solid #E5E7EB' }}>
            <Stack spacing={3}><TextField label="Full Name" value={name} onChange={e => setName(e.target.value)} fullWidth /><TextField label="Email" value={email} disabled fullWidth /><Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} sx={{ fontWeight: 700 }}>Save Changes</Button></Stack>
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})}><Alert severity={toast.type} variant="filled">{toast.msg}</Alert></Snackbar>
        </Paper>
    );
}

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewResource, setSelectedReviewResource] = useState<{id: number, title: string} | null>(null);

    useEffect(() => {
        api.get('/api/student/dashboard')
            .then(res => setData(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleOpenReview = (res: Resource) => {
        setSelectedReviewResource({ id: res.id, title: res.title });
        setReviewModalOpen(true);
    };

    const handleContinueLearningAction = () => {
        if (data?.recentPurchase) {
            setActiveTab('library'); 
        } else {
            // FIXED: Changed from /resources to /browse to match App.js
            navigate('/browse'); 
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    return (
        <StudentLayout activeTab={activeTab} onTabChange={setActiveTab} userAvatar={data?.student.avatar} userName={data?.student.name}>
            {activeTab === 'overview' && data && (
                <>
                <ContinueLearning recent={data.recentPurchase} onAction={handleContinueLearningAction} />
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid item xs={12} sm={6} md={4}><StatCard title="Resources Owned" value={data.stats.downloads} icon={<LocalLibraryOutlinedIcon fontSize="large" />} color="#3b82f6" /></Grid>
                    <Grid item xs={12} sm={6} md={4}><StatCard title="Active Sessions" value={data.stats.sessions} icon={<CalendarTodayOutlinedIcon fontSize="large" />} color="#8b5cf6" /></Grid>
                    <Grid item xs={12} sm={6} md={4}><StatCard title="Total Spent" value={`KES ${data.stats.totalSpent || 0}`} icon={<ReceiptLongOutlinedIcon fontSize="large" />} color="#10b981" /></Grid>
                </Grid>
                <LibrarySection onReview={handleOpenReview} />
                </>
            )}
            {activeTab === 'library' && <LibrarySection onReview={handleOpenReview} />}
            {activeTab === 'history' && <HistorySection />}
            {activeTab === 'settings' && <AccountSettingsSection />}
            <ReviewModal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} resourceId={selectedReviewResource?.id || null} resourceTitle={selectedReviewResource?.title || ''} onSuccess={() => setReviewModalOpen(false)} />
        </StudentLayout>
    );
};

export default StudentDashboard;
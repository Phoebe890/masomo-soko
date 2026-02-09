import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, Grid, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Card, 
    CardContent, CardMedia, CardActions, Stack, CircularProgress, 
    IconButton, alpha, Snackbar, Alert, Avatar, Divider, createTheme, ThemeProvider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios'; 
import StudentLayout from '../../components/StudentLayout';
import ReviewModal from '../../components/ReviewModal';

// High-End Icons (Lucide)
import { 
    BookOpen, Download, History, Settings, Search, Star, 
    PlayCircle, CheckCircle, Wallet, Rocket, ArrowRight, ExternalLink, X
} from 'lucide-react';

// --- THEME & CONSTANTS ---
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
const BRAND_BLUE = '#2563EB'; 
const BRAND_ORANGE = '#F97316'; 
const BORDER_COLOR = '#E2E8F0';

const dashboardTheme = createTheme({
    typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    components: {
        MuiTypography: { styleOverrides: { root: { fontFamily: "'Plus Jakarta Sans', sans-serif !important" } } },
        MuiButton: { styleOverrides: { root: { borderRadius: '2px', textTransform: 'none', fontWeight: 700 } } },
    },
});

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

// --- SHARED PREMIUM COMPONENTS ---

const StatWidget = ({ title, value, icon, color }: any) => (
    <Paper
        elevation={0}
        sx={{
            p: 3, height: '100%', borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`,
            bgcolor: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { 
                borderColor: color, 
                boxShadow: `0 0 0 4px ${alpha(color, 0.05)}`,
                transform: 'translateY(-2px)' 
            }
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ p: 1, bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>
                {React.cloneElement(icon, { size: 20 })}
            </Box>
        </Box>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.03em' }}>
                {value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                {title.toUpperCase()}
            </Typography>
        </Box>
    </Paper>
);

const EmptyState = ({ title, description, buttonText, onButtonClick, icon }: any) => (
    <Box sx={{ 
        textAlign: 'center', py: 8, px: 2, bgcolor: '#F8FAFC', 
        borderRadius: '2px', border: `1px dashed ${BORDER_COLOR}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
        <Box sx={{ p: 2, bgcolor: alpha(BRAND_BLUE, 0.05), color: BRAND_BLUE, borderRadius: '2px', mb: 2 }}>
            {React.cloneElement(icon, { size: 40 })}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0F172A' }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mb: 3, fontWeight: 500 }}>
            {description}
        </Typography>
        {buttonText && (
            <Button variant="contained" onClick={onButtonClick} sx={{ bgcolor: '#0F172A', px: 4 }}>
                {buttonText}
            </Button>
        )}
    </Box>
);

// --- SECTIONS ---

function LibrarySection({ onReview }: { onReview: (res: Resource) => void }) {
    const navigate = useNavigate();
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const handleDownload = async (resourceId: number, title: string, openInNewTab: boolean = false) => {
        try {
            setDownloadingId(resourceId);
            const response = await api.get(`/api/student/download/${resourceId}`, { responseType: 'blob' });
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(file);

            if (openInNewTab) { window.open(fileURL, '_blank'); } 
            else {
                const link = document.createElement('a');
                link.href = fileURL;
                link.setAttribute('download', `${title}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setDownloadingId(null);
        }
    };

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
        setFilteredResources(result);
    }, [searchTerm, resources]);

    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress size={30} sx={{ color: BRAND_BLUE }} /></Box>;

    if (resources.length === 0) {
        return (
            <EmptyState 
                title="Your library is empty" 
                description="Explore premium resources, notes, and exams curated by top teachers."
                buttonText="Browse Resources"
                onButtonClick={() => navigate('/browse')} 
                icon={<BookOpen />}
            />
        );
    }

    return (
        <Box>
            <Paper elevation={0} sx={{ p: 1.5, mb: 4, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC' }}>
                <Search size={18} style={{ marginLeft: 8, marginRight: 12, color: '#64748B' }} />
                <TextField 
                    fullWidth placeholder="Search your library..." variant="standard"
                    InputProps={{ disableUnderline: true, style: { fontWeight: 600, fontSize: '0.9rem' } }}
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </Paper>
            
            <Grid container spacing={3}>
                {filteredResources.map((res) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={res.id}>
                        <Card elevation={0} sx={{ height: '100%', borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, transition: 'all 0.2s', '&:hover': { borderColor: BRAND_BLUE, transform: 'translateY(-2px)' } }}>
                            <Box sx={{ height: 140, bgcolor: '#F1F5F9', position: 'relative' }}>
                                {res.previewImageUrl ? (
                                    <CardMedia component="img" image={res.previewImageUrl} sx={{ height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={40} color={alpha(BRAND_BLUE, 0.2)} />
                                    </Box>
                                )}
                                <Chip label={res.subject} sx={{ position: 'absolute', top: 10, left: 10, borderRadius: '2px', bgcolor: 'white', fontWeight: 800, fontSize: '0.65rem', border: `1px solid ${BORDER_COLOR}` }} />
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', mb: 0.5, lineHeight: 1.3, height: 40, overflow: 'hidden' }}>{res.title}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {res.teacherName || 'Instructor'}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                                <Button 
                                    fullWidth variant="contained" size="small"
                                    onClick={() => handleDownload(res.id, res.title, true)}
                                    sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
                                >
                                    Open
                                </Button>
                                <IconButton 
                                    onClick={() => onReview(res)} 
                                    sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', color: BRAND_ORANGE }}
                                >
                                    <Star size={18} />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

function HistorySection() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/student/order-history').then(res => setOrders(res.data.orders || [])).finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress size={30}/></Box>;

    return (
        <Paper elevation={0} sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'text.secondary' }}>DATE</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'text.secondary' }}>RESOURCE</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'text.secondary' }}>PRICE</TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: 'text.secondary' }}>STATUS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell sx={{ fontWeight: 600 }}>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ fontWeight: 800 }}>{order.resource?.title}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>KES {order.price}</TableCell>
                                <TableCell><Chip label="Paid" size="small" sx={{ borderRadius: '2px', fontWeight: 800, bgcolor: alpha('#10B981', 0.1), color: '#059669' }}/></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

function AccountSettingsSection() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicPath, setProfilePicPath] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        api.get('/api/student/account-settings').then(res => {
            setName(res.data.name || '');
            setEmail(res.data.email || '');
            setProfilePicPath(res.data.profilePicPath || ''); 
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const uploadData = new FormData();
            uploadData.append('name', name);
            if (selectedFile) uploadData.append('profilePic', selectedFile);
            await api.post('/api/student/account-settings', uploadData);
            setToast({ open: true, msg: 'Profile updated successfully!', severity: 'success' });
        } catch (error) {
            setToast({ open: true, msg: 'Failed to update profile.', severity: 'error' });
        } finally { setSaving(false); }
    };

    if (loading) return <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, maxWidth: 800 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar src={previewUrl || (profilePicPath?.startsWith('http') ? profilePicPath : `${import.meta.env.VITE_API_URL}/${profilePicPath}`)} sx={{ width: 80, height: 80, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}` }} />
                <Box>
                    <Typography sx={{ fontWeight: 800 }}>Profile Picture</Typography>
                    <input accept="image/*" style={{ display: 'none' }} id="pic-up" type="file" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                    }} />
                    <label htmlFor="pic-up">
                        <Button variant="outlined" component="span" size="small" sx={{ mt: 1, borderColor: BORDER_COLOR, color: '#0F172A' }}>Change Photo</Button>
                    </label>
                </Box>
            </Box>
            <Divider sx={{ mb: 4 }} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}><TextField fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} /></Grid>
                <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={email} disabled /></Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 4, bgcolor: '#0F172A', px: 4 }} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: '2px' }}>{toast.msg}</Alert>
            </Snackbar>
        </Paper>
    );
}

// --- MAIN DASHBOARD ---

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewResource, setSelectedReviewResource] = useState<{id: number, title: string} | null>(null);

    useEffect(() => {
        api.get('/api/student/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
    }, []);

    const handleOpenReview = (res: Resource) => {
        setSelectedReviewResource({ id: res.id, title: res.title });
        setReviewModalOpen(true);
    };

    if (loading) return (
        <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
             <Box sx={{ p: 1 }}><CircularProgress sx={{ color: BRAND_BLUE }} /></Box>
        </StudentLayout>
    );

    return (
       <ThemeProvider theme={dashboardTheme}>
            <link rel="stylesheet" href={FONT_LINK} />
            <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
                <Box sx={{ animation: 'fadeIn 0.5s ease-out', "@keyframes fadeIn": { "0%": { opacity: 0, transform: 'translateY(10px)' }, "100%": { opacity: 1, transform: 'translateY(0)' } } }}>
                    
                    {/* Header Section */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 3, borderBottom: `1px solid ${BORDER_COLOR}` }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>
                                Student Dashboard
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Welcome back, {data?.student.name}
                            </Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            startIcon={<Search size={16} />} 
                            onClick={() => navigate('/browse')}
                            sx={{ bgcolor: '#0F172A', boxShadow: 'none' }}
                        >
                            Find Resources
                        </Button>
                    </Box>

                    {activeTab === 'overview' && data && (
                        <>
                            {/* Stats */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <StatWidget title="My Resources" value={data.stats.downloads} icon={<BookOpen />} color={BRAND_BLUE} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <StatWidget title="Learning Sessions" value={data.stats.sessions} icon={<PlayCircle />} color={BRAND_ORANGE} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <StatWidget title="Total Invested" value={`KES ${data.stats.totalSpent || 0}`} icon={<Wallet />} color="#10B981" />
                                </Grid>
                            </Grid>

                            {/* Jump Back In Section */}
                            {data.recentPurchase && (
                                <Paper elevation={0} sx={{ p: 3, mb: 4, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(BRAND_ORANGE, 0.02) }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Box sx={{ p: 1.5, bgcolor: alpha(BRAND_ORANGE, 0.1), color: BRAND_ORANGE, display: 'flex' }}><Rocket size={24} /></Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: BRAND_ORANGE, textTransform: 'uppercase' }}>Ready to continue?</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{data.recentPurchase.title}</Typography>
                                        </Box>
                                    </Box>
                                    <Button variant="outlined" endIcon={<ArrowRight size={16} />} onClick={() => setActiveTab('library')} sx={{ borderColor: BORDER_COLOR, color: '#0F172A' }}>
                                        Resume Learning
                                    </Button>
                                </Paper>
                            )}

                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Recent Content</Typography>
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
                        onSuccess={() => setReviewModalOpen(false)} 
                    />
                </Box>
            </StudentLayout>
       </ThemeProvider>
    );
};

export default StudentDashboard;
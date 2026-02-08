import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Card, 
  CardContent, CardMedia, CardActions, Stack, CircularProgress, 
  IconButton, alpha, Snackbar, Alert, Avatar,Divider
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
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VerifiedIcon from '@mui/icons-material/Verified';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'; // New Icon

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

// Brand Colors
const BRAND_BLUE = '#2563EB'; 
const BRAND_ORANGE = '#F97316'; 

// --- EMPTY STATE COMPONENT ---
const EmptyState = ({ title, description, buttonText, onButtonClick, icon }: any) => (
    <Box sx={{ 
        textAlign: 'center', py: 8, px: 2, 
        bgcolor: '#F9FAFB', borderRadius: 4, 
        border: '1px dashed #E5E7EB',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
        <Box sx={{ p: 3, bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, borderRadius: '50%', mb: 2 }}>
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
                sx={{ 
                    fontWeight: 700, 
                    borderRadius: 2, 
                    textTransform: 'none',
                    bgcolor: BRAND_ORANGE,
                    '&:hover': { bgcolor: '#EA580C' }
                }}
            >
                {buttonText}
            </Button>
        )}
    </Box>
);

// --- VIBRANT STAT CARD (Responsive Text for Mobile) ---
const StatCard = ({ title, value, icon, gradient }: any) => (
    <Paper 
        elevation={3} 
        sx={{ 
            p: { xs: 2, md: 3 }, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            borderRadius: 4,
            background: gradient, // Full Color Gradient
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s', 
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }
        }}
    >
        {/* Background Decoration */}
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, zIndex: 1 }}>
            <Box sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {React.cloneElement(icon, { fontSize: 'small', style: { color: 'white' } })}
            </Box>
        </Box>
        <Box sx={{ zIndex: 1 }}>
            {/* Responsive Font Size: Smaller on mobile to fit 2 per row */}
            <Typography 
                fontWeight={800} 
                sx={{ 
                    fontSize: { xs: '1.2rem', md: '2rem' }, 
                    lineHeight: 1.2,
                    mb: 0.5
                }}
            >
                {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                {title}
            </Typography>
        </Box>
    </Paper>
);

// --- ORANGE THEMED BANNER (No Blue) ---
const JumpBackIn = ({ recent, onAction }: any) => {
    // EMPTY STATE BANNER
    if (!recent) return (
        <Paper elevation={0} sx={{ 
            p: 3, borderRadius: 4, 
            bgcolor: '#FFF7ED', // Light Orange Background
            border: '1px solid #FFEDD5', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 
        }}>
            <Box>
                <Typography variant="h6" fontWeight={700} color="#9A3412">Ready to learn?</Typography>
                <Typography variant="body2" color="#C2410C">Explore notes, exams, and guides today.</Typography>
            </Box>
            <Button 
                onClick={onAction} 
                variant="contained" 
               // startIcon={<RocketLaunchIcon />} 
                sx={{ 
                    bgcolor: BRAND_ORANGE, 
                    fontWeight: 700, 
                    borderRadius: 50, 
                    textTransform: 'none',
                    px: 3,
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                    '&:hover': { bgcolor: '#EA580C' }
                }}
            >
                Start Exploring
            </Button>
        </Paper>
    );

    // RESUME LEARNING BANNER
    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 3, 
                borderRadius: 4, 
                border: `1px solid ${alpha(BRAND_ORANGE, 0.2)}`,
                background: `linear-gradient(to right, #FFF7ED, #fff)`,
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between', 
                gap: 2
            }}
        >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ 
                    width: 50, height: 50, borderRadius: 3, bgcolor: alpha(BRAND_ORANGE, 0.1), color: BRAND_ORANGE,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <PlayArrowIcon />
                </Box>
                <Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color: BRAND_ORANGE, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        In Progress
                    </Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, color: '#111827' }}>
                        {recent.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        By {recent.teacher}
                    </Typography>
                </Box>
            </Box>
            <Button 
                variant="contained" 
                onClick={onAction} 
                sx={{ 
                    bgcolor: BRAND_ORANGE, // Changed to Orange
                    color: 'white', 
                    borderRadius: 50, 
                    px: 4, 
                    fontWeight: 700,
                    textTransform: 'none',
                    alignSelf: { xs: 'stretch', sm: 'center' },
                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                    '&:hover': { bgcolor: '#EA580C' }
                }}
            >
                Resume
            </Button>
        </Paper>
    );
};

function LibrarySection({ onReview }: { onReview: (res: Resource) => void }) {
    const navigate = useNavigate();
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');
const [downloadingId, setDownloadingId] = useState<number | null>(null);

const handleDownload = async (resourceId: number, title: string, openInNewTab: boolean = false) => {
    try {
        setDownloadingId(resourceId);
        // This uses your 'api' instance which HAS the token
        const response = await api.get(`/api/student/download/${resourceId}`, {
            responseType: 'blob', // Important for files
        });

        const file = new Blob([response.data], { type: response.headers['content-type'] });
        const fileURL = URL.createObjectURL(file);

        if (openInNewTab) {
            window.open(fileURL, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', `${title}.pdf`); 
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    } catch (error) {
        console.error("Download failed", error);
        alert("Access Denied or File not found.");
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
                onButtonClick={() => navigate('/browse')} 
                icon={<MenuBookIcon fontSize="large" />}
            />
        );
    }

    return (
        <Box>
            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ color: '#94a3b8', mr: 2, ml: 1 }} />
                <TextField 
                    fullWidth 
                    placeholder="Search your library..." 
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </Paper>
            
            {filteredResources.length === 0 && resources.length > 0 ? (
                 <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>No matching resources found.</Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredResources.map((res) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={res.id}>
                            <Card 
                                elevation={0} 
                                sx={{ 
                                    height: '100%', borderRadius: 3, 
                                    border: '1px solid #E5E7EB',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', borderColor: BRAND_BLUE }
                                }}
                            >
                                <Box sx={{ height: 160, bgcolor: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                                    {res.previewImageUrl ? (
                                        <CardMedia component="img" image={res.previewImageUrl} sx={{ height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(BRAND_BLUE, 0.05) }}>
                                            <MenuBookIcon sx={{ fontSize: 50, color: alpha(BRAND_BLUE, 0.2) }} />
                                        </Box>
                                    )}
                                    <Chip label={res.subject} size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 700 }} />
                                </Box>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', height: 42, overflow: 'hidden', mb: 1 }}>{res.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <VerifiedIcon sx={{ fontSize: 14, color: BRAND_BLUE, mr: 0.5 }} /> {res.teacherName || 'Instructor'}
                                    </Typography>
                                </CardContent>
                               <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
    {/* NEW: READ ONLINE BUTTON */}
    <Button 
        variant="outlined" 
        fullWidth
        startIcon={<PlayArrowIcon />}
        onClick={() => handleDownload(res.id, res.title, true)}
        disabled={downloadingId === res.id}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: BRAND_BLUE, color: BRAND_BLUE }}
    >
        Read Online
    </Button>

    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
        {/* UPDATED: DOWNLOAD BUTTON (No more href) */}
        <Button 
            variant="contained" 
            fullWidth 
            onClick={() => handleDownload(res.id, res.title, false)}
            disabled={downloadingId === res.id}
           startIcon={downloadingId === res.id ? <CircularProgress size={20} color="inherit"/> : <CloudDownloadOutlinedIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, bgcolor: BRAND_BLUE, textTransform: 'none' }}
        >
            {downloadingId === res.id ? "Loading..." : "Download"}
        </Button>
        
        <IconButton 
            onClick={() => onReview(res)} 
            sx={{ border: '1px solid #E5E7EB', borderRadius: 2, color: BRAND_ORANGE }}
        >
            <RateReviewOutlinedIcon fontSize="small" />
        </IconButton>
    </Stack>
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
                onButtonClick={() => navigate('/browse')}
                icon={<ReceiptLongOutlinedIcon fontSize="large" />}
            />
        );
    }

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
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#111827' }}>{order.resource?.title}</TableCell>
                                <TableCell>KES {order.price}</TableCell>
                                <TableCell>
                                    <Chip label="Paid" size="small" sx={{ bgcolor: alpha('#10B981', 0.1), color: '#059669', fontWeight: 700 }}/>
                                </TableCell>
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
    
    // Identity State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicPath, setProfilePicPath] = useState('');
    
    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

   useEffect(() => {
    api.get('/api/student/account-settings').then(res => {
        setName(res.data.name || '');
        setEmail(res.data.email || '');
        // Ensure this matches the key from the backend exactly
        setProfilePicPath(res.data.profilePicPath || ''); 
        setLoading(false);
    });
}, []);

    // Helper to determine which image to show in the Avatar
    const getAvatarSrc = () => {
        if (previewUrl) return previewUrl; // Show local preview first
        if (!profilePicPath) return undefined; // Show initials if no pic
        // If it's a full Cloudinary URL, use it; otherwise, prefix with backend URL
        return profilePicPath.startsWith('http') ? profilePicPath : `${BACKEND_URL}/${profilePicPath}`;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const uploadData = new FormData();
            uploadData.append('name', name);
            if (selectedFile) {
                uploadData.append('profilePic', selectedFile);
            }

            const response = await api.post('/api/student/account-settings', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.profilePicPath) {
                setProfilePicPath(response.data.profilePicPath);
                setPreviewUrl('');
                setSelectedFile(null);
            }

            setToast({ open: true, msg: 'Profile updated successfully!', severity: 'success' });
        } catch (error) {
            setToast({ open: true, msg: 'Failed to update profile.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #E5E7EB', maxWidth: 700 }}>
            
            {/* 1. PROFILE PICTURE SECTION (Teacher Style) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar 
                    src={getAvatarSrc()} 
                    sx={{ width: 100, height: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: '#f1f5f9' }} 
                />
                <Box>
                    <Typography variant="h6" fontWeight={700}>Profile Picture</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {previewUrl ? "Unsaved changes" : "PNG or JPG (max. 2MB)"}
                    </Typography>
                    
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="student-pic-upload"
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setSelectedFile(file);
                                setPreviewUrl(URL.createObjectURL(file));
                            }
                        }}
                    />
                    <label htmlFor="student-pic-upload">
                        <Button variant="outlined" component="span" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                            Change Photo
                        </Button>
                    </label>
                    
                    {previewUrl && (
                        <Button 
                            variant="text" color="error" size="small" sx={{ ml: 1, textTransform: 'none' }}
                            onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                        >
                            Cancel
                        </Button>
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* 2. FORM SECTION */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField 
                        fullWidth label="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        helperText="This is how teachers will see your name on reviews"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField 
                        fullWidth label="Email Address" 
                        value={email} 
                        disabled 
                        helperText="Your email is your login ID and cannot be changed"
                    />
                </Grid>
            </Grid>

            {/* 3. SAVE BUTTON (Vibrant Green like Teacher Settings) */}
            <Box sx={{ mt: 4 }}>
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleSave} 
                    disabled={saving}
                    //startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                    sx={{ 
                        fontWeight: 700, 
                        borderRadius: 2,
                        px: 4,
                        bgcolor: '#43B02A', 
                        '&:hover': { bgcolor: '#388E3C' },
                        '&.Mui-disabled': { bgcolor: '#A5D6A7', color: 'white' }
                    }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})}>
                <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
            </Snackbar>
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
            navigate('/browse'); 
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    return (
       <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
            
            {activeTab === 'overview' && data && (
                <>
                {/* Modern Header Section */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 1 }}>
                            Hello, <span style={{ color: BRAND_BLUE }}>{data.student.name.split(' ')[0]}</span> 
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Ready to learn something new today?
                        </Typography>
                    </Box>
                </Box>

                {/* Orange Themed "Jump Back In" Banner */}
                <Box sx={{ mb: 4 }}>
                    <JumpBackIn recent={data.recentPurchase} onAction={handleContinueLearningAction} />
                </Box>
                
                {/* Vibrant Stats Row - 2 per row on Mobile */}
                <Grid container spacing={2} sx={{ mb: 5 }}>
                    <Grid item xs={6} sm={6} md={4}>
                        <StatCard 
                            title="Resources" 
                            value={data.stats.downloads} 
                            icon={<LocalLibraryOutlinedIcon />} 
                            gradient="linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" // Blue
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={4}>
                        <StatCard 
                            title="Sessions" 
                            value={data.stats.sessions} 
                            icon={<CalendarTodayOutlinedIcon />} 
                            gradient="linear-gradient(135deg, #F97316 0%, #EA580C 100%)" // Orange
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        {/* Full width on XS only for balance, or use xs={6} if you have 4 stats */}
                        <StatCard 
                            title="Total Spent" 
                            value={`KES ${data.stats.totalSpent || 0}`} 
                            icon={<ReceiptLongOutlinedIcon />} 
                            gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)" // Green
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>My Library</Typography>
                    <Typography variant="body2" color="text.secondary">Your recent purchases and downloads.</Typography>
                </Box>
                <LibrarySection onReview={handleOpenReview} />
                </>
            )}
            
            {activeTab === 'library' && (
                <>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>My Library</Typography>
                    <LibrarySection onReview={handleOpenReview} />
                </>
            )}
            
            {activeTab === 'history' && (
                <>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Purchase History</Typography>
                    <HistorySection />
                </>
            )}
            
            {activeTab === 'settings' && (
                <>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Settings</Typography>
                    <AccountSettingsSection />
                </>
            )}

            <ReviewModal 
                open={reviewModalOpen} 
                onClose={() => setReviewModalOpen(false)} 
                resourceId={selectedReviewResource?.id || null} 
                resourceTitle={selectedReviewResource?.title || ''} 
                onSuccess={() => setReviewModalOpen(false)} 
            />
        </StudentLayout>
    );
};

export default StudentDashboard;
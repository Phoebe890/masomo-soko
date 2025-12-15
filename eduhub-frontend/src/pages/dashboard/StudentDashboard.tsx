import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, 
  Typography, IconButton, Button, Avatar, Grid, 
  useTheme, useMediaQuery, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TextField, 
  Chip, Card, CardContent, CardMedia, Stack, CircularProgress,
  LinearProgress, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Outline Icons (Cleaner look)
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

// Shared Header (Assuming you have this)
import Header from '../../components/layout/Header';

const drawerWidth = 260;
const BACKEND_URL = "http://localhost:8081";

// --- TYPES ---
interface Resource {
    id: number;
    title: string;
    teacherName: string;
    subject: string;
    grade?: string;
    previewImageUrl?: string;
    hasPreview: boolean;
}

interface DashboardData {
    student: { name: string; email: string; avatar?: string };
    stats: { downloads: number; sessions: number; wishlist: number };
    recentPurchase?: { title: string; teacher: string; id: number } | null;
}

// --- MODERN SUB-COMPONENTS ---

// 1. WELCOME HERO (Replaces generic stats)
const WelcomeHero = ({ studentName, recentPurchase, onViewLibrary }: any) => (
    <Box sx={{ 
        position: 'relative', 
        bgcolor: '#1E293B', 
        color: 'white', 
        p: { xs: 3, md: 5 }, 
        borderRadius: 4, 
        mb: 5,
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }}>
        {/* Background Gradient Decoration */}
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, rgba(30,41,59,0) 0%, rgba(59,130,246,0.2) 100%)' }} />
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
                Welcome back, {studentName.split(' ')[0]}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3, fontSize: '1.1rem' }}>
                You've got some great resources waiting. Ready to continue learning?
            </Typography>

            {recentPurchase ? (
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, maxWidth: 450 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlayCircleFilledWhiteIcon />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Pick up where you left off</Typography>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{recentPurchase.title}</Typography>
                    </Box>
                    <Button variant="contained" size="small" onClick={onViewLibrary} sx={{ bgcolor: 'white', color: '#0F172A', '&:hover': { bgcolor: '#F1F5F9' } }}>
                        Open
                    </Button>
                </Paper>
            ) : (
                <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} href="/browse">
                    Browse Marketplace
                </Button>
            )}
        </Box>
    </Box>
);

// 2. RESOURCE CARD (Cleaner, image-focused)
const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card 
        elevation={0} 
        sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid #F1F5F9',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
        }}
    >
        <Box sx={{ position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
            {resource.previewImageUrl ? (
                <CardMedia 
                    component="img" 
                    image={resource.previewImageUrl} 
                    sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            ) : (
                // Modern Gradient Placeholder if no image
                <Box sx={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <BookOutlinedIcon sx={{ color: 'white', opacity: 0.5, fontSize: 40 }} />
                </Box>
            )}
            <Chip 
                label={resource.subject} 
                size="small" 
                sx={{ 
                    position: 'absolute', top: 12, right: 12, 
                    bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', 
                    fontWeight: 700, fontSize: '0.7rem' 
                }} 
            />
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
            <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                {resource.grade || 'GENERAL'}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, mb: 1, lineHeight: 1.3, fontSize: '1rem' }}>
                {resource.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#F1F5F9', color: '#64748B' }}>
                    {resource.teacherName?.[0]}
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {resource.teacherName}
                </Typography>
            </Stack>
        </CardContent>
        
        <Divider />
        
        <Box sx={{ p: 2 }}>
            <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<DownloadIcon />} 
                href={`${BACKEND_URL}/api/student/download/${resource.id}`}
                sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    fontWeight: 600, 
                    borderColor: '#E2E8F0', 
                    color: '#475569',
                    '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' }
                }}
            >
                Download
            </Button>
        </Box>
    </Card>
);

// --- SECTIONS ---

function PurchasedResourcesSection() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/purchases`, { withCredentials: true })
            .then(res => setResources(res.data.resources || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LinearProgress sx={{ mt: 5, borderRadius: 5 }} />;

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>My Library</Typography>
            {resources.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }} elevation={0}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>Your library is empty.</Typography>
                    <Button variant="contained" href="/browse" sx={{ borderRadius: 50, textTransform: 'none' }}>Browse Marketplace</Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {resources.map((res) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={res.id}>
                            <ResourceCard resource={res} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

function OrderHistorySection() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/order-history`, { withCredentials: true })
            .then(res => setOrders(res.data.orders || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LinearProgress />;

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Transaction History</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Resource</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Instructor</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ color: '#334155' }}>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>{order.resource?.title}</TableCell>
                                <TableCell sx={{ color: '#334155' }}>{order.resource?.teacherName}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{order.price != null ? `KES ${order.price}` : 'Free'}</TableCell>
                                <TableCell>
                                    <Chip label="Completed" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700 }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function AccountSettingsSection() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/account-settings`, { withCredentials: true })
            .then(res => {
                setName(res.data.name || '');
                setEmail(res.data.email || '');
            });
    }, []);

    const handleSave = () => {
        setSaving(true);
        const params = new URLSearchParams();
        params.append('name', name);
        axios.post(`${BACKEND_URL}/api/student/account-settings`, params, { withCredentials: true })
            .then(() => alert('Saved!'))
            .finally(() => setSaving(false));
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Account Settings</Typography>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #F1F5F9', maxWidth: 600 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>FULL NAME</Typography>
                        <TextField fullWidth value={name} onChange={e => setName(e.target.value)} size="small" />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>EMAIL ADDRESS</Typography>
                        <TextField fullWidth value={email} disabled size="small" sx={{ bgcolor: '#F8FAFC' }} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            variant="contained" 
                            onClick={handleSave} 
                            disabled={saving}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 4, boxShadow: 'none' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

// --- MAIN LAYOUT ---

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/student/dashboard`, { withCredentials: true })
        .then(res => setDashboardData(res.data))
        .catch(() => {}) // Handle errors silently or redirect
        .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/';
  };

  const navItems = [
      { id: 'overview', label: 'Dashboard', icon: <GridViewOutlinedIcon /> },
      { id: 'library', label: 'My Library', icon: <BookOutlinedIcon /> },
      { id: 'coaching', label: 'Coaching', icon: <CalendarMonthOutlinedIcon /> },
      { id: 'orders', label: 'History', icon: <ReceiptLongOutlinedIcon /> },
      { id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon /> },
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
        <Box sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={800} color="primary" sx={{ letterSpacing: -0.5 }}>EduHub Student</Typography>
        </Box>
        <List sx={{ px: 2, flexGrow: 1 }}>
            {navItems.map((item) => (
                <ListItemButton
                    key={item.id}
                    selected={selectedSection === item.id}
                    onClick={() => { setSelectedSection(item.id); setMobileOpen(false); }}
                    sx={{
                        borderRadius: 3,
                        mb: 1,
                        py: 1.5,
                        color: selectedSection === item.id ? 'primary.main' : '#64748B',
                        bgcolor: selectedSection === item.id ? '#F0F9FF' : 'transparent',
                        '&:hover': { bgcolor: '#F8FAFC', color: '#334155' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.label} 
                        primaryTypographyProps={{ fontWeight: selectedSection === item.id ? 700 : 500, fontSize: '0.95rem' }} 
                    />
                </ListItemButton>
            ))}
        </List>
        <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9' }}>
            <Button 
                fullWidth 
                startIcon={<LogoutOutlinedIcon />} 
                onClick={handleLogout}
                sx={{ justifyContent: 'flex-start', color: '#EF4444', textTransform: 'none', fontWeight: 600, px: 2 }}
            >
                Log Out
            </Button>
        </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      
      {/* Sidebar Desktop */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, display: { xs: 'none', md: 'block' }, borderRight: '1px solid #F1F5F9' }}>
          <Box sx={{ position: 'fixed', width: drawerWidth, height: '100%' }}>
             {drawerContent}
          </Box>
      </Box>

      {/* Drawer Mobile */}
      <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
          {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, width: '100%', maxWidth: 1600 }}>
          {isMobile && (
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}><MenuIcon /></IconButton>
                  <Typography variant="h6" fontWeight={800}>Dashboard</Typography>
              </Box>
          )}

          {selectedSection === 'overview' && dashboardData && (
              <>
                <WelcomeHero 
                    studentName={dashboardData.student.name} 
                    recentPurchase={dashboardData.recentPurchase} 
                    onViewLibrary={() => setSelectedSection('library')}
                />
                <PurchasedResourcesSection />
              </>
          )}

          {selectedSection === 'library' && <PurchasedResourcesSection />}
          
          {selectedSection === 'coaching' && (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 60, color: '#CBD5E1', mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} color="text.secondary">Upcoming Sessions</Typography>
                  <Typography color="text.secondary">You have no scheduled coaching sessions.</Typography>
              </Box>
          )}
          
          {selectedSection === 'orders' && <OrderHistorySection />}
          {selectedSection === 'settings' && <AccountSettingsSection />}
          
      </Box>
    </Box>
  );
};

export default StudentDashboard;
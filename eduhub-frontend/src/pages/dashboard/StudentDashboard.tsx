import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Button, Avatar, Grid, 
  useTheme, useMediaQuery, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TextField, 
  Chip, Card, CardContent, CardMedia, CardActions, Stack, CircularProgress,
  Divider, Menu, MenuItem, ListItemIcon, List, ListItemButton, ListItemText, Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Components
import ReviewModal from '../../components/ReviewModal';

// Icons
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';

const drawerWidth = 280;
const BACKEND_URL = "http://localhost:8081";

// --- TYPES ---
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
    stats: { downloads: number; sessions: number; wishlist: number };
    recentPurchase?: { title: string; teacher: string; id: number } | null;
}

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, color }: any) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #F1F5F9', height: '100%', display: 'flex', alignItems: 'center', gap: 2.5, transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' } }}>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}15`, color: color, display: 'flex' }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1 }}>{value}</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, mt: 0.5 }}>{title}</Typography>
        </Box>
    </Paper>
);

const ContinueLearning = ({ recent, onResume }: any) => (
    <Paper elevation={0} sx={{ 
        p: 0, borderRadius: 4, bgcolor: '#1E293B', color: 'white', mb: 5, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
    }}>
        <Box sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
            <Box sx={{ flex: 1 }}>
                <Chip label="Ready to learn?" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#93C5FD', fontWeight: 700, mb: 2 }} />
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                    {recent ? `Continue: ${recent.title}` : 'Start learning today'}
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 3, maxWidth: 500 }}>
                    {recent ? `Pick up where you left off with ${recent.teacher}.` : 'Explore our marketplace to find the best resources for your studies.'}
                </Typography>
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={onResume}
                    startIcon={recent ? <PlayArrowIcon /> : <SearchIcon />}
                    sx={{ borderRadius: 50, px: 4, bgcolor: '#3B82F6', textTransform: 'none', fontWeight: 700, fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)' }}
                >
                    {recent ? 'Resume Learning' : 'Browse Resources'}
                </Button>
            </Box>
            <Box sx={{ width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocalLibraryOutlinedIcon sx={{ fontSize: 40, color: '#BFDBFE' }} />
                </Box>
            </Box>
        </Box>
    </Paper>
);

// Updated ResourceCard with Review Button
const ResourceCard = ({ resource, onReview }: { resource: Resource, onReview: (res: Resource) => void }) => (
    <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, border: '1px solid #F1F5F9', transition: '0.2s', '&:hover': { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', transform: 'translateY(-4px)' } }}>
        <Box sx={{ position: 'relative', pt: '60%', bgcolor: '#F8FAFC' }}>
            {resource.previewImageUrl ? (
                <CardMedia component="img" image={resource.previewImageUrl} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocalLibraryOutlinedIcon sx={{ fontSize: 40, color: '#CBD5E1' }} />
                </Box>
            )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {resource.subject}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 1, mb: 1, lineHeight: 1.3, fontSize: '1.05rem', color: '#0F172A' }}>
                {resource.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 22, height: 22, fontSize: '0.75rem', bgcolor: '#E2E8F0', color: '#64748B' }}>
                    {resource.teacherName?.[0]}
                </Avatar>
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>{resource.teacherName}</Typography>
            </Stack>
        </CardContent>
        <Divider sx={{ borderColor: '#F1F5F9' }} />
        <CardActions sx={{ p: 2 }}>
            <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<CloudDownloadOutlinedIcon />}
                href={`${BACKEND_URL}/api/student/download/${resource.id}`}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569', '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' } }}
            >
                Download
            </Button>
            <Button 
                size="small" 
                startIcon={<RateReviewOutlinedIcon />}
                onClick={() => onReview(resource)}
                sx={{ ml: 1, minWidth: 'auto', borderRadius: 2, color: 'text.secondary' }}
            >
                Review
            </Button>
        </CardActions>
    </Card>
);

// --- SECTIONS ---

function LibrarySection({ onReview }: { onReview: (res: Resource) => void }) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/purchases`, { withCredentials: true })
            .then(res => setResources(res.data.resources || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800} color="#0F172A">My Library</Typography>
                <Button href="/browse" sx={{ textTransform: 'none', fontWeight: 600 }}>Explore More</Button>
            </Box>
            {resources.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1' }} elevation={0}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>Your library is empty.</Typography>
                    <Button variant="contained" href="/browse" sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 700 }}>Browse Marketplace</Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {resources.map((res) => (
                        <Grid item xs={12} sm={6} md={4} key={res.id}>
                            <ResourceCard resource={res} onReview={onReview} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

function HistorySection() {
    const [orders, setOrders] = useState<any[]>([]);
    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/order-history`, { withCredentials: true }).then(res => setOrders(res.data.orders || []));
    }, []);

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 4, color: '#0F172A' }}>Transaction History</Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Resource</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748B' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell sx={{ color: '#334155', fontWeight: 500 }}>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ color: '#0F172A', fontWeight: 600 }}>{order.resource?.title}</TableCell>
                                <TableCell sx={{ color: '#334155' }}>KES {order.price || 0}</TableCell>
                                <TableCell><Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }}/>} label="Paid" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, border: 'none' }} /></TableCell>
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
            .then(res => { setName(res.data.name || ''); setEmail(res.data.email || ''); });
    }, []);

    const handleSave = () => {
        setSaving(true);
        const params = new URLSearchParams();
        params.append('name', name);
        axios.post(`${BACKEND_URL}/api/student/account-settings`, params, { withCredentials: true })
            .then(() => alert('Saved!')).finally(() => setSaving(false));
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>Account Settings</Typography>
            <Paper elevation={0} sx={{ p: 5, borderRadius: 4, maxWidth: 600, border: '1px solid #F1F5F9' }}>
                <Stack spacing={3}>
                    <TextField label="Full Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
                    <TextField label="Email Address" value={email} disabled fullWidth />
                    <Button variant="contained" onClick={handleSave} disabled={saving} size="large" sx={{ alignSelf: 'flex-start', borderRadius: 50, textTransform: 'none', fontWeight: 700, px: 4 }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

// --- MAIN DASHBOARD ---

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewResource, setSelectedReviewResource] = useState<{id: number, title: string} | null>(null);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/student/dashboard`, { withCredentials: true })
        .then(res => setData(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/'; };
  const handleOpenReview = (res: Resource) => {
      setSelectedReviewResource({ id: res.id, title: res.title });
      setReviewModalOpen(true);
  };

  const navLinks = [
      { id: 'overview', label: 'Dashboard', icon: <DashboardCustomizeOutlinedIcon /> },
      { id: 'library', label: 'My Library', icon: <LocalLibraryOutlinedIcon /> },
      { id: 'coaching', label: 'Coaching', icon: <CalendarTodayOutlinedIcon /> },
      { id: 'history', label: 'Purchase History', icon: <ReceiptLongOutlinedIcon /> },
      { id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon /> },
  ];

  const Sidebar = (
      <Box sx={{ height: '100%', bgcolor: 'white', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, borderRadius: 2 }} />
              <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ letterSpacing: -0.5 }}>EduHub</Typography>
          </Box>
          <List sx={{ px: 2, flexGrow: 1 }}>
              {navLinks.map((item) => (
                  <ListItemButton key={item.id} selected={activeTab === item.id} onClick={() => { setActiveTab(item.id); setMobileOpen(false); }} sx={{ borderRadius: 3, mb: 0.5, py: 1.5, color: activeTab === item.id ? 'primary.main' : '#64748B', bgcolor: activeTab === item.id ? '#EFF6FF' : 'transparent', '&:hover': { bgcolor: '#F8FAFC', color: '#334155' } }}>
                      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeTab === item.id ? 700 : 600, fontSize: '0.95rem' }} />
                  </ListItemButton>
              ))}
          </List>
          <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9' }}>
              <Button fullWidth startIcon={<LogoutOutlinedIcon />} onClick={handleLogout} sx={{ justifyContent: 'flex-start', color: '#EF4444', textTransform: 'none', fontWeight: 600, px: 2 }}>Log Out</Button>
          </Box>
      </Box>
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'fixed', width: drawerWidth, height: '100%', zIndex: 1200 }}>{Sidebar}</Box>
      </Box>
      <Menu open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { md: 'none' } }}>{/* Simplified */}</Menu>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={0} sx={{ py: 2, px: { xs: 2, md: 5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, zIndex: 1100, borderRadius: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isMobile && <IconButton onClick={() => setMobileOpen(!mobileOpen)}><MenuIcon /></IconButton>}
                  <Typography variant="h6" fontWeight={800} color="#0F172A">{navLinks.find(n => n.id === activeTab)?.label}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton><Badge variant="dot" color="error"><NotificationsNoneOutlinedIcon sx={{ color: '#64748B' }} /></Badge></IconButton>
                  <Stack direction="row" alignItems="center" spacing={1.5} onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ cursor: 'pointer', p: 0.5, pr: 1.5, borderRadius: 50, border: '1px solid #F1F5F9', '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <Avatar src={data?.student.avatar} sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, fontSize: '0.9rem', fontWeight: 700 }}>{data?.student.name[0]}</Avatar>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2} color="#0F172A">{data?.student.name}</Typography>
                          <Typography variant="caption" color="#94A3B8" fontWeight={600}>Student</Typography>
                      </Box>
                  </Stack>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                      <MenuItem onClick={() => { setAnchorEl(null); setActiveTab('settings'); }}>Account Settings</MenuItem>
                      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Log Out</MenuItem>
                  </Menu>
              </Box>
          </Paper>

          <Container maxWidth="xl" sx={{ p: { xs: 3, md: 5 } }}>
              {activeTab === 'overview' && data && (
                  <>
                      <ContinueLearning recent={data.recentPurchase} onResume={() => setActiveTab('library')} />
                      <Grid container spacing={3} sx={{ mb: 5 }}>
                          <Grid item xs={12} sm={6} md={4}><StatCard title="Resources Owned" value={data.stats.downloads} icon={<LocalLibraryOutlinedIcon />} color="#3B82F6" /></Grid>
                          <Grid item xs={12} sm={6} md={4}><StatCard title="Active Sessions" value={data.stats.sessions} icon={<CalendarTodayOutlinedIcon />} color="#8B5CF6" /></Grid>
                          <Grid item xs={12} sm={6} md={4}><StatCard title="Total Spent" value="KES 4,200" icon={<ReceiptLongOutlinedIcon />} color="#10B981" /></Grid>
                      </Grid>
                      <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mb: 3 }}>Recent Resources</Typography>
                      <LibrarySection onReview={handleOpenReview} />
                  </>
              )}
              {activeTab === 'library' && <LibrarySection onReview={handleOpenReview} />}
              {activeTab === 'history' && <HistorySection />}
              {activeTab === 'coaching' && (
                  <Box sx={{ textAlign: 'center', py: 15, bgcolor: 'white', borderRadius: 4, border: '1px dashed #E2E8F0' }}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 60, color: '#E2E8F0', mb: 2 }} />
                      <Typography variant="h6" color="#94A3B8" fontWeight={700}>No Sessions Scheduled</Typography>
                      <Button sx={{ mt: 2 }} href="/browse">Find a Tutor</Button>
                  </Box>
              )}
              {activeTab === 'settings' && <AccountSettingsSection />}
          </Container>
      </Box>

      {/* Review Modal */}
      <ReviewModal 
          open={reviewModalOpen} 
          onClose={() => setReviewModalOpen(false)} 
          resourceId={selectedReviewResource?.id || null} 
          resourceTitle={selectedReviewResource?.title || ''}
          onSuccess={() => alert("Thanks for your review!")}
      />
    </Box>
  );
};

export default StudentDashboard;
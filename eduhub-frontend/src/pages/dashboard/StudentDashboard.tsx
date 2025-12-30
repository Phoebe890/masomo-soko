import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Button, Avatar, Grid, 
  useTheme, useMediaQuery, Container, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TextField, 
  Chip, Card, CardContent, CardMedia, CardActions, Stack, CircularProgress,
  Divider, Menu, MenuItem, ListItemIcon, List, ListItemButton, ListItemText, Badge, Drawer, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import ReviewModal from '../../components/ReviewModal';

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
import SchoolIcon from '@mui/icons-material/School'; 

const drawerWidth = 280;
const BACKEND_URL = "http://localhost:8081";

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
    stats: { 
        downloads: number; 
        sessions: number; 
        wishlist: number; 
        totalSpent: number; 
    };
    recentPurchase?: { title: string; teacher: string; id: number } | null;
}

const StatCard = ({ title, value, icon, color }: any) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 3, borderRadius: 4, bgcolor: 'white', height: '100%', 
            display: 'flex', alignItems: 'center', gap: 2.5, 
            boxShadow: '0px 4px 20px rgba(0,0,0,0.03)',
            transition: 'transform 0.2s', 
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0px 10px 25px rgba(0,0,0,0.06)' } 
        }}
    >
        <Box sx={{ p: 2, borderRadius: 3, bgcolor: `${color}15`, color: color, display: 'flex' }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1e293b', lineHeight: 1, mb: 0.5 }}>{value}</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>{title}</Typography>
        </Box>
    </Paper>
);

const ContinueLearning = ({ recent, onResume }: any) => (
    <Paper 
        elevation={0} 
        sx={{ 
            p: 0, borderRadius: 4, mb: 5, overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(120deg, #2563eb 0%, #1d4ed8 100%)', color: 'white',
            boxShadow: '0px 10px 30px rgba(37, 99, 235, 0.25)'
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
                    sx={{ borderRadius: 50, px: 4, bgcolor: 'white', color: '#2563eb', textTransform: 'none', fontWeight: 800, mt: 2 }}
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

const getGradient = (id: number) => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    ];
    return gradients[id % gradients.length];
};

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

    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={800} color="#1e293b">My Library</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'} Purchased
                        </Typography>
                    </Box>
                    <TextField 
                        placeholder="Search your files..." size="small"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (<SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />),
                            sx: { borderRadius: 5, bgcolor: 'white', '& fieldset': { borderColor: '#e2e8f0' } }
                        }}
                        sx={{ width: { xs: '100%', md: 300 } }}
                    />
                </Box>
                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
                    {subjects.map((subject) => (
                        <Chip 
                            key={subject} label={subject} onClick={() => setSelectedSubject(subject)}
                            sx={{ 
                                fontWeight: 600, cursor: 'pointer',
                                bgcolor: selectedSubject === subject ? '#0f172a' : 'white',
                                color: selectedSubject === subject ? 'white' : '#64748b',
                                border: selectedSubject === subject ? 'none' : '1px solid #e2e8f0',
                                '&:hover': { bgcolor: selectedSubject === subject ? '#1e293b' : '#f8fafc' }
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            {filteredResources.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'white', border: '1px dashed #cbd5e1' }} elevation={0}>
                    <LocalLibraryOutlinedIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>No resources found</Typography>
                    <Button variant="contained" href="/browse" sx={{ borderRadius: 50, textTransform: 'none' }}>Browse Marketplace</Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredResources.map((res) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={res.id}>
                            <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, bgcolor: 'white', border: '1px solid #f1f5f9', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } }}>
                                <Box sx={{ position: 'relative', pt: '60%', overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                                    {res.previewImageUrl ? (
                                        <CardMedia component="img" image={res.previewImageUrl} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: getGradient(res.id), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="h3" fontWeight={900} sx={{ color: 'rgba(255,255,255,0.2)' }}>{res.subject[0]}</Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CloudDownloadOutlinedIcon sx={{ fontSize: 14 }} /> PDF
                                    </Box>
                                </Box>

                                <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{res.subject}</Typography>
                                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, mb: 1, fontSize: '1rem', lineHeight: 1.4, color: '#0f172a', display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, height: '2.8em' }}>{res.title}</Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Avatar sx={{ width: 20, height: 20, fontSize: '0.6rem', bgcolor: '#e2e8f0', color: '#64748b' }}>{res.teacherName?.[0]}</Avatar>
                                        <Typography variant="body2" color="text.secondary" fontSize="0.85rem">{res.teacherName}</Typography>
                                    </Stack>
                                </CardContent>

                                <Divider sx={{ borderColor: '#f8fafc', mx: 2 }} />

                                <CardActions sx={{ p: 2, pt: 1.5, gap: 1 }}>
                                    <Button 
                                        variant="contained" 
                                        href={`${BACKEND_URL}/api/student/download/${res.id}`} 
                                        startIcon={<CloudDownloadOutlinedIcon />}
                                        sx={{ 
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                            textTransform: 'none', 
                                            fontWeight: 700, 
                                            borderRadius: '10px', 
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            py: 0.8,
                                            '&:hover': { 
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                                                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                                            }
                                        }}
                                    >
                                        Download
                                    </Button>
                                    
                                    <Tooltip title="Write a review" arrow>
                                        <IconButton 
                                            onClick={() => onReview(res)} 
                                            sx={{ 
                                                borderRadius: '10px', 
                                                border: '1px solid #e2e8f0', 
                                                color: '#64748b',
                                                width: 40, height: 38,
                                                '&:hover': { bgcolor: '#fffbeb', color: '#fbbf24', borderColor: '#fbbf24' } 
                                            }}
                                        >
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

function HistorySection() {
    const [orders, setOrders] = useState<any[]>([]);
    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/student/order-history`, { withCredentials: true }).then(res => setOrders(res.data.orders || []));
    }, []);

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 4, color: '#1e293b' }}>Transaction History</Typography>
            <Paper elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell>Date</TableCell><TableCell>Resource</TableCell><TableCell>Price</TableCell><TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} hover>
                                    <TableCell>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{order.resource?.title}</TableCell>
                                    <TableCell>KES {order.price || 0}</TableCell>
                                    <TableCell><Chip icon={<CheckCircleIcon style={{ fontSize: 16 }}/>} label="Paid" size="small" color="success" sx={{ borderRadius: 1 }} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
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
            <Paper elevation={0} sx={{ p: 5, borderRadius: 4, maxWidth: 600, border: '1px solid #f1f5f9' }}>
                <Stack spacing={3}>
                    <TextField label="Full Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
                    <TextField label="Email Address" value={email} disabled fullWidth />
                    <Button variant="contained" onClick={handleSave} disabled={saving} size="large" sx={{ alignSelf: 'flex-start', borderRadius: 50 }}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewResource, setSelectedReviewResource] = useState<{id: number, title: string} | null>(null);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/student/dashboard`, { withCredentials: true })
        .then(res => setData(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
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

  const SidebarContent = (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0E243C', color: 'white' }}>
          
          <Box 
              onClick={() => navigate('/')} 
              sx={{ 
                  p: 3, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }}
          >
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SchoolIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 1 }}>EduHub</Typography>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

          <List sx={{ px: 2, flexGrow: 1 }}>
              {navLinks.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                      <ListItemButton 
                          key={item.id} 
                          selected={isActive} 
                          onClick={() => { setActiveTab(item.id); setMobileOpen(false); }} 
                          sx={{ 
                              mb: 1, borderRadius: 2,
                              bgcolor: isActive ? theme.palette.primary.main : 'transparent',
                              color: isActive ? 'white' : '#94A3B8',
                              '&:hover': { 
                                  bgcolor: isActive ? theme.palette.primary.dark : 'rgba(255,255,255,0.05)', 
                                  color: 'white' 
                              }
                          }}
                      >
                          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
                      </ListItemButton>
                  );
              })}
          </List>

          <Box sx={{ p: 2 }}>
             <Button fullWidth startIcon={<LogoutOutlinedIcon />} onClick={handleLogout} sx={{ justifyContent: 'flex-start', color: '#EF4444', textTransform: 'none', fontWeight: 600, px: 2, mb: 2, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>Log Out</Button>
          </Box>
          <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1 }}>Logged in as</Typography>
              <Typography variant="subtitle2" fontWeight={700}>Student Account</Typography>
          </Box>
      </Box>
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

  const formattedSpent = data?.stats.totalSpent 
      ? `KES ${data.stats.totalSpent.toLocaleString()}` 
      : 'KES 0';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'fixed', width: drawerWidth, height: '100%', zIndex: 1200 }}>
             {SidebarContent}
          </Box>
      </Box>
      <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} 
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#0E243C' },
          }}
      >
        {SidebarContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` }, display: 'flex', flexDirection: 'column' }}>
          
          <Paper elevation={0} sx={{ py: 2, px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1100, borderRadius: 0, bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isMobile && <IconButton onClick={handleDrawerToggle}><MenuIcon /></IconButton>}
                  <Typography variant="h6" fontWeight={800} color="#1e293b">{navLinks.find(n => n.id === activeTab)?.label}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton><Badge variant="dot" color="error"><NotificationsNoneOutlinedIcon sx={{ color: '#64748b' }} /></Badge></IconButton>
                  <Stack direction="row" alignItems="center" spacing={1.5} onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ cursor: 'pointer', p: 0.5, pr: 1.5, borderRadius: 50, border: '1px solid #f1f5f9', bgcolor: 'white', '&:hover': { bgcolor: '#f8fafc' } }}>
                      <Avatar src={data?.student.avatar} sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: '0.85rem', fontWeight: 700 }}>{data?.student.name[0]}</Avatar>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2} color="#1e293b">{data?.student.name}</Typography>
                          <Typography variant="caption" color="#64748b" fontWeight={600}>Student</Typography>
                      </Box>
                  </Stack>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }} PaperProps={{ sx: { mt: 1.5, minWidth: 180 } }}>
                      <MenuItem onClick={() => { setAnchorEl(null); setActiveTab('settings'); }}>Account Settings</MenuItem>
                      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Log Out</MenuItem>
                  </Menu>
              </Box>
          </Paper>

          <Container maxWidth="xl" sx={{ p: { xs: 2, md: 4 } }}>
              {activeTab === 'overview' && data && (
                  <>
                      <ContinueLearning recent={data.recentPurchase} onResume={() => setActiveTab('library')} />
                      <Grid container spacing={3} sx={{ mb: 5 }}>
                          <Grid item xs={12} sm={6} md={4}><StatCard title="Resources Owned" value={data.stats.downloads} icon={<LocalLibraryOutlinedIcon />} color="#3b82f6" /></Grid>
                          <Grid item xs={12} sm={6} md={4}><StatCard title="Active Sessions" value={data.stats.sessions} icon={<CalendarTodayOutlinedIcon />} color="#8b5cf6" /></Grid>
                          
                          <Grid item xs={12} sm={6} md={4}>
                                <StatCard title="Total Spent" value={formattedSpent} icon={<ReceiptLongOutlinedIcon />} color="#10b981" />
                          </Grid>
                      </Grid>
                      <Typography variant="h5" fontWeight={800} color="#1e293b" sx={{ mb: 3 }}>Recent Resources</Typography>
                      <LibrarySection onReview={handleOpenReview} />
                  </>
              )}
              {activeTab === 'library' && <LibrarySection onReview={handleOpenReview} />}
              {activeTab === 'history' && <HistorySection />}
              {activeTab === 'coaching' && (
                  <Box sx={{ textAlign: 'center', py: 15, bgcolor: 'white', borderRadius: 4, border: '1px dashed #e2e8f0' }}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 60, color: '#e2e8f0', mb: 2 }} />
                      <Typography variant="h6" color="#94a3b8" fontWeight={700}>No Sessions Scheduled</Typography>
                      <Button sx={{ mt: 2 }} href="/browse">Find a Tutor</Button>
                  </Box>
              )}
              {activeTab === 'settings' && <AccountSettingsSection />}
          </Container>
      </Box>

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
import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Divider, Button, Avatar, Grid, useTheme, useMediaQuery, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SchoolIcon from '@mui/icons-material/School';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import DownloadIcon from '@mui/icons-material/Download';

const drawerWidth = 240;

const sections = [
  { label: 'Overview', icon: <HomeIcon /> },
  { label: 'My Purchased Resources', icon: <LibraryBooksIcon /> },
  { label: 'My Online Coaching Sessions', icon: <SchoolIcon /> },
  { label: 'Order History', icon: <ReceiptIcon /> },
  { label: 'Account Settings', icon: <SettingsIcon /> },
];

interface OverviewSectionProps {
  student: {
    avatar?: string;
    firstName?: string;
    name?: string;
    [key: string]: any;
  };
  stats: {
    downloads: number;
    sessions: number;
    wishlist?: number;
    [key: string]: any;
  };
  recentPurchase?: {
    title: string;
    teacher: string;
    downloadUrl: string;
    [key: string]: any;
  } | null;
}

function OverviewSection({ student, stats, recentPurchase }: OverviewSectionProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar src={student.avatar} sx={{ width: 56, height: 56, mr: 2 }} />
        <Typography variant="h4" fontWeight={700}>
          Karibu, {student.firstName || student.name || 'Student'}!
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6">My Purchased Resources</Typography>
            <Typography variant="h4" color="primary">{stats.downloads}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6">Upcoming Coaching Sessions</Typography>
            <Typography variant="h4" color="primary">{stats.sessions}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6">My Wishlist</Typography>
            <Typography variant="h4" color="primary">{stats.wishlist || 0}</Typography>
          </Paper>
        </Grid>
      </Grid>
      {/* Most Recent Purchase */}
      {recentPurchase ? (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Most Recent Purchase
          </Typography>
          <Typography variant="body1" fontWeight={500}>{recentPurchase.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            By {recentPurchase.teacher}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            href={recentPurchase.downloadUrl}
            sx={{ mt: 1 }}
            aria-label={`Download ${recentPurchase.title}`}
          >
            Download Now
          </Button>
        </Paper>
      ) : null}
    </Box>
  );
}

function PurchasedResourcesSection() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem('email') || '';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/student/purchases?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        console.log('PURCHASES DATA:', data); // Debug log
        setResources(data.resources || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email]);

  if (loading) return <Typography>Loading...</Typography>;
  if (resources.length === 0) return <Typography>No purchased resources yet.</Typography>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>My Purchased Resources</Typography>
      <Grid container spacing={2}>
        {resources.map((res: any) => (
          <Grid item xs={12} md={6} key={res.id}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>{res.title}</Typography>
                <Typography variant="body2" color="text.secondary">By {res.teacherName}</Typography>
                <Typography variant="body2" color="text.secondary">Subject: {res.subject} | Grade: {res.grade}</Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                href={`/api/student/download/${res.id}?email=${encodeURIComponent(email)}`}
                aria-label={`Download ${res.title}`}
              >
                Download
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function CoachingSessionsSection() {
  // Placeholder for future integration
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>My Online Coaching Sessions</Typography>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography color="text.secondary">You have no upcoming coaching sessions.</Typography>
        {/* In the future, list sessions here */}
      </Paper>
    </Box>
  );
}

function OrderHistorySection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem('email') || '';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/student/order-history?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email]);

  if (loading) return <Typography>Loading...</Typography>;
  if (orders.length === 0) return <Typography>No orders yet.</Typography>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Order History</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell>{order.purchasedAt ? new Date(order.purchasedAt).toLocaleString() : ''}</TableCell>
                <TableCell>{order.resource?.title}</TableCell>
                <TableCell>{order.price != null ? `KES ${order.price}` : 'Free'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function AccountSettingsSection() {
  const [settings, setSettings] = useState<any>({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const email = localStorage.getItem('email') || '';

  useEffect(() => {
    setLoading(true);
    fetch(`/api/student/account-settings?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setEditName(data.name || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [email]);

  const handleSave = () => {
    setSaving(true);
    fetch(`/api/student/account-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}&name=${encodeURIComponent(editName)}`
    })
      .then(res => res.text())
      .then(() => {
        setSettings((prev: any) => ({ ...prev, name: editName }));
        setSaving(false);
      })
      .catch(() => setSaving(false));
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Account Settings</Typography>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, maxWidth: 400 }}>
        <TextField
          label="Name"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          value={settings.email}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Paper>
    </Box>
  );
}

const StudentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(0);
  const [student, setStudent] = useState({ name: 'Student', firstName: '', avatar: '' });
  const [stats, setStats] = useState({ downloads: 0, sessions: 0, wishlist: 0 });
  const [recentPurchase, setRecentPurchase] = useState(null);
  const email = localStorage.getItem('email') || '';

  useEffect(() => {
    // Fetch student dashboard data from backend
    fetch(`/api/student/dashboard?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        console.log('DASHBOARD DATA:', data); // Debug log
        if (data.student) setStudent(data.student);
        if (data.stats) setStats(data.stats);
        if (data.recentPurchase) setRecentPurchase(data.recentPurchase);
      })
      .catch(() => {});
  }, [email]);

  const renderSection = () => {
    switch (selectedSection) {
      case 0:
        return <OverviewSection student={student} stats={stats} recentPurchase={recentPurchase} />;
      case 1:
        return <PurchasedResourcesSection />;
      case 2:
        return <CoachingSessionsSection />;
      case 3:
        return <OrderHistorySection />;
      case 4:
        return <AccountSettingsSection />;
      default:
        return null;
    }
  };

  const drawer = (
    <Box sx={{ width: drawerWidth, pt: 2 }} role="navigation" aria-label="Dashboard navigation">
      <List>
        {sections.map((section, idx) => (
          <ListItem
            button
            key={section.label}
            selected={selectedSection === idx}
            onClick={() => {
              setSelectedSection(idx);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              '&.Mui-selected': {
                bgcolor: theme.palette.action.selected,
                color: theme.palette.primary.main,
                fontWeight: 700,
              },
              '&:hover': {
                bgcolor: theme.palette.action.hover,
              },
              minHeight: 56,
            }}
            aria-current={selectedSection === idx ? 'page' : undefined}
          >
            <ListItemIcon sx={{ color: selectedSection === idx ? theme.palette.primary.main : 'inherit' }}>
              {section.icon}
            </ListItemIcon>
            <ListItemText primary={section.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="Dashboard navigation">
        {/* Mobile drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, width: '100%', maxWidth: 1200, mx: 'auto' }}>
        {/* AppBar for mobile */}
        {isMobile && (
          <AppBar position="static" color="default" elevation={0} sx={{ mb: 2 }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="Open dashboard navigation"
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                Student Dashboard
              </Typography>
            </Toolbar>
          </AppBar>
        )}
        {renderSection()}
      </Box>
    </Box>
  );
};

export default StudentDashboard; 
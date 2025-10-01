import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, TextField, MenuItem, Select, InputLabel, FormControl, Drawer, IconButton, CircularProgress, Divider, List, ListItem, ListItemText, useTheme, useMediaQuery, Avatar
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

const CATEGORIES = ['Exams', 'Notes', 'Schemes of Work'];
const LEVELS = ['Junior Secondary', 'Senior Secondary', 'KCPE', 'KCSE'];
const CLASSES = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Chemistry', 'Physics', 'Biology', 'History', 'Geography', 'CRE', 'Business', 'ICT', 'Art', 'Music', 'Other'
];
const TERMS = ['Term 1', 'Term 2', 'Term 3'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const BrowseResources = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [classForm, setClassForm] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();
  const location = useLocation();

  // On mount, set search from query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    setSearch(searchParam);
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/teacher/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data.resources || []);
        setLoading(false);
      });
    // Listen for global resource changes
    const handleResourceListChanged = () => {
      setLoading(true);
      fetch('/api/teacher/resources')
        .then(res => res.json())
        .then(data => {
          setResources(data.resources || []);
          setLoading(false);
        });
    };
    window.addEventListener('resourceListChanged', handleResourceListChanged);
    return () => {
      window.removeEventListener('resourceListChanged', handleResourceListChanged);
    };
  }, []);

  // Filtering logic
  const filtered = resources.filter((res: any) => {
    const matchesSearch =
      res.title?.toLowerCase().includes(search.toLowerCase()) ||
      res.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? res.category === category : true;
    const matchesLevel = level ? res.level === level : true;
    const matchesClass = classForm ? res.classForm === classForm : true;
    const matchesSubject = subject ? res.subject === subject : true;
    const matchesTerm = term ? res.term === term : true;
    return matchesSearch && matchesCategory && matchesLevel && matchesClass && matchesSubject && matchesTerm;
  });

  // Sorting logic
  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'popular') return (b.purchases || 0) - (a.purchases || 0);
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    return 0;
  });

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setLevel('');
    setClassForm('');
    setSubject('');
    setTerm('');
    setSortBy('newest');
  };

  // Sidebar filter panel
  const filterPanel = (
    <Box sx={{ width: { xs: 280, md: 260 }, p: 3 }} role="region" aria-label="Resource filters">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={700}>Filter Resources</Typography>
        <Button onClick={clearFilters} startIcon={<ClearAllIcon />} sx={{ ml: 'auto' }} size="small" aria-label="Clear all filters">Clear</Button>
      </Box>
      <TextField
        label="Search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        inputProps={{ 'aria-label': 'Search resources' }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Level</InputLabel>
        <Select value={level} label="Level" onChange={e => setLevel(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Class/Form</InputLabel>
        <Select value={classForm} label="Class/Form" onChange={e => setClassForm(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {CLASSES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Subject</InputLabel>
        <Select value={subject} label="Subject" onChange={e => setSubject(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {SUBJECTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Term</InputLabel>
        <Select value={term} label="Term" onChange={e => setTerm(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {TERMS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 6 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Sidebar for desktop, drawer for mobile */}
        {isMobile ? (
          <>
            <IconButton onClick={() => setSidebarOpen(true)} sx={{ mb: 2 }} aria-label="Open filters">
              <FilterListIcon />
            </IconButton>
            <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} ModalProps={{ keepMounted: true }}>
              {filterPanel}
            </Drawer>
          </>
        ) : (
          <Box sx={{ minWidth: 260, mr: 4, display: { xs: 'none', md: 'block' } }}>
            {filterPanel}
          </Box>
        )}
        {/* Main grid area */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Browse Resources
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <CircularProgress aria-label="Loading resources" />
            </Box>
          ) : (
            <Grid container spacing={3} role="list" aria-label="Resource list">
              {sorted.length === 0 ? (
                <Grid item xs={12}>
                  <Typography color="text.secondary" sx={{ m: 2 }}>
                    No resources found.
                  </Typography>
                </Grid>
              ) : (
                sorted.map((res: any, idx: number) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={res.id || idx} role="listitem">
                    <Card
                      sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', border: '2px solid transparent', '&:hover': { borderColor: theme.palette.primary.light } }}
                      onClick={() => navigate(`/resource/${res.id}`)}
                      tabIndex={0}
                      aria-label={`View details for ${res.title}`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, bgcolor: 'grey.100', mb: 1 }}>
                        {res.thumbnail ? (
                          <Avatar src={res.thumbnail} variant="rounded" sx={{ width: 80, height: 80 }} alt={res.title} />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'grey.300', color: 'grey.700', fontSize: 32 }}>
                            📄
                          </Avatar>
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1, fontSize: '1.1rem' }}>{res.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          By {res.teacherName || 'Unknown Teacher'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} sx={{ color: i < Math.round(res.rating || 0) ? '#FFD700' : '#ccc', fontSize: 18 }} />
                          ))}
                          <Typography variant="caption" sx={{ ml: 1 }}>{(res.rating || 0).toFixed(1)}</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight={700} color="primary">
                          KES {res.price}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default BrowseResources;
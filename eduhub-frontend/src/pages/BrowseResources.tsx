import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, TextField, 
  MenuItem, Select, InputLabel, FormControl, Drawer, IconButton, 
  CircularProgress, Divider, useTheme, useMediaQuery, Avatar, 
  Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Radio, RadioGroup,
  Pagination, Stack, Rating, InputAdornment
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

// --- Constants ---
const CATEGORIES = ['Exams', 'Notes', 'Schemes of Work', 'Revision Materials'];
const LEVELS = ['Junior Secondary', 'Senior Secondary', 'KCPE', 'KCSE'];
const CLASSES = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Grade 7', 'Grade 8'];
const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Chemistry', 'Physics', 'Biology', 
  'History', 'Geography', 'CRE', 'Business', 'ICT', 'Art', 'Music'
];
const TERMS = ['Term 1', 'Term 2', 'Term 3'];

// Helper for consistent card colors
const getRandomColor = (id: number) => {
  const colors = ['#2D2F31', '#1C1D1F', '#5022c3', '#0056D2', '#1aa0db'];
  return colors[id % colors.length];
};

const BrowseResources = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  
  // Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [classForm, setClassForm] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // --- Fetching Logic ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    const catParam = params.get('category') || '';
    setSearch(searchParam);
    if(catParam) setCategory(catParam); // Handle category link from home
  }, [location.search]);

  useEffect(() => {
    fetchData();
    // Custom event listener from your original code
    const handleResourceListChanged = () => fetchData();
    window.addEventListener('resourceListChanged', handleResourceListChanged);
    return () => window.removeEventListener('resourceListChanged', handleResourceListChanged);
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/teacher/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data.resources || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // --- Filtering & Sorting ---
  const filtered = resources.filter((res: any) => {
    const s = search.toLowerCase();
    const matchesSearch = res.title?.toLowerCase().includes(s) || res.description?.toLowerCase().includes(s);
    // Note: Ensure your API returns exact matches for these fields, or adjust logic to include()
    const matchesCategory = category ? res.category === category : true;
    const matchesLevel = level ? res.level === level : true;
    const matchesClass = classForm ? res.classForm === classForm : true;
    const matchesSubject = subject ? res.subject === subject : true;
    const matchesTerm = term ? res.term === term : true;
    return matchesSearch && matchesCategory && matchesLevel && matchesClass && matchesSubject && matchesTerm;
  });

  const sorted = [...filtered].sort((a: any, b: any) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'popular') return (b.purchases || 0) - (a.purchases || 0);
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const clearFilters = () => {
    setSearch(''); setCategory(''); setLevel(''); setClassForm(''); setSubject(''); setTerm('');
  };

  // --- Components ---

  // Reusable Filter Section (Accordion Style)
  const FilterSection = ({ title, value, onChange, options }: any) => (
    <Accordion defaultExpanded elevation={0} disableGutters sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #d1d7dc' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 48 }}>
        <Typography fontWeight={700} sx={{ color: '#2d2f31' }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pb: 2, pt: 0 }}>
        <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
          <FormControlLabel 
            value="" 
            control={<Radio size="small" sx={{ color: '#2d2f31', '&.Mui-checked': { color: '#2d2f31' } }} />} 
            label={<Typography variant="body2">All {title}</Typography>} 
            sx={{ mb: 0.5 }}
          />
          {options.map((opt: string) => (
            <FormControlLabel 
              key={opt} 
              value={opt} 
              control={<Radio size="small" sx={{ color: '#2d2f31', '&.Mui-checked': { color: '#2d2f31' } }} />} 
              label={<Typography variant="body2">{opt}</Typography>}
              sx={{ mb: 0.5 }} 
            />
          ))}
        </RadioGroup>
      </AccordionDetails>
    </Accordion>
  );

  const FilterPanel = () => (
    <Box sx={{ width: '100%', pr: { md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Filters</Typography>
        <Button 
            size="small" 
            onClick={clearFilters} 
            startIcon={<RestartAltIcon />} 
            sx={{ textTransform: 'none', color: '#5624d0', fontWeight: 700 }}
        >
            Clear
        </Button>
      </Box>
      
      <FilterSection title="Category" value={category} onChange={setCategory} options={CATEGORIES} />
      <FilterSection title="Subject" value={subject} onChange={setSubject} options={SUBJECTS} />
      <FilterSection title="Level" value={level} onChange={setLevel} options={LEVELS} />
      <FilterSection title="Class / Form" value={classForm} onChange={setClassForm} options={CLASSES} />
      <FilterSection title="Term" value={term} onChange={setTerm} options={TERMS} />
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '80vh' }}>
      
      {/* --- Top Search & Sort Bar --- */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
           <Grid item xs={12} md={9}>
             <TextField
                fullWidth
                placeholder="Search for anything (e.g. Form 4 Math Notes)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    sx: { borderRadius: 0, bgcolor: 'white', height: 48 }
                }}
             />
           </Grid>
           <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <Select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ borderRadius: 0, bgcolor: 'white', height: 48, fontWeight: 700 }}
                    displayEmpty
                >
                    <MenuItem value="newest">Sort by: Newest</MenuItem>
                    <MenuItem value="popular">Sort by: Popularity</MenuItem>
                    <MenuItem value="rating">Sort by: Highest Rated</MenuItem>
                    <MenuItem value="price_asc">Price: Low to High</MenuItem>
                    <MenuItem value="price_desc">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
           </Grid>
           {isMobile && (
               <Grid item xs={6}>
                   <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<FilterListIcon />} 
                    onClick={() => setSidebarOpen(true)}
                    sx={{ height: 48, borderRadius: 0, borderColor: '#2d2f31', color: '#2d2f31' }}
                   >
                       Filter ({filtered.length})
                   </Button>
               </Grid>
           )}
        </Grid>
      </Box>

      <Grid container>
        {/* --- Sidebar (Desktop) --- */}
        {!isMobile && (
          <Grid item md={3} lg={2.5}>
             <FilterPanel />
          </Grid>
        )}

        {/* --- Mobile Drawer --- */}
        <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            <Box sx={{ p: 3, width: 300 }}>
                <FilterPanel />
                <Button fullWidth variant="contained" onClick={() => setSidebarOpen(false)} sx={{ mt: 2, bgcolor: '#2d2f31' }}>
                    Show {filtered.length} Results
                </Button>
            </Box>
        </Drawer>

        {/* --- Results Grid --- */}
        <Grid item xs={12} md={9} lg={9.5}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{filtered.length} results found</Typography>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
                <>
                <Grid container spacing={2}>
                    {sorted.length === 0 ? (
                        <Grid item xs={12}>
                             <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f7f9fa', border: '1px solid #d1d7dc' }}>
                                 <SearchIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                                 <Typography variant="h6">No results found</Typography>
                                 <Typography color="text.secondary">Try adjusting your search or filters to find what you're looking for.</Typography>
                                 <Button onClick={clearFilters} sx={{ mt: 2, fontWeight: 700 }}>Clear all filters</Button>
                             </Box>
                        </Grid>
                    ) : (
                        sorted.map((res: any, idx: number) => (
                            <Grid item xs={12} sm={6} lg={4} key={res.id || idx}>
                                <Card
                                  sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    borderRadius: 0, 
                                    boxShadow: 'none',
                                    border: '1px solid transparent',
                                    cursor: 'pointer',
                                    '&:hover': { border: '1px solid #d1d7dc', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                                    '&:hover .title': { textDecoration: 'underline' }
                                  }}
                                  onClick={() => navigate(`/resource/${res.id}`)}
                                >
                                  {/* Thumbnail Area */}
                                  <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: getRandomColor(idx), border: '1px solid #d1d7dc' }}>
                                     {res.thumbnail ? (
                                        <Box 
                                            component="img" 
                                            src={res.thumbnail} 
                                            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                     ) : (
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <SchoolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                                        </Box>
                                     )}
                                     {/* Bestseller Badge Logic (Mock) */}
                                     {idx % 5 === 0 && (
                                         <Box sx={{ position: 'absolute', top: 12, left: 0, bgcolor: '#eceb98', color: '#3d3c0a', px: 1, py: 0.5, fontSize: '0.75rem', fontWeight: 700, boxShadow: 1 }}>
                                             BESTSELLER
                                         </Box>
                                     )}
                                  </Box>

                                  <CardContent sx={{ flexGrow: 1, p: 2, pb: '16px !important' }}>
                                    <Typography 
                                        className="title" 
                                        variant="subtitle1" 
                                        fontWeight={700} 
                                        sx={{ 
                                            lineHeight: 1.4, 
                                            mb: 0.5, 
                                            display: '-webkit-box', 
                                            WebkitLineClamp: 2, 
                                            WebkitBoxOrient: 'vertical', 
                                            overflow: 'hidden', 
                                            height: '2.8em',
                                            color: '#2d2f31'
                                        }}
                                    >
                                        {res.title}
                                    </Typography>
                                    
                                    <Typography variant="body2" sx={{ color: '#6a6f73', fontSize: '0.8rem', mb: 0.5 }}>
                                        {res.teacherName || 'Instructor'}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" fontWeight={700} sx={{ color: '#b4690e', mr: 0.5 }}>
                                            {(res.rating || 4.5).toFixed(1)}
                                        </Typography>
                                        <Rating value={res.rating || 4.5} precision={0.5} size="small" readOnly sx={{ fontSize: '1rem', color: '#e59819' }} />
                                        <Typography variant="caption" sx={{ color: '#6a6f73', ml: 0.5 }}>
                                            ({Math.floor(Math.random() * 200) + 10})
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: '#2d2f31' }}>
                                            KES {res.price}
                                        </Typography>
                                        {/* Optional: Add tag like 'Form 4' */}
                                        {res.classForm && (
                                            <Typography variant="caption" sx={{ bgcolor: '#f7f9fa', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #d1d7dc' }}>
                                                {res.classForm}
                                            </Typography>
                                        )}
                                    </Box>
                                  </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
                
                {/* Visual Pagination */}
                {sorted.length > 0 && (
                    <Stack spacing={2} alignItems="center" sx={{ mt: 6 }}>
                        <Pagination count={Math.ceil(sorted.length / 12) || 1} size="large" shape="rounded" color="primary" />
                    </Stack>
                )}
                </>
            )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default BrowseResources;
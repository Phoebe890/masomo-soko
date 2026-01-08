import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, TextField, 
  MenuItem, Select, InputLabel, FormControl, Drawer, IconButton, 
  CircularProgress, Divider, useTheme, useMediaQuery, Avatar, 
  Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Radio, RadioGroup,
  Pagination, Stack, Rating, InputAdornment, CardMedia
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
// FIXED: Import Axios instance
import { api } from '@/api/axios';

const CATEGORIES = ['Exams', 'Notes', 'Schemes of Work', 'Revision Materials'];
const LEVELS = ['Junior Secondary', 'Senior Secondary', 'KCPE', 'KCSE'];
const CLASSES = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Grade 7', 'Grade 8'];
const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Chemistry', 'Physics', 'Biology', 
  'History', 'Geography', 'CRE', 'Business', 'ICT', 'Art', 'Music'
];
const TERMS = ['Term 1', 'Term 2', 'Term 3'];

const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const BORDER_COLOR = '#e2e8f0';

const getRandomColor = (id: number) => {
  const colors = ['#0f172a', '#334155', '#475569', '#1e293b'];
  return colors[id % colors.length];
};

const BrowseResources = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | false>('Category'); 

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [classForm, setClassForm] = useState('');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    const catParam = params.get('category') || '';
    setSearch(searchParam);
    if(catParam) {
        setCategory(catParam);
        setExpanded('Category'); 
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
    const handleResourceListChanged = () => fetchData();
    window.addEventListener('resourceListChanged', handleResourceListChanged);
    return () => window.removeEventListener('resourceListChanged', handleResourceListChanged);
  }, []);

  const fetchData = () => {
    setLoading(true);
    // FIXED: Use Axios instance to prevent 404s on custom domain
    api.get('/api/teacher/resources')
      .then(res => {
        setResources(res.data.resources || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const filtered = resources.filter((res: any) => {
    const s = search.toLowerCase();
    const matchesSearch = res.title?.toLowerCase().includes(s) || res.description?.toLowerCase().includes(s);
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

  const FilterSection = ({ title, value, onChange, options }: any) => (
    <Accordion 
        expanded={expanded === title} 
        onChange={handleAccordionChange(title)}
        elevation={0} 
        disableGutters 
        sx={{ 
            '&:before': { display: 'none' }, 
            borderBottom: `1px solid ${BORDER_COLOR}` 
        }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 48 }}>
        <Typography fontWeight={700} sx={{ color: TEXT_DARK, fontSize: '0.95rem' }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pb: 2, pt: 0 }}>
        <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
          <FormControlLabel 
            value="" 
            control={<Radio size="small" sx={{ color: TEXT_DARK, '&.Mui-checked': { color: theme.palette.primary.main } }} />} 
            label={<Typography variant="body2" color={TEXT_DARK}>All {title}</Typography>} 
            sx={{ mb: 0.5 }}
          />
          {options.map((opt: string) => (
            <FormControlLabel 
              key={opt} 
              value={opt} 
              control={<Radio size="small" sx={{ color: TEXT_DARK, '&.Mui-checked': { color: theme.palette.primary.main } }} />} 
              label={<Typography variant="body2" color={TEXT_DARK}>{opt}</Typography>}
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
        <Typography variant="h6" fontWeight={700} color={TEXT_DARK}>Filters</Typography>
        <Button 
            size="small" 
            onClick={clearFilters} 
            startIcon={<RestartAltIcon />} 
            sx={{ textTransform: 'none', fontWeight: 700 }}
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
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
           <Grid item xs={12} md={9}>
             <TextField
                fullWidth
                placeholder="Search for anything (e.g. Form 4 Math Notes)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: TEXT_MUTED }} /></InputAdornment>,
                    sx: { borderRadius: 1, bgcolor: 'white', height: 48 }
                }}
             />
           </Grid>
           <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <Select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ borderRadius: 1, bgcolor: 'white', height: 48, fontWeight: 600, color: TEXT_DARK }}
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
                    sx={{ height: 48, borderRadius: 1, borderColor: TEXT_DARK, color: TEXT_DARK }}
                   >
                       Filter ({filtered.length})
                   </Button>
               </Grid>
           )}
        </Grid>
      </Box>

      <Grid container>
        {!isMobile && (
          <Grid item md={3} lg={2.5}>
             <FilterPanel />
          </Grid>
        )}

        <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            <Box sx={{ p: 3, width: 300 }}>
                <FilterPanel />
                <Button fullWidth variant="contained" onClick={() => setSidebarOpen(false)} sx={{ mt: 2 }}>
                    Show {filtered.length} Results
                </Button>
            </Box>
        </Drawer>

        <Grid item xs={12} md={9} lg={9.5}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: TEXT_DARK }}>{filtered.length} results found</Typography>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
                <>
                <Grid container spacing={2}>
                    {sorted.length === 0 ? (
                        <Grid item xs={12}>
                             <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f8fafc', border: `1px solid ${BORDER_COLOR}`, borderRadius: 2 }}>
                                 <SearchIcon sx={{ fontSize: 60, color: TEXT_MUTED, mb: 2 }} />
                                 <Typography variant="h6" fontWeight={700} color={TEXT_DARK}>No results found</Typography>
                                 <Typography color={TEXT_MUTED}>Try adjusting your search or filters to find what you're looking for.</Typography>
                                 <Button onClick={clearFilters} sx={{ mt: 2, fontWeight: 700 }}>Clear all filters</Button>
                             </Box>
                        </Grid>
                    ) : (
                        sorted.map((res: any, idx: number) => {
                            const displayImage = res.coverImageUrl || res.previewImageUrl || res.thumbnail;

                            return (
                                <Grid item xs={12} sm={6} lg={4} key={res.id || idx}>
                                    <Card
                                      sx={{ 
                                        height: '100%', display: 'flex', flexDirection: 'column', 
                                        borderRadius: 2, boxShadow: 'none', border: `1px solid ${BORDER_COLOR}`,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                                        '&:hover .title': { color: theme.palette.primary.main }
                                      }}
                                      onClick={() => navigate(`/resource/${res.id}`)}
                                    >
                                      <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: getRandomColor(idx), borderBottom: `1px solid ${BORDER_COLOR}`, overflow: 'hidden' }}>
                                         {displayImage ? (
                                            <CardMedia component="img" image={displayImage} alt={res.title} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                         ) : (
                                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                <SchoolIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                                            </Box>
                                         )}
                                      </Box>

                                      <CardContent sx={{ flexGrow: 1, p: 2, pb: '16px !important' }}>
                                        <Typography className="title" variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.4, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8em', color: TEXT_DARK, transition: 'color 0.2s' }}>
                                            {res.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: TEXT_MUTED, fontSize: '0.85rem', mb: 1 }}>
                                            {res.teacherName || 'Instructor'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: '#b4690e', mr: 0.5 }}>{(res.rating || 4.5).toFixed(1)}</Typography>
                                            <Rating value={res.rating || 4.5} precision={0.5} size="small" readOnly sx={{ fontSize: '1rem', color: '#fbbf24' }} />
                                            <Typography variant="caption" sx={{ color: TEXT_MUTED, ml: 0.5 }}>({Math.floor(Math.random() * 50) + 5})</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: TEXT_DARK, fontSize: '1.1rem' }}>
                                                {res.price > 0 ? `KES ${res.price}` : 'Free'}
                                            </Typography>
                                            {res.classForm && (
                                                <Typography variant="caption" fontWeight={600} sx={{ bgcolor: '#f1f5f9', color: TEXT_MUTED, px: 1, py: 0.5, borderRadius: 1 }}>
                                                    {res.classForm}
                                                </Typography>
                                            )}
                                        </Box>
                                      </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })
                    )}
                </Grid>
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
import React, { useEffect, useState, useCallback } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    IconButton, Select, MenuItem, FormControl, Switch, TablePagination,
    TextField, InputAdornment, Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, Grid, InputLabel, Chip, Skeleton, alpha, Divider
} from '@mui/material';
import { api } from '@/api/axios';
import AdminLayout from './AdminLayout';

// High-End Icons (Lucide)
import { 
    Search, 
    Trash2, 
    Filter, 
    RotateCcw, 
    UserCircle, 
    Mail, 
    Shield, 
    AlertCircle,
    CheckCircle
} from 'lucide-react';

// Define User Type
type User = { id: number; email: string; name: string; role: string; enabled: boolean; };

interface PageResponse {
    content: User[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

const BRAND_BLUE = '#2563EB';
const BORDER_COLOR = '#E2E8F0';
const SHARP_RADIUS = '2px';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Logic States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

  // 1. Fetch Users Logic (Preserved)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', rowsPerPage.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await api.get<PageResponse>(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.content);
      setTotalCount(res.data.totalElements);
    } catch (err) { 
        console.error("Failed to fetch users", err); 
    } finally { setLoading(false); }
  }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => { fetchUsers(); }, 400); 
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const resetFilters = () => {
      setSearchTerm('');
      setRoleFilter('ALL');
      setStatusFilter('ALL');
      setPage(0);
  };

  // --- ACTIONS (Preserved Functionality) ---
  const handleAction = (type: string, user: User, newRole?: string) => {
      setConfirmAction({ type, user, newRole });
      setConfirmOpen(true);
  };

  const handleConfirm = async () => {
      if (!confirmAction) return;
      setConfirmOpen(false);
      try {
           if (confirmAction.type === 'ban') {
              await api.post(`/api/admin/users/${confirmAction.user.id}/toggle-status`, {});
              setUsers(prev => prev.map(u => u.id === confirmAction.user.id ? { ...u, enabled: !u.enabled } : u));
          } else if (confirmAction.type === 'delete') {
              await api.delete(`/api/admin/users/${confirmAction.user.id}`);
              setUsers(prev => prev.filter(u => u.id !== confirmAction.user.id));
              setTotalCount(prev => prev - 1);
          } else if (confirmAction.type === 'role') {
              await api.post(`/api/admin/users/${confirmAction.user.id}/role`, { role: confirmAction.newRole });
              setUsers(prev => prev.map(u => u.id === confirmAction.user.id ? { ...u, role: confirmAction.newRole } : u));
          }
          setToast({ open: true, msg: "Updated successfully", type: 'success' });
      } catch (e) {
          setToast({ open: true, msg: "Operation failed", type: 'error' });
      }
  };

  return (
    <AdminLayout title="User Management" selectedRoute="/admin/users">
        
        {/* --- PREMIUM FILTER BAR --- */}
        <Paper 
            elevation={0} 
            sx={{ 
                p: 3, mb: 3, borderRadius: SHARP_RADIUS, 
                border: `1px solid ${BORDER_COLOR}`,
                bgcolor: '#FFF' 
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                <Filter size={18} color={BRAND_BLUE} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: 0.5 }}>
                    FILTER ENGINE
                </Typography>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth placeholder="Search by name, email..." 
                        value={searchTerm} 
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        size="small"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
                            sx: { borderRadius: SHARP_RADIUS, bgcolor: '#F8FAFC' }
                        }} 
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <FormControl fullWidth size="small">
                        <Select 
                            value={roleFilter} 
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                            displayEmpty
                            sx={{ borderRadius: SHARP_RADIUS, bgcolor: '#F8FAFC' }}
                        >
                            <MenuItem value="ALL">All Roles</MenuItem>
                            <MenuItem value="STUDENT">Students</MenuItem>
                            <MenuItem value="TEACHER">Teachers</MenuItem>
                            <MenuItem value="ADMIN">Administrators</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                    <FormControl fullWidth size="small">
                        <Select 
                            value={statusFilter} 
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                            displayEmpty
                            sx={{ borderRadius: SHARP_RADIUS, bgcolor: '#F8FAFC' }}
                        >
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active Users</MenuItem>
                            <MenuItem value="BANNED">Banned Users</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Button 
                        fullWidth 
                        variant="outlined" 
                        startIcon={<RotateCcw size={16} />} 
                        onClick={resetFilters} 
                        sx={{ 
                            borderRadius: SHARP_RADIUS, 
                            borderColor: BORDER_COLOR, 
                            color: '#475569',
                            fontWeight: 700,
                            textTransform: 'none',
                            height: '40px'
                        }}
                    >
                        Reset
                    </Button>
                </Grid>
            </Grid>
        </Paper>

        {/* --- USER TABLE --- */}
        <Paper 
            elevation={0} 
            sx={{ 
                borderRadius: SHARP_RADIUS, 
                border: `1px solid ${BORDER_COLOR}`, 
                overflow: 'hidden',
                bgcolor: '#FFF'
            }}
        >
            <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>User Identity</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>System Role</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Access Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Box sx={{ display: 'flex', gap: 2 }}><Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: SHARP_RADIUS }} /><Box><Skeleton width={120} /><Skeleton width={160} /></Box></Box></TableCell>
                                <TableCell><Skeleton width={80} /></TableCell>
                                <TableCell><Skeleton width={100} /></TableCell>
                                <TableCell align="right"><Skeleton width={30} sx={{ ml: 'auto' }}/></TableCell>
                            </TableRow>
                        ))
                    ) : users.length === 0 ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary', fontWeight: 600 }}>No users found matching your criteria.</TableCell></TableRow>
                    ) : (
                        users.map((u) => (
                            <TableRow key={u.id} hover sx={{ '&:hover': { bgcolor: alpha(BRAND_BLUE, 0.01) } }}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                            width: 40, height: 40, borderRadius: SHARP_RADIUS, 
                                            bgcolor: '#F1F5F9', color: BRAND_BLUE, 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontWeight: 800, border: `1px solid ${BORDER_COLOR}`
                                        }}>
                                            {u.name?.[0]?.toUpperCase()}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{u.name}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#053a85' }}>
                                                <Mail size={12} />
                                                <Typography variant="caption" sx={{ fontWeight: 500 }}>{u.email}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small" variant="standard">
                                        <Select 
                                            value={u.role} 
                                            onChange={(e) => handleAction('role', u, e.target.value)} 
                                            disableUnderline 
                                            sx={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: 800, 
                                                color: u.role === 'ADMIN' ? '#7C3AED' : '#0F172A',
                                                bgcolor: u.role === 'ADMIN' ? alpha('#7C3AED', 0.05) : '#F8FAFC',
                                                px: 1.5, py: 0.5, borderRadius: SHARP_RADIUS,
                                                '& .MuiSelect-select': { py: '4px !important' }
                                            }}
                                        >
                                            <MenuItem value="STUDENT">Student</MenuItem>
                                            <MenuItem value="TEACHER">Teacher</MenuItem>
                                            <MenuItem value="ADMIN">Admin</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Switch 
                                            size="small" 
                                            checked={u.enabled} 
                                            onChange={() => handleAction('ban', u)} 
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' }
                                            }}
                                        />
                                        <Chip 
                                            label={u.enabled ? 'ACTIVE' : 'BANNED'} 
                                            size="small" 
                                            sx={{ 
                                                height: 20, fontSize: '0.65rem', fontWeight: 800, borderRadius: SHARP_RADIUS,
                                                bgcolor: u.enabled ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1), 
                                                color: u.enabled ? '#059669' : '#DC2626',
                                                border: 'none'
                                            }} 
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleAction('delete', u)} 
                                        sx={{ 
                                            color: '#EF4444', borderRadius: SHARP_RADIUS,
                                            border: '1px solid transparent',
                                            '&:hover': { bgcolor: alpha('#EF4444', 0.05), borderColor: alpha('#EF4444', 0.2) } 
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
            </TableContainer>
            
            {/* PAGINATION */}
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ 
                    borderTop: `1px solid ${BORDER_COLOR}`,
                    bgcolor: '#F8FAFC',
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontWeight: 700, fontSize: '0.75rem' }
                }}
            />
        </Paper>

        {/* --- CONFIRMATION DIALOG --- */}
        <Dialog 
            open={confirmOpen} 
            onClose={() => setConfirmOpen(false)}
            PaperProps={{ sx: { borderRadius: SHARP_RADIUS, p: 1 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
                <AlertCircle size={24} color={BRAND_BLUE} />
                Confirm System Change
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                    You are about to modify user <strong>{confirmAction?.user?.name}</strong>. 
                    This action will be logged and takes effect immediately across the platform.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={() => setConfirmOpen(false)} sx={{ fontWeight: 700, color: '#64748B', textTransform: 'none' }}>Cancel</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    sx={{ 
                        bgcolor: '#0F172A', fontWeight: 700, px: 3, borderRadius: SHARP_RADIUS, 
                        boxShadow: 'none', textTransform: 'none',
                        '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' }
                    }}
                >
                    Apply Changes
                </Button>
            </DialogActions>
        </Dialog>

        <Snackbar 
            open={toast.open} 
            autoHideDuration={4000} 
            onClose={() => setToast({...toast, open: false})}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert 
                severity={toast.type} 
                variant="filled" 
                sx={{ borderRadius: SHARP_RADIUS, fontWeight: 700, bgcolor: toast.type === 'success' ? '#0F172A' : '#EF4444' }}
            >
                {toast.msg}
            </Alert>
        </Snackbar>
    </AdminLayout>
  );
};

export default AdminUsers;
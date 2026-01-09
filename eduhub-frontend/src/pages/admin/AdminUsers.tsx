import React, { useEffect, useState, useCallback } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    IconButton, Select, MenuItem, FormControl, Switch, TablePagination,
    TextField, InputAdornment, Snackbar, Alert, Dialog, DialogTitle, DialogContent, 
    DialogActions, Button, Grid, InputLabel, Chip, Skeleton
} from '@mui/material';
import { api } from '@/api/axios';
import AdminLayout from './AdminLayout';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Define User Type
type User = { id: number; email: string; name: string; role: string; enabled: boolean; };

// Define API Response Type for Pagination
interface PageResponse {
    content: User[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Action States
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

  // 1. Fetch Users from Backend with Pagination
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
    } finally { 
        setLoading(false); 
    }
  }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter]);

  // Trigger fetch when any filter/page changes
  useEffect(() => {
    // Add a small debounce for search to prevent API spam while typing
    const timeoutId = setTimeout(() => {
        fetchUsers();
    }, 400); 
    return () => clearTimeout(timeoutId);
  }, [fetchUsers]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing page size
  };

  const resetFilters = () => {
      setSearchTerm('');
      setRoleFilter('ALL');
      setStatusFilter('ALL');
      setPage(0);
  };

  // --- ACTIONS (Delete, Ban, Role Change) ---
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
              // Update local state to reflect change without refetching
              setUsers(prev => prev.map(u => u.id === confirmAction.user.id ? { ...u, enabled: !u.enabled } : u));
          } else if (confirmAction.type === 'delete') {
              await api.delete(`/api/admin/users/${confirmAction.user.id}`);
              setUsers(prev => prev.filter(u => u.id !== confirmAction.user.id));
              setTotalCount(prev => prev - 1);
          } else if (confirmAction.type === 'role') {
              await api.post(`/api/admin/users/${confirmAction.user.id}/role`, { role: confirmAction.newRole });
              setUsers(prev => prev.map(u => u.id === confirmAction.user.id ? { ...u, role: confirmAction.newRole } : u));
          }
          setToast({ open: true, msg: "Action successful", type: 'success' });
      } catch (e) {
          setToast({ open: true, msg: "Action failed", type: 'error' });
      }
  };

  return (
    <AdminLayout title="User Management" selectedRoute="/admin/users">
        
        {/* FILTERS */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, color: 'text.secondary' }}>
                <FilterListIcon fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>FILTERS</Typography>
            </Box>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth placeholder="Search by name or email..." 
                        value={searchTerm} 
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} 
                        size="small"
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>User Role</InputLabel>
                        <Select 
                            value={roleFilter} 
                            label="User Role" 
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="ALL">All Roles</MenuItem>
                            <MenuItem value="STUDENT">Student</MenuItem>
                            <MenuItem value="TEACHER">Teacher</MenuItem>
                            <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select 
                            value={statusFilter} 
                            label="Status" 
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        >
                            <MenuItem value="ALL">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="BANNED">Banned</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Button fullWidth variant="outlined" startIcon={<RestartAltIcon />} onClick={resetFilters} color="inherit" sx={{ borderColor: '#D1D5DB', color: '#4B5563' }}>Reset</Button>
                </Grid>
            </Grid>
        </Paper>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#374151' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    
                    {loading ? (
                        [...Array(rowsPerPage)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Box sx={{ display: 'flex', gap: 2 }}><Skeleton variant="circular" width={36} height={36} /><Box><Skeleton width={120} /><Skeleton width={160} /></Box></Box></TableCell>
                                <TableCell><Skeleton width={80} /></TableCell>
                                <TableCell><Skeleton width={60} /></TableCell>
                                <TableCell align="right"><Skeleton width={30} sx={{ ml: 'auto' }}/></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        users.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No users found.</TableCell></TableRow>
                        ) : (
                            users.map((u) => (
                            <TableRow key={u.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                            {u.name?.[0]?.toUpperCase()}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                <FormControl size="small" variant="standard" sx={{ minWidth: 100 }}>
                                    <Select value={u.role} onChange={(e) => handleAction('role', u, e.target.value)} disableUnderline sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        <MenuItem value="STUDENT">Student</MenuItem>
                                        <MenuItem value="TEACHER">Teacher</MenuItem>
                                        <MenuItem value="ADMIN">Admin</MenuItem>
                                    </Select>
                                </FormControl>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Switch size="small" checked={u.enabled} onChange={() => handleAction('ban', u)} color={u.enabled ? "success" : "error"} />
                                        <Chip 
                                            label={u.enabled ? 'Active' : 'Banned'} 
                                            size="small" 
                                            color={u.enabled ? 'success' : 'error'} 
                                            variant="outlined"
                                            sx={{ ml: 1, height: 20, fontSize: '0.7rem', fontWeight: 600, border: 'none', bgcolor: u.enabled ? '#ECFDF5' : '#FEF2F2', color: u.enabled ? '#059669' : '#DC2626' }} 
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleAction('delete', u)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', '&:hover': { bgcolor: '#FEE2E2' } }}><DeleteIcon fontSize="small" /></IconButton>
                                </TableCell>
                            </TableRow>
                            ))
                        )
                    )}
                  </TableBody>
                </Table>
            </TableContainer>
            
            {/* PAGINATION CONTROLS */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount} // Total items from backend
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid #E5E7EB' }}
            />
        </Paper>

        {/* DIALOGS AND TOASTS */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent><Typography>Are you sure you want to proceed with this action?</Typography></DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="error">Confirm</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})}><Alert severity={toast.type} variant="filled">{toast.msg}</Alert></Snackbar>
    </AdminLayout>
  );
};

export default AdminUsers;
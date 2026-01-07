import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
    IconButton, CircularProgress, Select, MenuItem, FormControl, Switch, 
    TextField, InputAdornment, Snackbar, Alert, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import axios from 'axios';
import AdminLayout from './AdminLayout'; // Import Layout
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const BACKEND_URL = "http://localhost:8081";

type User = { id: number; email: string; name: string; role: string; enabled: boolean; };

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { withCredentials: true });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
      const lower = searchTerm.toLowerCase();
      setFilteredUsers(users.filter(u => u.name?.toLowerCase().includes(lower) || u.email?.toLowerCase().includes(lower)));
  }, [searchTerm, users]);

  const handleAction = (type: string, user: User, newRole?: string) => {
      setConfirmAction({ type, user, newRole });
      setConfirmOpen(true);
  };

  const handleConfirm = async () => {
      if (!confirmAction) return;
      setConfirmOpen(false);
      try {
          // ... (Keep your existing API logic here, truncated for brevity) ...
           if (confirmAction.type === 'ban') {
              await axios.post(`${BACKEND_URL}/api/admin/users/${confirmAction.user.id}/toggle-status`, {}, { withCredentials: true });
              setUsers(users.map(u => u.id === confirmAction.user.id ? { ...u, enabled: !u.enabled } : u));
          } else if (confirmAction.type === 'delete') {
              await axios.delete(`${BACKEND_URL}/api/admin/users/${confirmAction.user.id}`, { withCredentials: true });
              setUsers(users.filter(u => u.id !== confirmAction.user.id));
          } else if (confirmAction.type === 'role') {
              await axios.post(`${BACKEND_URL}/api/admin/users/${confirmAction.user.id}/role`, { role: confirmAction.newRole }, { withCredentials: true });
              setUsers(users.map(u => u.id === confirmAction.user.id ? { ...u, role: confirmAction.newRole } : u));
          }
          setToast({ open: true, msg: "Action successful", type: 'success' });
      } catch (e) {
          setToast({ open: true, msg: "Action failed", type: 'error' });
      }
  };

  return (
    <AdminLayout title="User Management" selectedRoute="/admin/users">
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <TextField 
                fullWidth placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} size="small"
            />
        </Paper>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {loading ? <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box> : (
            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                    {u.name?.[0]?.toUpperCase()}
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                                </Box>
                            </Box>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 110 }}>
                            <Select value={u.role} onChange={(e) => handleAction('role', u, e.target.value)} sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
                              <MenuItem value="STUDENT">Student</MenuItem>
                              <MenuItem value="TEACHER">Teacher</MenuItem>
                              <MenuItem value="ADMIN">Admin</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                            <Switch checked={u.enabled} onChange={() => handleAction('ban', u)} color="success" />
                            <Typography variant="caption" sx={{ ml: 1, color: u.enabled ? 'green' : 'red', fontWeight: 600 }}>{u.enabled ? 'Active' : 'Banned'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                            <IconButton size="small" onClick={() => handleAction('delete', u)} color="error"><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent><Typography>Are you sure you want to proceed?</Typography></DialogContent>
            <DialogActions>
                <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="error">Confirm</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})}><Alert severity={toast.type}>{toast.msg}</Alert></Snackbar>
    </AdminLayout>
  );
};

export default AdminUsers;
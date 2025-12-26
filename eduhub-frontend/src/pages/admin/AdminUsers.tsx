import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, 
    IconButton, CircularProgress, Select, MenuItem, FormControl, Switch, 
    TextField, InputAdornment, Snackbar, Alert, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const BACKEND_URL = "http://localhost:8081";

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  enabled: boolean;
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

  // Confirmation Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'delete' | 'role', user: User, newRole?: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { withCredentials: true });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
      const lowerTerm = searchTerm.toLowerCase();
      const results = users.filter(u => u.name?.toLowerCase().includes(lowerTerm) || u.email?.toLowerCase().includes(lowerTerm));
      setFilteredUsers(results);
  }, [searchTerm, users]);

  // --- OPEN DIALOG HANDLERS ---
  const requestToggleStatus = (user: User) => {
      setConfirmAction({ type: 'ban', user });
      setConfirmOpen(true);
  };

  const requestChangeRole = (user: User, newRole: string) => {
      if(user.role === newRole) return;
      setConfirmAction({ type: 'role', user, newRole });
      setConfirmOpen(true);
  };

  const requestDelete = (user: User) => {
      setConfirmAction({ type: 'delete', user });
      setConfirmOpen(true);
  };

  // --- CONFIRM ACTION HANDLER ---
  const handleConfirm = async () => {
      if (!confirmAction) return;
      const { type, user, newRole } = confirmAction;
      setConfirmOpen(false); // Close dialog immediately
      setProcessingId(user.id);

      try {
          if (type === 'ban') {
              await axios.post(`${BACKEND_URL}/api/admin/users/${user.id}/toggle-status`, {}, { withCredentials: true });
              const updated = users.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u);
              setUsers(updated);
              setToast({ open: true, msg: `User ${!user.enabled ? 'Activated' : 'Banned'}`, type: 'success' });
          } 
          else if (type === 'role' && newRole) {
              await axios.post(`${BACKEND_URL}/api/admin/users/${user.id}/role`, { role: newRole }, { withCredentials: true });
              const updated = users.map(u => u.id === user.id ? { ...u, role: newRole } : u);
              setUsers(updated);
              setToast({ open: true, msg: "Role updated", type: 'success' });
          } 
          else if (type === 'delete') {
              await axios.delete(`${BACKEND_URL}/api/admin/users/${user.id}`, { withCredentials: true });
              setUsers(users.filter(u => u.id !== user.id));
              setToast({ open: true, msg: "User deleted", type: 'success' });
          }
      } catch (e) {
          setToast({ open: true, msg: "Action failed", type: 'error' });
      } finally {
          setProcessingId(null);
          setConfirmAction(null);
      }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar selected="/admin/users" />
      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: '#111827' }}>User Management</Typography>

        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <TextField 
                fullWidth 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>, sx: { borderRadius: 2 } }}
                size="small"
            />
        </Paper>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {loading ? (
            <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
          ) : (
            <Table>
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
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select 
                            value={u.role} 
                            onChange={(e) => requestChangeRole(u, e.target.value)} // Updated Handler
                            disabled={processingId === u.id}
                            sx={{ borderRadius: 2, fontSize: '0.85rem' }}
                        >
                          <MenuItem value="STUDENT">Student</MenuItem>
                          <MenuItem value="TEACHER">Teacher</MenuItem>
                          <MenuItem value="ADMIN">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                        <Switch 
                            checked={u.enabled} 
                            onChange={() => requestToggleStatus(u)} // Updated Handler
                            disabled={processingId === u.id} 
                            color="success" 
                        />
                        <Typography variant="caption" sx={{ ml: 1, color: u.enabled ? 'green' : 'red', fontWeight: 600 }}>
                            {u.enabled ? 'Active' : 'Banned'}
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Tooltip title={u.enabled ? "Ban User" : "Activate User"}>
                            <IconButton 
                                size="small" 
                                color={u.enabled ? "warning" : "success"}
                                onClick={() => requestToggleStatus(u)} // Updated Handler
                                disabled={processingId === u.id}
                            >
                                {u.enabled ? <BlockIcon /> : <CheckCircleIcon />}
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Permanently">
                            <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => requestDelete(u)} // Updated Handler
                                disabled={processingId === u.id}
                                sx={{ ml: 1 }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      {/* --- CUSTOM CONFIRMATION DIALOG --- */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon color="warning" />
            Confirm Action
        </DialogTitle>
        <DialogContent>
            <Typography>
                {confirmAction?.type === 'ban' && `Are you sure you want to ${confirmAction.user.enabled ? 'BAN' : 'ACTIVATE'} ${confirmAction.user.name}?`}
                {confirmAction?.type === 'delete' && `Are you sure you want to PERMANENTLY DELETE ${confirmAction.user.name}? This cannot be undone.`}
                {confirmAction?.type === 'role' && `Are you sure you want to change ${confirmAction.user.name}'s role to ${confirmAction.newRole}?`}
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
            <Button 
                onClick={handleConfirm} 
                variant="contained" 
                color={confirmAction?.type === 'delete' || (confirmAction?.type === 'ban' && confirmAction.user.enabled) ? "error" : "primary"}
                disableElevation
            >
                Confirm
            </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;
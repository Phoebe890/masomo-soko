import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    Stack, Alert, CircularProgress, Snackbar, Checkbox, IconButton, Tooltip, 
    alpha, useTheme, InputAdornment, OutlinedInput, MenuItem, Select, Divider
} from '@mui/material';
import { api } from '@/api/axios';
import AdminLayout from './AdminLayout';

// Icons
import CloudDownloadIcon from '@mui/icons-material/CloudDownloadOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CancelIcon from '@mui/icons-material/Cancel';
import AppNotification from '@/components/AppNotification';
// Define the Payout Data Type
interface Payout {
    id: number;
    teacherName: string;
    amount: number;
    mpesaNumber: string;
    date: string;
    status: 'PENDING' | 'PAID' | 'REJECTED';
    referenceNumber: string;
     transactionCode?: string;
}

const AdminPayouts = () => {
    const theme = useTheme();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Search & Filter State 
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal State
    const [open, setOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [isBulkAction, setIsBulkAction] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    // Brand Colors
    const BRAND_ORANGE = '#F97316';

    const fetchPayouts = () => {
        setLoading(true);
        api.get('/api/admin/payouts')
            .then(res => {
                setPayouts(res.data);
                setSelectedIds([]); 
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPayouts(); }, []);

    // --- FILTER LOGIC ---
    const filteredPayouts = payouts.filter(p => {
        const matchesSearch = p.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.mpesaNumber.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- SELECTION LOGIC ---
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            // Only select visible PENDING requests
            const pendingIds = filteredPayouts.filter(p => p.status === 'PENDING').map(p => p.id);
            setSelectedIds(pendingIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        const selectedIndex = selectedIds.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedIds, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedIds.slice(1));
        } else if (selectedIndex === selectedIds.length - 1) {
            newSelected = newSelected.concat(selectedIds.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedIds.slice(0, selectedIndex),
                selectedIds.slice(selectedIndex + 1),
            );
        }
        setSelectedIds(newSelected);
    };

    // --- CSV EXPORT LOGIC ---
    const handleExportCSV = () => {
        const itemsToExport = payouts.filter(p => selectedIds.includes(p.id));
        if (itemsToExport.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Name,Phone,Amount,Date\n";

        itemsToExport.forEach((row) => {
            const phone = row.mpesaNumber.startsWith('+') ? row.mpesaNumber.replace('+', '') : row.mpesaNumber;
            const date = new Date(row.date).toLocaleDateString();
            csvContent += `"${row.teacherName}",${phone},${row.amount},${date}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `mpesa_payouts_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- ACTION HANDLERS ---
    const handleSingleAction = (payout: Payout, type: 'approve' | 'reject') => {
        setIsBulkAction(false);
        setSelectedPayout(payout);
        setActionType(type);
        setNotes('');
        setOpen(true);
    };

    const handleBulkApproveClick = () => {
        setIsBulkAction(true);
        setActionType('approve');
        setNotes('Bulk Approval via Admin Console');
        setOpen(true);
    };

    const handleSubmit = async () => {
        setProcessing(true);
        try {
            if (isBulkAction) {
                const promises = selectedIds.map(id => 
                    api.post(`/api/admin/payouts/${id}/approve`, { notes })
                );
                await Promise.all(promises);
                setToast({ open: true, message: `Successfully processed ${selectedIds.length} payouts.`, severity: 'success' });
            } else {
                if (!selectedPayout) return;
                await api.post(`/api/admin/payouts/${selectedPayout.id}/${actionType}`, { notes });
                setToast({ open: true, message: 'Action processed successfully.', severity: 'success' });
            }
            
            setOpen(false);
            fetchPayouts();
        } catch (e) {
            console.error(e);
            setToast({ open: true, message: "Action failed. Some requests may not have completed.", severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const pendingCount = payouts.filter(p => p.status === 'PENDING').length;

    // Helper for Status Badge Style (DigiLab Style)
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { bg: alpha('#F59E0B', 0.1), color: '#B45309', dot: '#F59E0B' }; // Orange/Yellow
            case 'PAID':
                return { bg: alpha('#10B981', 0.1), color: '#059669', dot: '#10B981' }; // Green
            case 'REJECTED':
                return { bg: alpha('#6B7280', 0.1), color: '#374151', dot: '#6B7280' }; // Gray
            default:
                return { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' };
        }
    };

    return (
        <AdminLayout title="Payout Requests" selectedRoute="/admin/payouts">
            
            {/* 1. TOP HEADER & PENDING REQUESTS BANNER  */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                     <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#111827' }}>Payouts</Typography>
                        <Typography variant="body2" color="text.secondary">Manage withdrawal requests.</Typography>
                     </Box>
                     {selectedIds.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="outlined" 
                                size="small"
                                startIcon={<CloudDownloadIcon />} 
                                onClick={handleExportCSV}
                                sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151' }}
                            >
                                Export
                            </Button>
                            <Button 
                                variant="contained" 
                                size="small"
                                color="success" 
                                startIcon={<CheckCircleIcon />} 
                                onClick={handleBulkApproveClick}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Approve Selected ({selectedIds.length})
                            </Button>
                        </Box>
                     )}
                </Box>

                {pendingCount > 0 && (
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 2, borderRadius: 3, 
                            bgcolor: '#FFF7ED', 
                            border: '1px solid #FED7AA', 
                            display: 'flex', alignItems: 'center', gap: 2 
                        }}
                    >
                        <Box sx={{ p: 1, bgcolor: BRAND_ORANGE, borderRadius: '50%', color: 'white', display: 'flex' }}>
                            <MonetizationOnIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="#9A3412">
                                {pendingCount} Pending Requests
                            </Typography>
                            <Typography variant="caption" color="#C2410C">
                                Check the table below to approve pending withdrawals.
                            </Typography>
                        </Box>
                    </Paper>
                )}
            </Box>

            {/* 2. DIGILAB STYLE TOOLBAR */}
            <Paper 
                elevation={0} 
                sx={{ 
                    border: '1px solid #E5E7EB',
                    borderBottom: 'none',
                    borderTopLeftRadius: 12, 
                    borderTopRightRadius: 12,
                    p: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                    bgcolor: '#fff'
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <OutlinedInput
                        placeholder="Search teacher..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startAdornment={<InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>}
                        sx={{ 
                            bgcolor: '#fff', 
                            borderRadius: 1,
                            width: 250,
                            fieldset: { borderColor: '#E5E7EB' }
                        }}
                    />
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        displayEmpty
                        sx={{ minWidth: 120, bgcolor: '#fff', fieldset: { borderColor: '#E5E7EB' } }}
                    >
                        <MenuItem value="All">Filter: All</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="PAID">Paid</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                    </Select>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={<RefreshIcon />} onClick={fetchPayouts} sx={{ color: '#6B7280', textTransform: 'none' }}>
                        Refresh
                    </Button>
                    <IconButton size="small" sx={{ border: '1px solid #E5E7EB', borderRadius: 1 }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Paper>

            {/* 3. CLEAN TABLE DESIGN */}
            <Paper 
                elevation={0} 
                sx={{ 
                    border: '1px solid #E5E7EB',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 12, 
                    borderBottomRightRadius: 12,
                    overflow: 'hidden'
                }}
            >
                {loading ? <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box> : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                {/* Light Gray Header */}
                                <TableRow sx={{ bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            size="small"
                                            indeterminate={selectedIds.length > 0 && selectedIds.length < filteredPayouts.filter(p => p.status === 'PENDING').length}
                                            checked={filteredPayouts.length > 0 && selectedIds.length === filteredPayouts.filter(p => p.status === 'PENDING').length}
                                            onChange={handleSelectAll}
                                            disabled={filteredPayouts.filter(p => p.status === 'PENDING').length === 0}
                                        />
                                    </TableCell>
                                     <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Ref #</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teacher</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>M-Pesa</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                                    <TableCell align="right" sx={{ color: '#6B7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPayouts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                            No payout requests found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayouts.map((p) => {
                                        const isItemSelected = selectedIds.indexOf(p.id) !== -1;
                                        const isPending = p.status === 'PENDING';
                                        const statusStyle = getStatusStyle(p.status);

                                        return (
                                            <TableRow 
                                                key={p.id} 
                                                hover 
                                                selected={isItemSelected}
                                                sx={{ 
                                                    '&:hover': { bgcolor: '#F9FAFB' },
                                                    '&.Mui-selected': { bgcolor: '#EFF6FF' },
                                                    '&.Mui-selected:hover': { bgcolor: '#DBEAFE' },
                                                    borderBottom: '1px solid #F3F4F6'
                                                }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        size="small"
                                                        color="primary"
                                                        checked={isItemSelected}
                                                        onChange={() => handleSelectOne(p.id)}
                                                        disabled={!isPending}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                {p.referenceNumber || `REF-${p.id}`}
            </TableCell>

                                                <TableCell sx={{ fontWeight: 500, color: '#111827' }}>
                {p.teacherName}
                {p.transactionCode && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#10B981', fontWeight: 800 }}>
                        Code: {p.transactionCode}
                    </Typography>
                )}
            </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: '#1F2937' }}>
                                                    KES {p.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ color: '#4B5563', fontFamily: 'monospace' }}>
                                                    {p.mpesaNumber}
                                                </TableCell>
                                                <TableCell sx={{ color: '#6B7280' }}>
                                                    {new Date(p.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {/* Custom Pill Style Chip */}
                                                    <Box sx={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        px: 1.5, 
                                                        py: 0.5, 
                                                        borderRadius: 4,
                                                        bgcolor: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusStyle.dot, mr: 1 }} />
                                                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {isPending && (
                                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                                            <Tooltip title="Approve">
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleSingleAction(p, 'approve')}
                                                                    sx={{ color: '#10B981', '&:hover': { bgcolor: alpha('#10B981', 0.1) } }}
                                                                >
                                                                    <CheckCircleIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Reject">
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleSingleAction(p, 'reject')}
                                                                    sx={{ color: '#EF4444', '&:hover': { bgcolor: alpha('#EF4444', 0.1) } }}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
                {/* Footer */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB' }}>
                    <Typography variant="caption" color="text.secondary">
                        Displaying {filteredPayouts.length} results
                    </Typography>
                </Box>
            </Paper>

            {/* DIALOGS  */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {isBulkAction 
                        ? `Confirm Bulk Payout` 
                        : (actionType === 'approve' ? 'Confirm Payout' : 'Reject Request')}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2, mt: 1 }}>
                        {isBulkAction 
                            ? `Mark ${selectedIds.length} requests as PAID?`
                            : (actionType === 'approve' ? `Confirm payment of KES ${selectedPayout?.amount} to ${selectedPayout?.teacherName}?` : 'Refund to wallet?')
                        }
                    </Typography>
                    <TextField 
                        label="Notes / Transaction Code" 
                        fullWidth 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        size="small" 
                        placeholder="Transaction Ref"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color={actionType === 'approve' || isBulkAction ? 'success' : 'error'} 
                        disabled={processing}
                        sx={{ borderRadius: 2 }}
                    >
                        {processing ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

          {/* CONSISTENT ECITIZEN STYLE NOTIFICATION */}
            <AppNotification 
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={() => setToast({ ...toast, open: false })}
            />
        </AdminLayout>
    );
};

export default AdminPayouts;
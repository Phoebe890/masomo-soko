import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    Stack, Alert, CircularProgress, Snackbar, Checkbox, IconButton, Tooltip
} from '@mui/material';
import { api } from '@/api/axios';
import AdminLayout from './AdminLayout';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

// Define the Payout Data Type
interface Payout {
    id: number;
    teacherName: string;
    amount: number;
    mpesaNumber: string;
    date: string;
    status: 'PENDING' | 'PAID' | 'REJECTED';
}

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Modal State
    const [open, setOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null); // For single action
    const [isBulkAction, setIsBulkAction] = useState(false); // Flag for bulk vs single
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const fetchPayouts = () => {
        setLoading(true);
        api.get('/api/admin/payouts')
            .then(res => {
                setPayouts(res.data);
                setSelectedIds([]); // Reset selection on refresh
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPayouts(); }, []);

    // --- SELECTION LOGIC ---
    
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            // Only select PENDING requests
            const pendingIds = payouts.filter(p => p.status === 'PENDING').map(p => p.id);
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

        // Create CSV Header and Rows
        // Format: Name, Phone, Amount, Reference
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Name,Phone,Amount,Date\n";

        itemsToExport.forEach((row) => {
            const phone = row.mpesaNumber.startsWith('+') ? row.mpesaNumber.replace('+', '') : row.mpesaNumber;
            const date = new Date(row.date).toLocaleDateString();
            csvContent += `"${row.teacherName}",${phone},${row.amount},${date}\n`;
        });

        // Trigger Download
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
                // BULK LOGIC: Loop through IDs and approve them
                // Note: Ideally, create a backend endpoint like /api/admin/payouts/bulk-approve
                const promises = selectedIds.map(id => 
                    api.post(`/api/admin/payouts/${id}/approve`, { notes })
                );
                await Promise.all(promises);
                setToast({ open: true, message: `Successfully processed ${selectedIds.length} payouts.`, severity: 'success' });
            } else {
                // SINGLE LOGIC
                if (!selectedPayout) return;
                await api.post(`/api/admin/payouts/${selectedPayout.id}/${actionType}`, { notes });
                setToast({ open: true, message: 'Action processed successfully.', severity: 'success' });
            }
            
            setOpen(false);
            fetchPayouts(); // Refresh list
        } catch (e) {
            console.error(e);
            setToast({ open: true, message: "Action failed. Some requests may not have completed.", severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    const pendingCount = payouts.filter(p => p.status === 'PENDING').length;

    return (
        <AdminLayout title="Payout Requests" selectedRoute="/admin/payouts">
            
            {/* TOP BAR ACTIONS */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Pending Requests: {pendingCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Select requests to perform bulk actions</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button startIcon={<RefreshIcon />} onClick={fetchPayouts}>Refresh</Button>
                    
                    {selectedIds.length > 0 && (
                        <>
                            <Button 
                                variant="outlined" 
                                startIcon={<CloudDownloadIcon />} 
                                onClick={handleExportCSV}
                            >
                                Export CSV ({selectedIds.length})
                            </Button>
                            <Button 
                                variant="contained" 
                                color="success" 
                                startIcon={<CheckCircleIcon />} 
                                onClick={handleBulkApproveClick}
                            >
                                Pay Selected ({selectedIds.length})
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {loading ? <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box> : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={selectedIds.length > 0 && selectedIds.length < pendingCount}
                                            checked={pendingCount > 0 && selectedIds.length === pendingCount}
                                            onChange={handleSelectAll}
                                            disabled={pendingCount === 0}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Teacher</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>M-Pesa</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payouts.map((p) => {
                                    const isItemSelected = selectedIds.indexOf(p.id) !== -1;
                                    const isPending = p.status === 'PENDING';

                                    return (
                                        <TableRow 
                                            key={p.id} 
                                            hover 
                                            selected={isItemSelected}
                                            sx={{ '&.Mui-selected': { bgcolor: 'rgba(16, 185, 129, 0.08)' } }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    onChange={() => handleSelectOne(p.id)}
                                                    disabled={!isPending} // Disable if already paid/rejected
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{p.teacherName}</TableCell>
                                            <TableCell>KES {p.amount.toLocaleString()}</TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{p.mpesaNumber}</TableCell>
                                            <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={p.status} 
                                                    size="small" 
                                                    color={p.status === 'PENDING' ? 'warning' : p.status === 'PAID' ? 'success' : 'error'}
                                                    sx={{ fontWeight: 700, borderRadius: 1 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {isPending && (
                                                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                                        <Button size="small" variant="contained" color="success" onClick={() => handleSingleAction(p, 'approve')}>Pay</Button>
                                                        <Button size="small" variant="outlined" color="error" onClick={() => handleSingleAction(p, 'reject')}>Reject</Button>
                                                    </Stack>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {payouts.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>No payouts found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {isBulkAction 
                        ? `Confirm Bulk Payout (${selectedIds.length} items)` 
                        : (actionType === 'approve' ? 'Confirm Payout' : 'Reject Request')}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2, mt: 1 }}>
                        {isBulkAction 
                            ? `Are you sure you want to mark ${selectedIds.length} requests as PAID? This cannot be undone.`
                            : (actionType === 'approve' ? `Confirm payment of KES ${selectedPayout?.amount}?` : 'Refund to teacher wallet?')
                        }
                    </Typography>
                    <TextField 
                        label="Notes / Transaction Code" 
                        fullWidth 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        size="small" 
                        placeholder={isBulkAction ? "e.g. Bulk processing batch #123" : "Transaction Ref"}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color={actionType === 'approve' || isBulkAction ? 'success' : 'error'} 
                        disabled={processing}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
            </Snackbar>
        </AdminLayout>
    );
};

export default AdminPayouts;
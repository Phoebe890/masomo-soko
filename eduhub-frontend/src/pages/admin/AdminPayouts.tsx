import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from '@mui/material';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState<any[]>([]);

    const fetchPayouts = () => {
        axios.get('http://localhost:8081/api/admin/payouts', { withCredentials: true })
            .then(res => setPayouts(res.data));
    };

    useEffect(() => { fetchPayouts(); }, []);

    const handleAction = (id: number, action: string) => {
        if(!window.confirm(`Are you sure you want to ${action} this request?`)) return;
        axios.post(`http://localhost:8081/api/admin/payouts/${id}/${action}`, {}, { withCredentials: true })
            .then(() => { alert("Success"); fetchPayouts(); });
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AdminSidebar selected="/admin/payouts" />
            <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>Payout Requests</Typography>
                <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                            <TableRow>
                                <TableCell>Teacher</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>M-Pesa</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payouts.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell sx={{ fontWeight: 600 }}>{p.teacherName}</TableCell>
                                    <TableCell>KES {p.amount}</TableCell>
                                    <TableCell>{p.mpesaNumber}</TableCell>
                                    <TableCell>
                                        <Chip label={p.status} color={p.status === 'PENDING' ? 'warning' : 'success'} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {p.status === 'PENDING' && (
                                            <>
                                                <Button size="small" color="success" onClick={() => handleAction(p.id, 'approve')}>Pay</Button>
                                                <Button size="small" color="error" onClick={() => handleAction(p.id, 'reject')}>Reject</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>
        </Box>
    );
};

export default AdminPayouts;
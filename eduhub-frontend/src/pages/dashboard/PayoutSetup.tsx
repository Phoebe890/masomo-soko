import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, MenuItem, FormControl, InputLabel, Select, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { api } from '@/api/axios'; 

const PayoutSetup: React.FC = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('mpesa');
  const [mpesa, setMpesa] = useState('');
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const email = localStorage.getItem('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'mpesa' && !mpesa.trim()) {
      setError('Please enter your M-Pesa number.');
      return;
    }
    if (method === 'bank' && (!bank.trim() || !account.trim())) {
      setError('Please enter your bank and account number.');
      return;
    }
    
    try {
     
      // Axios handles FormData automatically
      const formData = new FormData();
      formData.append('email', email);
      formData.append('method', method);
      if (method === 'mpesa') formData.append('mpesa', mpesa);
      if (method === 'bank') {
        formData.append('bank', bank);
        formData.append('account', account);
      }

      await api.post('/api/teacher/payout', formData);
      
      localStorage.setItem('payoutSet', 'true');
      navigate('/dashboard/teacher');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to save payout details.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: { xs: '100vh', md: '80vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 6 } }}>
      <Box sx={{ width: '100%', mt: { xs: 2, md: 8 } }}>
        <Stepper activeStep={2} alternativeLabel sx={{ mb: { xs: 2, md: 4 } }}>
          <Step key="Profile"><StepLabel>Profile</StepLabel></Step>
          <Step key="Upload"><StepLabel>Upload Resource</StepLabel></Step>
          <Step key="Payout"><StepLabel>Payout Setup</StepLabel></Step>
          <Step key="Done"><StepLabel>Done</StepLabel></Step>
        </Stepper>
        <form onSubmit={handleSubmit}>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center">Set Up Your Payout Method</Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Payout Method</InputLabel>
            <Select value={method} onChange={e => setMethod(e.target.value)} label="Payout Method">
              <MenuItem value="mpesa">M-Pesa</MenuItem>
              <MenuItem value="bank">Bank Account</MenuItem>
            </Select>
          </FormControl>
          {method === 'mpesa' && (
            <TextField fullWidth label="M-Pesa Number" value={mpesa} onChange={e => setMpesa(e.target.value)} sx={{ mb: 3 }} required />
          )}
          {method === 'bank' && (
            <>
              <TextField fullWidth label="Bank Name" value={bank} onChange={e => setBank(e.target.value)} sx={{ mb: 3 }} required />
              <TextField fullWidth label="Account Number" value={account} onChange={e => setAccount(e.target.value)} sx={{ mb: 3 }} required />
            </>
          )}
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mb: 2, fontWeight: 700 }}>Save Payout Details</Button>
          <Button variant="text" color="secondary" fullWidth size="large" onClick={() => { localStorage.setItem('payoutSet', 'false'); navigate('/dashboard/teacher'); }}>I'll do this later</Button>
        </form>
      </Box>
    </Container>
  );
};

export default PayoutSetup;
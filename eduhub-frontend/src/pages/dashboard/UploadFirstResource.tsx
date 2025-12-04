import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, MenuItem, Select, InputLabel, FormControl, RadioGroup, FormControlLabel, Radio, Grid, Chip, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const SUBJECTS = [
  'Math', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Art', 'Music', 'ICT', 'Business', 'CRE', 'Physics', 'Chemistry', 'Biology', 'Other'
];

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Other'
];

const CURRICULA = [
  'CBC', '8-4-4', 'IGCSE', 'KCSE', 'Other'
];

const UploadFirstResource: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<string[]>([]);
  const [grade, setGrade] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [pricing, setPricing] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const email = localStorage.getItem('email') || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubjectChange = (e: any) => {
    setSubject(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file || !title.trim() || !description.trim() || subject.length === 0 || !grade || !curriculum || (pricing === 'paid' && !price)) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', subject.join(','));
      formData.append('grade', grade);
      formData.append('curriculum', curriculum);
      formData.append('pricing', pricing);
      if (pricing === 'paid') formData.append('price', price);
      formData.append('email', email);
      const response = await fetch('/api/teacher/resources', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) throw new Error(await response.text());
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/teacher');
      }, 1800);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to upload resource.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: { xs: '100vh', md: '80vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 6 } }}>
      <Box sx={{ width: '100%', mt: { xs: 2, md: 8 } }}>
        <Stepper activeStep={1} alternativeLabel sx={{ mb: { xs: 2, md: 4 } }}>
          <Step key="Profile">
            <StepLabel>Profile</StepLabel>
          </Step>
          <Step key="Upload">
            <StepLabel>Upload Resource</StepLabel>
          </Step>
          <Step key="Payout">
            <StepLabel>Payout Setup</StepLabel>
          </Step>
          <Step key="Done">
            <StepLabel>Done</StepLabel>
          </Step>
        </Stepper>
        {success ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h4" fontWeight={700} color="success.main" gutterBottom>
              Congratulations!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Your resource is now live in the marketplace.
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography variant="h4" fontWeight={700} gutterBottom align="center">
              Upload Your First Resource
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Share your expertise and help students succeed. Uploading your first resource is the best way to start earning and making an impact!
            </Typography>
            <FormControl fullWidth sx={{ mb: { xs: 2, md: 3 } }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 3, fontSize: '1.1rem', borderStyle: 'dashed', borderWidth: 2 }}
              >
                {file ? file.name : 'Choose File or Drag & Drop'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Accepted formats: .pdf, .doc, .docx
              </Typography>
            </FormControl>
            <TextField
              fullWidth
              label="Resource Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{ mb: { xs: 2, md: 3 } }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              minRows={3}
              maxRows={6}
              value={description}
              onChange={e => setDescription(e.target.value)}
              sx={{ mb: { xs: 2, md: 3 } }}
              required
              placeholder="Describe the content, purpose, and audience of your resource."
            />
            <FormControl fullWidth sx={{ mb: { xs: 2, md: 3 } }}>
              <InputLabel>Subject</InputLabel>
              <Select
                multiple
                value={subject}
                onChange={handleSubjectChange}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map(value => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {SUBJECTS.map(subj => (
                  <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: { xs: 2, md: 3 } }}>
              <InputLabel>Grade/Level</InputLabel>
              <Select
                value={grade}
                onChange={e => setGrade(e.target.value)}
                required
              >
                {GRADES.map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: { xs: 2, md: 3 } }}>
              <InputLabel>Curriculum</InputLabel>
              <Select
                value={curriculum}
                onChange={e => setCurriculum(e.target.value)}
                required
              >
                {CURRICULA.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl component="fieldset" sx={{ mb: { xs: 2, md: 3 } }}>
              <RadioGroup
                row
                value={pricing}
                onChange={e => setPricing(e.target.value as 'free' | 'paid')}
              >
                <FormControlLabel value="free" control={<Radio />} label="Free" />
                <FormControlLabel value="paid" control={<Radio />} label="Set a Price" />
              </RadioGroup>
              {pricing === 'paid' && (
                <TextField
                  type="number"
                  label="Price (KES)"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  sx={{ mt: 2, maxWidth: 200 }}
                  required
                  inputProps={{ min: 1 }}
                />
              )}
            </FormControl>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ minHeight: 48, fontSize: { xs: '1rem', md: '1.1rem' } }}
                >
                  {loading ? 'Publishing...' : 'Publish Resource'}
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="text"
                  color="secondary"
                  fullWidth
                  size="large"
                  onClick={() => {
                    localStorage.setItem('resourceSkipped', 'true');
                    navigate('/dashboard/teacher');
                  }}
                  sx={{ minHeight: 48, fontSize: { xs: '1rem', md: '1.1rem' } }}
                >
                  I'll do this later
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Box>
    </Container>
  );
};

export default UploadFirstResource;
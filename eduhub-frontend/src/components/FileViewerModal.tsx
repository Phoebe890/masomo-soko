import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface FileViewerProps {
    open: boolean;
    onClose: () => void;
    fileUrl: string;
    title: string;
}

const FileViewerModal: React.FC<FileViewerProps> = ({ open, onClose, fileUrl, title }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Helper to check extensions safely (ignoring query params like ?token=123)
    const getExtension = (url: string) => {
        return url.split(/[#?]/)[0].split('.').pop()?.trim().toLowerCase();
    };

    const ext = getExtension(fileUrl);
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    const isPdf = ext === 'pdf';
    
    // Google Viewer is needed for Office docs (Docx, Pptx, Xlsx)
    const isOfficeDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(ext || '');

    const handleLoad = () => setLoading(false);
    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="lg" 
            PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee', bgcolor: 'white' }}>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1, maxWidth: '70%' }}>
                    {title}
                </Typography>
                <Box>
                    <Button 
                        startIcon={<DownloadIcon />} 
                        href={fileUrl} 
                        target="_blank" 
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Download
                    </Button>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', flexGrow: 1, overflow: 'hidden' }}>
                
                {loading && !error && (
                    <Box sx={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularProgress />
                        <Typography variant="caption" sx={{ mt: 2 }}>Loading Preview...</Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="warning" action={
                        <Button color="inherit" size="small" href={fileUrl} target="_blank" endIcon={<OpenInNewIcon />}>
                            Open Externally
                        </Button>
                    }>
                        Preview not available for this file type.
                    </Alert>
                )}

                {/* 1. IMAGE VIEWER */}
                {isImage && (
                    <img 
                        src={fileUrl} 
                        alt="Preview" 
                        onLoad={handleLoad}
                        onError={handleError}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                )}

                {/* 2. PDF VIEWER (Native Browser - Works on Localhost) */}
                {isPdf && (
                    <object
                        data={fileUrl}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        onLoad={handleLoad}
                        onError={handleError}
                        style={{ display: loading ? 'none' : 'block' }}
                    >
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography>Your browser does not support PDF previews.</Typography>
                            <Button href={fileUrl} target="_blank" sx={{ mt: 2 }}>Download PDF</Button>
                        </Box>
                    </object>
                )}

                {/* 3. OFFICE DOCS (Google Viewer - Only works in Production) */}
                {isOfficeDoc && (
                    <iframe 
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`} 
                        style={{ width: '100%', height: '100%', border: 'none', display: loading ? 'none' : 'block' }} 
                        title="File Preview"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                )}

                {/* 4. FALLBACK */}
                {!isImage && !isPdf && !isOfficeDoc && (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Typography variant="h6" gutterBottom>No preview available</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            This file type cannot be previewed in the browser.
                        </Typography>
                        <Button variant="contained" startIcon={<DownloadIcon />} href={fileUrl} target="_blank">
                            Download File
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FileViewerModal;
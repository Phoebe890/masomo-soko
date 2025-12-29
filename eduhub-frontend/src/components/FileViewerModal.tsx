import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';

interface FileViewerProps {
    open: boolean;
    onClose: () => void;
    fileUrl: string;
    title: string;
}

const FileViewerModal: React.FC<FileViewerProps> = ({ open, onClose, fileUrl, title }) => {
    
    const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
    // Treat PDF same as Docs for Google Viewer to ensure it renders without download
    const isDocOrPdf = !isImage; 

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { height: '90vh' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
                <Box sx={{ flexGrow: 1, typography: 'h6' }}>{title}</Box> {/* Fixed Nesting Error */}
                <Box>
                    <Button 
                        startIcon={<DownloadIcon />} 
                        href={fileUrl} 
                        target="_blank" 
                        sx={{ mr: 1 }}
                    >
                        Download
                    </Button>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isImage ? (
                    <img src={fileUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                    // Universal Viewer (PDF, DOC, PPT)
                    <iframe 
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`} 
                        style={{ width: '100%', height: '100%', border: 'none' }} 
                        title="File Preview"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FileViewerModal;
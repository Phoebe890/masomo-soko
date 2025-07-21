package com.eduhub.eduhub_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileUploadService {

    @Autowired
    private Cloudinary cloudinary;

    public Map uploadFile(MultipartFile file) throws IOException {
        // For non-image files like PDF/DOC, Cloudinary treats them as "raw" files.
        // Using "auto" is the easiest way to let Cloudinary figure it out.
        // We put them in a folder for better organization in your Cloudinary media library.
        Map params = ObjectUtils.asMap(
            "resource_type", "auto",
            "folder", "eduhub_resources"
        );
        return cloudinary.uploader().upload(file.getBytes(), params);
    }
}
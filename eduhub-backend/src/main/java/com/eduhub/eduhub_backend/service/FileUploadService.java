package com.eduhub.eduhub_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
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
        return uploadToCloudinary(file, "eduhub_resources");
    }

   
    public String uploadFile(MultipartFile file, String folderName) throws IOException {
        Map result = uploadToCloudinary(file, folderName);
        return (String) result.get("secure_url"); // Return the direct URL string
    }

    
    private Map uploadToCloudinary(MultipartFile file, String folder) throws IOException {
        try {
            String publicId = UUID.randomUUID().toString();

            Map params = ObjectUtils.asMap(
                "resource_type", "auto",
                "folder", folder,
                "public_id", publicId, 
                "use_filename", true,
                "unique_filename", false
            );

            return cloudinary.uploader().upload(file.getBytes(), params);
        } catch (Exception e) {
            System.err.println("Cloudinary Upload Error: " + e.getMessage());
            throw new IOException("Cloudinary upload failed: " + e.getMessage());
        }
    }

    public String generatePreviewImageUrl(Map uploadResult) {
        String publicId = (String) uploadResult.get("public_id");
        String format = (String) uploadResult.get("format");

        if (publicId == null) return null;

        // Generate thumbnail for Documents
        if ("pdf".equals(format) || "doc".equals(format) || "docx".equals(format) || "ppt".equals(format) || "pptx".equals(format)) {
            return cloudinary.url()
                    .transformation(new Transformation<>()
                            .page("1").width(400).crop("limit").fetchFormat("jpg")
                    )
                    .generate(publicId);
        }

        return (String) uploadResult.get("secure_url");
    }
}
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
        Map params = ObjectUtils.asMap(
            "resource_type", "auto",
            "folder", "eduhub_resources"
        );
        return cloudinary.uploader().upload(file.getBytes(), params);
    }

    public String generatePreviewImageUrl(Map uploadResult) {
        String publicId = (String) uploadResult.get("public_id");
        String format = (String) uploadResult.get("format");

        if (publicId == null) {
            return null;
        }

        if ("pdf".equals(format) || "doc".equals(format) || "docx".equals(format) || "ppt".equals(format) || "pptx".equals(format)) {
            return cloudinary.url()
                    .transformation(new Transformation<>()
                            .page("1")
                            .width(400)
                            .crop("limit")
                            .fetchFormat("jpg")
                    )
                    .generate(publicId);
        }

        if ("jpg".equals(format) || "jpeg".equals(format) || "png".equals(format) || "gif".equals(format)) {
            return (String) uploadResult.get("secure_url");
        }
        
        return null;
    }
}
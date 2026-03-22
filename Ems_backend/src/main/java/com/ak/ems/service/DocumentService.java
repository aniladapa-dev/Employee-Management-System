package com.ak.ems.service;

import com.ak.ems.dto.DocumentDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface DocumentService {
    DocumentDto uploadDocument(Long employeeId, MultipartFile file);
    List<DocumentDto> getDocumentsByEmployee(Long employeeId);
    Resource downloadDocument(Long documentId);
    DocumentDto getDocumentInfo(Long documentId);
}

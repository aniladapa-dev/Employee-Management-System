package com.ak.ems.controller;
import com.ak.ems.dto.DocumentDto;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDto>> uploadDocument(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("file") MultipartFile file) {
        DocumentDto doc = documentService.uploadDocument(employeeId, file);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", doc));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByEmployee(@PathVariable("employeeId") Long employeeId) {
        List<DocumentDto> docs = documentService.getDocumentsByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success("Documents fetched successfully", docs));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable("id") Long id) {
        Resource file = documentService.downloadDocument(id);
        DocumentDto info = documentService.getDocumentInfo(id);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + info.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(info.getFileType() != null ? info.getFileType() : "application/octet-stream"))
                .body(file);
    }
}

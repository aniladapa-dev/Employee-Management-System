package com.ak.ems.service.impl;

import com.ak.ems.entity.Attendance;
import com.ak.ems.entity.Employee;
import com.ak.ems.entity.LeaveRequest;
import com.ak.ems.entity.Department;
import com.ak.ems.entity.Team;
import com.ak.ems.repository.AttendanceRepository;
import com.ak.ems.repository.EmployeeRepository;
import com.ak.ems.repository.LeaveRequestRepository;
import com.ak.ems.service.ReportService;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.ICSVWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.FileWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    private void logError(String message, Throwable t) {
        try (PrintWriter pw = new PrintWriter(new FileWriter("/tmp/ems_report_error.log", true))) {
            pw.println("--- " + java.time.LocalDateTime.now() + " ---");
            pw.println(message);
            if (t != null) {
                t.printStackTrace(pw);
            }
            pw.println("-------------------------------------------");
        } catch (IOException e) {
            // Fallback to standard error if file logging fails
            System.err.println("Failed to log error to file: " + e.getMessage());
        }
    }

    private String safeGet(Object o) {
        return o != null ? o.toString() : "";
    }

    private String safeGetName(Department d) {
        return (d != null && d.getName() != null) ? d.getName() : "N/A";
    }

    private String safeGetName(Team t) {
        return (t != null && t.getName() != null) ? t.getName() : "N/A";
    }

    @Override
    public ByteArrayInputStream generateEmployeeCsvReport(Long departmentId, Long teamId) {
        try {
            List<Employee> employees = employeeRepository.findEmployeesForReport(departmentId, teamId);
            StringWriter out = new StringWriter();
            
            try (ICSVWriter writer = new CSVWriterBuilder(out).build()) {
                String[] header = {"ID", "Name", "Email", "Department", "Team", "Designation", "Joining Date"};
                writer.writeNext(header);

                for (Employee e : employees) {
                    if (e == null) continue;
                    String lastName = e.getLastName();
                    String fullName = (e.getFirstName() != null ? e.getFirstName() : "") + (lastName != null ? " " + lastName : "");
                    writer.writeNext(new String[]{
                            safeGet(e.getId()),
                            fullName,
                            safeGet(e.getEmail()),
                            safeGetName(e.getDepartment()),
                            safeGetName(e.getTeam()),
                            safeGet(e.getDesignation()),
                            e.getJoiningDate() != null ? e.getJoiningDate().toString() : "N/A"
                    });
                }
            } catch (IOException e) {
                logError("Error generating CSV in writer", e);
                throw new RuntimeException("Error generating CSV: " + e.getMessage());
            }

            return new ByteArrayInputStream(out.toString().getBytes());
        } catch (Exception e) {
            logError("Unexpected error in generateEmployeeCsvReport", e);
            throw e;
        }
    }

    @Override
    public ByteArrayInputStream generateAttendanceExcelReport(int month, int year, Long departmentId, Long teamId) {
        try {
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.plusMonths(1).minusDays(1);
            List<Attendance> attendances = attendanceRepository.findAttendanceForReport(start, end, departmentId, teamId);

            try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                Sheet sheet = workbook.createSheet("Attendance Report");

                // Header Style
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);

                // Header
                Row headerRow = sheet.createRow(0);
                String[] columns = {"ID", "Employee", "Department", "Team", "Date", "Status", "Check In", "Check Out"};
                for (int i = 0; i < columns.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(columns[i]);
                    cell.setCellStyle(headerStyle);
                }

                int rowIdx = 1;
                for (Attendance a : attendances) {
                    if (a == null) continue;
                    Employee emp = a.getEmployee();
                    if (emp == null) continue;
                    
                    String lastName = emp.getLastName();
                    String fullName = (emp.getFirstName() != null ? emp.getFirstName() : "") + (lastName != null ? " " + lastName : "");

                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(safeGet(a.getId()));
                    row.createCell(1).setCellValue(fullName);
                    row.createCell(2).setCellValue(safeGetName(emp.getDepartment()));
                    row.createCell(3).setCellValue(safeGetName(emp.getTeam()));
                    row.createCell(4).setCellValue(a.getDate() != null ? a.getDate().toString() : "");
                    row.createCell(5).setCellValue(a.getStatus() != null ? a.getStatus().toString() : "");
                    row.createCell(6).setCellValue(a.getCheckIn() != null ? a.getCheckIn().toString() : "");
                    row.createCell(7).setCellValue(a.getCheckOut() != null ? a.getCheckOut().toString() : "");
                }

                workbook.write(out);
                return new ByteArrayInputStream(out.toByteArray());
            } catch (IOException e) {
                logError("Error generating Excel in workbook", e);
                throw new RuntimeException("Error generating Excel: " + e.getMessage());
            }
        } catch (Exception e) {
            logError("Unexpected error in generateAttendanceExcelReport", e);
            throw e;
        }
    }

    @Override
    public ByteArrayInputStream generateLeaveCsvReport(Long departmentId, Long teamId) {
        try {
            List<LeaveRequest> leaves = leaveRequestRepository.findLeavesForReport(departmentId, teamId);
            StringWriter out = new StringWriter();

            try (ICSVWriter writer = new CSVWriterBuilder(out).build()) {
                String[] header = {"ID", "Employee", "Department", "Team", "Type", "Start Date", "End Date", "Status", "Reason"};
                writer.writeNext(header);

                for (LeaveRequest l : leaves) {
                    if (l == null) continue;
                    Employee emp = l.getEmployee();
                    if (emp == null) continue;
                    
                    String lastName = emp.getLastName();
                    String fullName = (emp.getFirstName() != null ? emp.getFirstName() : "") + (lastName != null ? " " + lastName : "");
                    
                    writer.writeNext(new String[]{
                            safeGet(l.getId()),
                            fullName,
                            safeGetName(emp.getDepartment()),
                            safeGetName(emp.getTeam()),
                            l.getLeaveType() != null ? l.getLeaveType().toString() : "",
                            l.getStartDate() != null ? l.getStartDate().toString() : "",
                            l.getEndDate() != null ? l.getEndDate().toString() : "",
                            l.getStatus() != null ? l.getStatus().toString() : "",
                            l.getReason() != null ? l.getReason() : ""
                    });
                }
            } catch (IOException e) {
                logError("Error generating CSV in writer (leaves)", e);
                throw new RuntimeException("Error generating CSV: " + e.getMessage());
            }

            return new ByteArrayInputStream(out.toString().getBytes());
        } catch (Exception e) {
            logError("Unexpected error in generateLeaveCsvReport", e);
            throw e;
        }
    }
}

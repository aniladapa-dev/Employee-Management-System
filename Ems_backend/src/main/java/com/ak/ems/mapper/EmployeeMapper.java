package com.ak.ems.mapper;

import com.ak.ems.dto.EmployeeDto;
import com.ak.ems.entity.Employee;

//A Mapper is used to convert one object into another, most commonly:
// Entity ↔ DTO

public class EmployeeMapper {

    public static EmployeeDto maptoEmployeeDto(Employee employee){
        return new EmployeeDto(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail()
        );
    }

    public static Employee maptoEmployee(EmployeeDto employeeDto){
        return new Employee(
                employeeDto.getId(),
                employeeDto.getFirstName(),
                employeeDto.getLastName(),
                employeeDto.getEmail()
        );
    }


}

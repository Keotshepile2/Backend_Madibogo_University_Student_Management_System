-- Create database
CREATE DATABASE student_record_system;
USE student_record_system;

-- Faculties table
CREATE TABLE Faculties (
    Faculty_Code VARCHAR(10) PRIMARY KEY,
    Faculty_Name VARCHAR(100) NOT NULL
);

-- Programmes table
CREATE TABLE Programmes (
    Programme_Code VARCHAR(10) PRIMARY KEY,
    Programme_Name VARCHAR(100) NOT NULL,
    Faculty_Code VARCHAR(10),
    Duration_Years INT,
    FOREIGN KEY (Faculty_Code) REFERENCES Faculties(Faculty_Code)
);

-- Students table
CREATE TABLE Students (
    Student_ID INT IDENTITY(1,1) PRIMARY KEY,
    Student_Name VARCHAR(100) NOT NULL,
    Date_of_Birth DATE,
    Email_Address VARCHAR(100) UNIQUE NOT NULL,
    Contact_Number VARCHAR(20),
    Programme_Code VARCHAR(10),
    Year_Enrolled INT,
    Enrollment_Status VARCHAR(20) DEFAULT 'Active' CHECK (Enrollment_Status IN ('Active', 'Inactive', 'Graduated', 'Withdrawn')),
    Password VARCHAR(255),
    FOREIGN KEY (Programme_Code) REFERENCES Programmes(Programme_Code)
);

-- Admins table
CREATE TABLE Admins (
    Admin_ID INT IDENTITY(1,1) PRIMARY KEY,
    Admin_Name VARCHAR(100) NOT NULL,
    Email_Address VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255)
);

-- Semesters table
CREATE TABLE Semesters (
    Semester_Code VARCHAR(10) PRIMARY KEY,
    Academic_Year INT NOT NULL,
    Semester_Number INT NOT NULL CHECK (Semester_Number IN (1, 2)),
    Start_Date DATE,
    End_Date DATE
);

-- Modules table
CREATE TABLE Modules (
    Module_Code VARCHAR(20) PRIMARY KEY,
    Module_Name VARCHAR(100) NOT NULL,
    Module_Description TEXT,
    Credit_Hours INT NOT NULL,
    Year_Level INT NOT NULL,
    Semester_Offered INT CHECK (Semester_Offered IN (1, 2)),
    Programme_Code VARCHAR(10),
    FOREIGN KEY (Programme_Code) REFERENCES Programmes(Programme_Code)
);

-- Student_Enrollments table
CREATE TABLE Student_Enrollments (
    Enrollment_ID INT IDENTITY(1,1) PRIMARY KEY,
    Student_ID INT,
    Module_Code VARCHAR(20),
    Semester_Code VARCHAR(10),
    Mark_Obtained DECIMAL(5,2) NULL,
    Grade VARCHAR(2) NULL,
    Enrollment_Date DATE DEFAULT GETDATE(),
    Status VARCHAR(20) DEFAULT 'Enrolled' CHECK (Status IN ('Enrolled', 'Completed', 'Withdrawn')),
    FOREIGN KEY (Student_ID) REFERENCES Students(Student_ID),
    FOREIGN KEY (Module_Code) REFERENCES Modules(Module_Code),
    FOREIGN KEY (Semester_Code) REFERENCES Semesters(Semester_Code),
    UNIQUE (Student_ID, Module_Code, Semester_Code)
);

-- Insert sample data
INSERT INTO Faculties (Faculty_Code, Faculty_Name) VALUES
('FCS', 'Faculty of Computer Science'),
('FEN', 'Faculty of Engineering'),
('FBS', 'Faculty of Business Studies');

INSERT INTO Programmes (Programme_Code, Programme_Name, Faculty_Code, Duration_Years) VALUES
('CS001', 'BSc Computer Science', 'FCS', 4),
('CS002', 'BSc Software Engineering', 'FCS', 4),
('EN001', 'BEng Civil Engineering', 'FEN', 4),
('BS001', 'BBA Business Administration', 'FBS', 3);

INSERT INTO Semesters (Semester_Code, Academic_Year, Semester_Number, Start_Date, End_Date) VALUES
('S20231', 2023, 1, '2023-09-01', '2023-12-15'),
('S20232', 2023, 2, '2024-01-15', '2024-05-15'),
('S20241', 2024, 1, '2024-09-01', '2024-12-15'),
('S20242', 2024, 2, '2025-01-15', '2025-05-15');

INSERT INTO Modules (Module_Code, Module_Name, Module_Description, Credit_Hours, Year_Level, Semester_Offered, Programme_Code) VALUES
('CS101', 'Introduction to Programming', 'Basic programming concepts and algorithms', 3, 1, 1, 'CS001'),
('CS102', 'Data Structures', 'Fundamental data structures and algorithms', 3, 1, 2, 'CS001'),
('CS201', 'Object-Oriented Programming', 'OOP principles and design patterns', 3, 2, 1, 'CS001'),
('CS202', 'Database Systems', 'Relational databases and SQL', 3, 2, 2, 'CS001'),
('MA101', 'Calculus I', 'Differential and integral calculus', 4, 1, 1, 'CS001'),
('MA102', 'Discrete Mathematics', 'Mathematical structures for computer science', 4, 1, 2, 'CS001');

INSERT INTO Students (Student_Name, Date_of_Birth, Email_Address, Contact_Number, Programme_Code, Year_Enrolled, Enrollment_Status, Password) VALUES
('John Smith', '2002-05-15', 'john.smith@student.edu', '+1234567890', 'CS001', 2023, 'Active', 'student123'),
('Sarah Johnson', '2001-08-22', 'sarah.johnson@student.edu', '+1234567891', 'CS001', 2023, 'Active', 'student123'),
('Michael Brown', '2002-12-10', 'michael.brown@student.edu', '+1234567892', 'CS002', 2023, 'Active', 'student123'),
('Emily Davis', '2003-03-25', 'emily.davis@student.edu', '+1234567893', 'EN001', 2023, 'Active', 'student123');

INSERT INTO Admins (Admin_Name, Email_Address, Password) VALUES
('Admin User', 'admin@university.edu', 'admin123');

INSERT INTO Student_Enrollments (Student_ID, Module_Code, Semester_Code, Mark_Obtained, Grade, Status) VALUES
(1, 'CS101', 'S20231', 85.5, 'A', 'Completed'),
(1, 'CS102', 'S20232', 78.0, 'B', 'Completed'),
(1, 'CS201', 'S20241', 92.0, 'A', 'Enrolled'),
(2, 'CS101', 'S20231', 91.0, 'A', 'Completed'),
(2, 'MA101', 'S20231', 88.5, 'B', 'Completed'),
(3, 'CS101', 'S20231', 76.5, 'C', 'Completed');

-- Display verification
SELECT 'Database setup completed successfully!' as Status;

-- Show table counts
SELECT 
    (SELECT COUNT(*) FROM Students) as Student_Count,
    (SELECT COUNT(*) FROM Admins) as Admin_Count,
    (SELECT COUNT(*) FROM Modules) as Module_Count,
    (SELECT COUNT(*) FROM Student_Enrollments) as Enrollment_Count;

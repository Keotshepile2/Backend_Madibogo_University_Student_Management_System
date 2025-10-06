const getConnection = require('../config/database');

const connection = getConnection();

const createTables = `
CREATE TABLE Faculties (
    Faculty_Code VARCHAR(10) PRIMARY KEY,
    Faculty_Name VARCHAR(100) NOT NULL
);


CREATE TABLE Programmes (
    Programme_Code VARCHAR(10) PRIMARY KEY,
    Programme_Name VARCHAR(100) NOT NULL,
    Faculty_Code VARCHAR(10),
    Duration_Years INT,
    FOREIGN KEY (Faculty_Code) REFERENCES Faculties(Faculty_Code)
);


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


CREATE TABLE Admins (
    Admin_ID INT IDENTITY(1,1) PRIMARY KEY,
    Admin_Name VARCHAR(100) NOT NULL,
    Email_Address VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255)
);


CREATE TABLE Semesters (
    Semester_Code VARCHAR(10) PRIMARY KEY,
    Academic_Year INT NOT NULL,
    Semester_Number INT NOT NULL CHECK (Semester_Number IN (1, 2)),
    Start_Date DATE,
    End_Date DATE
);


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
`;

connection.query(createTables, (err) => {
    if (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
    console.log('✅ Database tables created successfully');
    connection.end();
});

# Architecture Decision Record #003
## Title: Updated ERD verson 2 to ERD version 3**  
## Status:** Approved  

---  

### **Metadata**  
**Created By:** Lady Joy Borja  
**Created On:** March 1, 2025  
**Approved By:** Iryl Jean Cadalin [Project Manager]  
**Approved On:** March 7, 2025  

---  

### **Context**  
The previous **ERD v.2** structured the Facial Recognition Attendance System to manage students, courses, events, and attendance. However, it required further refinements in program naming, user identity tracking, and attendance logging. The latest update in **ERD v.3** introduces optimizations to improve database efficiency, data normalization, and system usability.

---  

### **Decision**  
We updated the **ERD** with the following changes:

#### **1. Course Renamed to Program**  
- The "Course" entity was renamed to **"Program"** to better represent academic structures.  
- This change ensures clarity in managing student academic pathways.

#### **2. Student Table Enhancement**  
- Added a **Photo** attribute to store student profile images, aiding in facial recognition.  
- Maintains a foreign key to **Program (formerly Course)** for better academic tracking.

#### **3. Refined Relationships**  
- **Student-Program Relationship:** Now explicitly **Many-to-One**, ensuring students are assigned to only one program.  
- **User Role Management:** Maintains **Many-to-Many** relationships through the **User Roles** table.

#### **4. Enhanced Attendance Tracking**  
- Additional attributes: **Check_In_Time, Check_Out_Time, Checkpoint, Status** for detailed event tracking.  
- Improves reporting and analytics for event participation.

#### **5. Officer_Event Bridge Table Improvements**  
- Explicitly links **SSG Officers** to events for structured officer assignments.  
- Improves clarity on which officers are overseeing specific events.

---  

### **Consequences**  
#### **Positive Impacts:**  
✅ **Scalability:** The updated structure accommodates future system expansion.  
✅ **Security:** Stronger user-role linking and facial recognition support better authentication.  
✅ **Usability:** Enhanced attendance tracking benefits event organization and reporting.  

#### **Negative Impacts:**  
⚠ **Complexity:** Additional tables and relationships increase system complexity.  
⚠ **Performance:** More joins in queries might affect response time, requiring optimization.  

---  

### **ERD Version 3 - Updated Diagram**  
(https://github.com/KHRISTMAE/VALID8/blob/main/ERD/ERD%20V.3.jpg)

---  

### **Conclusion**  
The **ERD v.3 update** builds upon the previous design, refining user-role management, attendance tracking, and academic entity naming. These enhancements create a **robust and scalable** architecture that supports facial recognition and multi-role management while ensuring clarity in system operations.


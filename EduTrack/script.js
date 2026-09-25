
    // --- Mock Default Data ---
    const INITIAL_STUDENTS = [
      { name: "Alex Morgan", rollNo: "101", primaryClass: "Class 12", email: "alex.m@school.edu", attendance: 97, grade: 92 },
      { name: "Jordan Smith", rollNo: "102", primaryClass: "Class 10", email: "jordan.s@school.edu", attendance: 91, grade: 84 },
      { name: "Taylor Swift", rollNo: "103", primaryClass: "Class 12", email: "taylor.s@school.edu", attendance: 98, grade: 95 },
      { name: "Casey Johnson", rollNo: "104", primaryClass: "Class 9", email: "casey.j@school.edu", attendance: 86, grade: 78 },
      { name: "Riley Davis", rollNo: "105", primaryClass: "Class 11", email: "riley.d@school.edu", attendance: 93, grade: 89 },
      { name: "Morgan Freeman", rollNo: "106", primaryClass: "Class 11", email: "morgan.f@school.edu", attendance: 94, grade: 87 },
      { name: "Jamie Oliver", rollNo: "107", primaryClass: "Class 10", email: "jamie.o@school.edu", attendance: 78, grade: 64 }
    ];

    const INITIAL_ASSIGNMENTS = [
      { id: "ASM001", title: "Chemistry Lab Report", subject: "Science", due: "2026-06-25", submissions: 6 },
      { id: "ASM002", title: "History Essay Draft", subject: "History", due: "2026-06-28", submissions: 5 },
      { id: "ASM003", title: "Calculus Problem Set", subject: "Mathematics", due: "2026-07-02", submissions: 3 },
      { id: "ASM004", title: "English Presentation Prep", subject: "Languages", due: "2026-07-05", submissions: 0 }
    ];

    const INITIAL_ACTIVITIES = [
      { id: 1, text: "New student Jamie Oliver registered.", time: "1 hour ago" },
      { id: 2, text: "Grade updated for Jordan Smith (Calculus: 84%).", time: "3 hours ago" },
      { id: 3, text: "Created new assignment: English Presentation Prep.", time: "Yesterday" },
      { id: 4, text: "Class attendance finalized for 2026-06-21.", time: "1 day ago" }
    ];

    // --- Global Application State ---
    let appState = {
      adminName: "Teacher",
      adminEmail: "alex@auraacademy.edu",
      themeAccent: "#C9A84C",
      students: [],
      assignments: [],
      activities: [],
      attendance: {}, // Date -> { StudentId: true/false }
      notifications: [
        { id: 1, text: "Jamie Oliver grade is low (64%)", time: "2 hours ago" },
        { id: 2, text: "Upcoming assignment Chemistry Lab Report due in 3 days", time: "5 hours ago" }
      ]
    };

    // --- Bootstrapping App ---
    window.addEventListener("DOMContentLoaded", () => {
      loadState();
      
      // Select current date for attendance view as default
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('attendance-date').value = today;
      
      init();
    });

    function init() {
      applyThemeColor(appState.themeAccent);
      
      // Update visual profile initial
      updateProfileAvatar();
      
      // Render components
      renderDashboard();
      renderStudents();
      renderAssignments();
      loadAttendanceForDate(document.getElementById('attendance-date').value);
      renderNotifications();
      
      // Populating Settings form fields
      document.getElementById('settings-admin-name').value = appState.adminName;
      document.getElementById('settings-admin-email').value = appState.adminEmail;
    }

    // --- View Routing ---
    function switchView(viewName) {
      // Toggle sidebars active status
      document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Toggle views display
      document.querySelectorAll('.view-section').forEach(view => {
        if (view.id === `${viewName}-view`) {
          view.classList.add('active');
          if (viewName === 'dashboard') {
            view.style.display = 'grid';
          } else {
            view.style.display = 'grid'; // Maintain grid systems
          }
        } else {
          view.classList.remove('active');
          view.style.display = 'none';
        }
      });

      // Update Top Nav Title & Greeting
      const headerTitle = document.getElementById('header-title');
      const viewTitleMap = {
        'dashboard': 'Dashboard',
        'students': 'Student Registry',
        'assignments': 'Assignments Tracker',
        'attendance': 'Attendance Logbook',
        'settings': 'System Settings'
      };
      
      headerTitle.textContent = viewTitleMap[viewName] || 'Dashboard';
      headerTitle.style.animation = 'none';
      headerTitle.offsetHeight; // trigger reflow
      headerTitle.style.animation = 'fadeIn 0.3s ease';
      
      // Reset global search bar on navigation
      document.getElementById('global-search').value = '';
    }

    // --- LocalStorage Logic ---
    function saveState() {
      localStorage.setItem('aura_dashboard_state', JSON.stringify(appState));
      localStorage.setItem('students', JSON.stringify(appState.students));
    }

    function loadState() {
      const saved = localStorage.getItem('aura_dashboard_state');
      if (saved) {
        try {
          appState = JSON.parse(saved);
          if (appState.adminName === "Alex") {
            appState.adminName = "Teacher";
          }
        } catch (e) {
          console.error("Failed to parse state", e);
        }
      } else {
        // Fallback default mockup arrays
        appState.assignments = [...INITIAL_ASSIGNMENTS];
        appState.activities = [...INITIAL_ACTIVITIES];
        
        // Populate default attendance for today and yesterday
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        appState.attendance[today] = {};
        appState.attendance[yesterday] = {};
      }

      // Load students from specific localStorage key "students"
      const savedStudents = localStorage.getItem('students');
      if (savedStudents) {
        try {
          appState.students = JSON.parse(savedStudents);
        } catch (e) {
          console.error("Failed to parse students", e);
          appState.students = [...INITIAL_STUDENTS];
        }
      } else {
        appState.students = [...INITIAL_STUDENTS];
        localStorage.setItem('students', JSON.stringify(appState.students));
      }

      // Ensure today and yesterday attendance elements match loaded student list
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (!appState.attendance[today]) appState.attendance[today] = {};
      if (!appState.attendance[yesterday]) appState.attendance[yesterday] = {};

      appState.students.forEach(s => {
        if (appState.attendance[today][s.rollNo] === undefined) {
          appState.attendance[today][s.rollNo] = true;
        }
        if (appState.attendance[yesterday][s.rollNo] === undefined) {
          appState.attendance[yesterday][s.rollNo] = true;
        }
      });

      saveState();
    }

    function resetDashboardData() {
      showConfirm("Reset Dashboard Data", "Are you sure you want to reset everything back to initial mockup data? All your edits will be cleared.").then(confirmed => {
        if (confirmed) {
          localStorage.removeItem('aura_dashboard_state');
          location.reload();
        }
      });
    }

    // --- Profile Avatar Name Sync ---
    function updateProfileAvatar() {
      const name = appState.adminName || "Admin";
      document.getElementById('header-greeting').textContent = `Hello, ${name}`;
      
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      document.getElementById('avatar-circle').textContent = initials || "A";
    }

    // --- Global Notifications Control ---
    function toggleDropdown(id) {
      const element = document.getElementById(id);
      element.classList.toggle('active');
      
      // Close dropdown when clicking outside
      const handler = (e) => {
        if (!element.contains(e.target) && !e.target.closest('.icon-btn')) {
          element.classList.remove('active');
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
    }

    function renderNotifications() {
      const container = document.getElementById('notifications-list-container');
      const badge = document.getElementById('notification-badge');
      
      container.innerHTML = '';
      if (appState.notifications.length === 0) {
        container.innerHTML = '<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:20px;">No new alerts</div>';
        badge.style.display = 'none';
        return;
      }
      
      badge.style.display = 'block';
      
      appState.notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `
          <div class="dropdown-item-dot"></div>
          <div class="dropdown-item-content">
            <span>${n.text}</span>
            <span class="dropdown-item-time">${n.time}</span>
          </div>
        `;
        container.appendChild(item);
      });
    }

    function addNotification(text) {
      appState.notifications.unshift({
        id: Date.now(),
        text: text,
        time: "Just now"
      });
      renderNotifications();
      saveState();
    }

    function clearNotifications() {
      appState.notifications = [];
      renderNotifications();
      saveState();
    }

    // --- Dashboard View Rendering ---
    function renderDashboard() {
      // Calculate Stats
      const totalStudents = appState.students.length;
      document.getElementById('dash-total-students').textContent = totalStudents;

      // Attendance calculations
      let avgAttendance = 0;
      if (appState.students.length > 0) {
        const totalAtt = appState.students.reduce((acc, curr) => acc + parseFloat(curr.attendance), 0);
        avgAttendance = (totalAtt / appState.students.length).toFixed(1);
      }
      document.getElementById('dash-avg-attendance').textContent = `${avgAttendance}%`;

      // Top Performer
      let topPerformer = "-";
      if (appState.students.length > 0) {
        const sortedByGrade = [...appState.students].sort((a, b) => b.grade - a.grade);
        topPerformer = `${sortedByGrade[0].name} (${sortedByGrade[0].grade}%)`;
      }
      document.getElementById('dash-top-performer').textContent = topPerformer;

      // Recent Addition
      let recentAddition = "-";
      if (appState.students.length > 0) {
        recentAddition = appState.students[appState.students.length - 1].name;
      }
      document.getElementById('dash-recent-addition').textContent = recentAddition;

      // Activity Feeds
      const activityFeed = document.getElementById('dashboard-activity-feed');
      activityFeed.innerHTML = '';
      appState.activities.slice(0, 4).forEach(act => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
          <div class="activity-indicator"></div>
          <div class="activity-details">
            <span class="activity-text">${act.text}</span>
            <span class="activity-time">${act.time}</span>
          </div>
        `;
        activityFeed.appendChild(item);
      });

      // Top Performing Table
      const topStudentsList = document.getElementById('top-students-list');
      topStudentsList.innerHTML = '';
      const sortedStudents = [...appState.students]
        .sort((a, b) => b.grade - a.grade)
        .slice(0, 3);

      sortedStudents.forEach(stu => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <div class="table-user-cell">
              <div class="table-avatar">${stu.name.split(' ').map(x=>x[0]).join('')}</div>
              <span class="table-user-name">${stu.name}</span>
            </div>
          </td>
          <td>${stu.rollNo}</td>
          <td>${stu.primaryClass}</td>
          <td><strong style="color:var(--success); font-weight:600;">${stu.grade}%</strong></td>
          <td>${stu.attendance}%</td>
        `;
        topStudentsList.appendChild(row);
      });

      // Redraw SVG Chart with actual average
      drawGradeChart();
    }

    function addActivity(text) {
      appState.activities.unshift({
        id: Date.now(),
        text: text,
        time: "Just now"
      });
      renderDashboard();
    }

    // --- Beautiful Dynamic Chart Drawing ---
    function drawGradeChart() {
      // Calculate actual average grade from roster
      let avg = 0;
      if (appState.students.length > 0) {
        const totalGrade = appState.students.reduce((acc, curr) => acc + parseFloat(curr.grade), 0);
        avg = parseFloat((totalGrade / appState.students.length).toFixed(1));
      }
      
      // Dynamic shift of last chart coordinate based on current student data
      const chartPoints = [
        { x: 75, val: 74 },
        { x: 171, val: 80 },
        { x: 267, val: 78 },
        { x: 363, val: 90 },
        { x: 459, val: 88 },
        { x: 545, val: isNaN(avg) ? 90 : Math.round(avg) }
      ];

      // Convert grades to SVG pixel heights (min grade: 40%, max: 100%)
      // Height of grid area: Y coordinate ranges from 40 (100%) to 190 (40%)
      const minVal = 40;
      const maxVal = 100;
      const heightRange = 150; // Y values 40 to 190
      
      const calculatedPoints = chartPoints.map(pt => {
        // Calculate Y
        let pct = (pt.val - minVal) / (maxVal - minVal);
        if (pct < 0) pct = 0;
        if (pct > 1) pct = 1;
        
        const y = 190 - (pct * heightRange);
        return { x: pt.x, y: y, val: pt.val };
      });

      // Build path line
      let linePath = `M ${calculatedPoints[0].x} ${calculatedPoints[0].y}`;
      for (let i = 1; i < calculatedPoints.length; i++) {
        linePath += ` L ${calculatedPoints[i].x} ${calculatedPoints[i].y}`;
      }

      // Build area path
      let areaPath = `${linePath} L ${calculatedPoints[calculatedPoints.length - 1].x} 190 L ${calculatedPoints[0].x} 190 Z`;

      // Assign to SVG Elements
      const svg = document.getElementById('performance-chart');
      const pathLine = svg.querySelector('.chart-line');
      const pathArea = svg.querySelector('.chart-area');
      const dots = svg.querySelectorAll('.chart-point');

      pathLine.setAttribute('d', linePath);
      pathArea.setAttribute('d', areaPath);

      // Re-trigger animation
      pathLine.style.animation = 'none';
      pathLine.offsetHeight;
      pathLine.style.animation = 'drawLine 1s ease-out forwards';

      // Update positions of interactive circles
      calculatedPoints.forEach((pt, index) => {
        if (dots[index]) {
          dots[index].setAttribute('cx', pt.x);
          dots[index].setAttribute('cy', pt.y);
          dots[index].setAttribute('data-val', `${pt.val}%`);
          
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
          dots[index].setAttribute('onmouseover', `showChartTooltip(event, '${monthNames[index]}: ${pt.val}%')`);
        }
      });
    }

    // Chart Tooltips
    function showChartTooltip(e, text) {
      const tooltip = document.getElementById('chart-tooltip');
      const rect = e.target.getBoundingClientRect();
      const chartBox = document.querySelector('.chart-box').getBoundingClientRect();
      
      tooltip.style.opacity = 1;
      tooltip.textContent = text;
      tooltip.style.left = `${rect.left - chartBox.left - (tooltip.offsetWidth / 2) + 4}px`;
      tooltip.style.top = `${rect.top - chartBox.top - 34}px`;
    }

    function hideChartTooltip() {
      const tooltip = document.getElementById('chart-tooltip');
      tooltip.style.opacity = 0;
    }


    // --- 2. Students View Operations (CRUD) ---
    let currentFilterClass = "All";
    let currentSearchQuery = "";
    
    // --- Sorting State ---
    let currentSortColumn = "";
    let currentSortDirection = "asc";

    function handleStudentSearch(val) {
      currentSearchQuery = val;
      renderStudents();
    }

    function toggleSort(columnName) {
      if (currentSortColumn === columnName) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        currentSortColumn = columnName;
        currentSortDirection = "asc";
      }
      updateSortIcons();
      sortStudents();
      renderStudents();
    }

    function updateSortIcons() {
      const cols = ["name", "attendance", "grade"];
      cols.forEach(col => {
        const icon = document.getElementById(`sort-icon-${col}`);
        if (!icon) return;
        if (currentSortColumn === col) {
          icon.innerHTML = currentSortDirection === "asc" ? "▲" : "▼";
          icon.style.color = "var(--accent-color)";
        } else {
          icon.innerHTML = "↕";
          icon.style.color = "var(--text-light)";
        }
      });
    }

    function sortStudents() {
      if (!currentSortColumn) return;
      
      appState.students.sort((a, b) => {
        let valA = a[currentSortColumn];
        let valB = b[currentSortColumn];
        
        if (currentSortColumn === 'name') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        } else {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }
        
        if (valA < valB) return currentSortDirection === "asc" ? -1 : 1;
        if (valA > valB) return currentSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    function renderStudents() {
      const tbody = document.getElementById('students-table-body');
      const tableCard = document.getElementById('students-table-card');
      const emptyState = document.getElementById('students-empty-state');
      
      tbody.innerHTML = '';

      if (appState.students.length === 0) {
        if (tableCard) tableCard.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
      } else {
        if (tableCard) tableCard.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
      }

      let filtered = appState.students;

      // Filter by Class
      if (currentFilterClass !== "All") {
        filtered = filtered.filter(s => s.primaryClass === currentFilterClass);
      }

      // Search Query
      if (currentSearchQuery.trim() !== "") {
        const query = currentSearchQuery.toLowerCase();
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(query) || 
          s.rollNo.toLowerCase().includes(query)
        );
      }

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">No students found matching filters.</td></tr>`;
        return;
      }

      filtered.forEach(stu => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td data-label="Name">
            <div class="table-user-cell">
              <div class="table-avatar">${stu.name.split(' ').map(n=>n[0]).join('')}</div>
              <div>
                <div class="table-user-name">${stu.name}</div>
                <div class="table-user-sub">${stu.email || ''}</div>
              </div>
            </div>
          </td>
          <td data-label="Roll No">${stu.rollNo}</td>
          <td data-label="Class">${stu.primaryClass}</td>
          <td data-label="Attendance %">${stu.attendance}%</td>
          <td data-label="Grade"><span class="badge-grade ${getGradeBadgeClass(stu.grade)}">${stu.grade}%</span></td>
          <td data-label="Actions">
            <div class="table-actions">
              <button class="action-icon-btn" onclick="openStudentModal('${stu.rollNo}')" title="Edit Student">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                </svg>
              </button>
              <button class="action-icon-btn delete-btn" onclick="deleteStudent('${stu.rollNo}')" title="Delete Student">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function filterStudents() {
      currentFilterClass = document.getElementById('filter-class').value;
      renderStudents();
    }

    function handleGlobalSearch(val) {
      currentSearchQuery = val;
      
      const activeSection = document.querySelector('.view-section.active');
      if (activeSection.id === 'students-view') {
        renderStudents();
      } else if (activeSection.id === 'assignments-view') {
        renderAssignments();
      }
    }

    // Modal Control: Add/Edit student
    function openStudentModal(rollNo = null) {
      const modal = document.getElementById('student-modal');
      const form = document.getElementById('student-form');
      const modalTitle = document.getElementById('student-modal-title');
      const submitBtn = document.getElementById('student-submit-btn');

      form.reset();
      document.getElementById('student-edit-id').value = '';
      document.getElementById('student-roll').disabled = false;

      if (rollNo) {
        // Edit mode
        modalTitle.textContent = "Edit Student Profile";
        submitBtn.textContent = "Update Profile";
        
        const stu = appState.students.find(s => s.rollNo === rollNo);
        if (stu) {
          document.getElementById('student-edit-id').value = stu.rollNo;
          document.getElementById('student-name').value = stu.name;
          document.getElementById('student-roll').value = stu.rollNo;
          document.getElementById('student-roll').disabled = true;
          document.getElementById('student-class').value = stu.primaryClass;
          document.getElementById('student-email').value = stu.email || '';
          document.getElementById('student-grade').value = stu.grade;
          document.getElementById('student-attendance').value = stu.attendance;
        }
      } else {
        // Add mode
        modalTitle.textContent = "Add Student Profile";
        submitBtn.textContent = "Save Student";
      }

      modal.classList.add('active');
      focusModal('student-modal');
    }

    function closeStudentModal() {
      document.getElementById('student-modal').classList.remove('active');
      restoreFocus();
    }

    function handleStudentSubmit(event) {
      event.preventDefault();
      const editId = document.getElementById('student-edit-id').value;
      const name = document.getElementById('student-name').value;
      const rollNo = document.getElementById('student-roll').value;
      const primaryClass = document.getElementById('student-class').value;
      const email = document.getElementById('student-email').value;
      const grade = parseInt(document.getElementById('student-grade').value);
      const attendance = parseInt(document.getElementById('student-attendance').value);

      if (editId) {
        // Update Student
        const index = appState.students.findIndex(s => s.rollNo === editId);
        if (index !== -1) {
          appState.students[index] = { ...appState.students[index], name, rollNo: editId, primaryClass, email, grade, attendance };
          addActivity(`Updated student record: ${name}`);
        }
      } else {
        // Add Student
        const exists = appState.students.some(s => s.rollNo === rollNo);
        if (exists) {
          showToast(`Error: A student with Roll Number ${rollNo} already exists.`, "danger");
          return;
        }
        
        appState.students.push({ name, rollNo, primaryClass, email, grade, attendance });
        
        // Add notification for alert
        if (grade < 75 && document.getElementById('settings-pref-alert-grade').checked) {
          addNotification(`Alert: New student ${name} registered with grades below 75%.`);
        }
        addActivity(`Registered new student: ${name}`);
      }

      saveState();
      renderStudents();
      renderDashboard();
      
      // Auto-update attendance records for today if not initialized
      const today = document.getElementById('attendance-date').value;
      if (appState.attendance[today]) {
        appState.students.forEach(s => {
          if (appState.attendance[today][s.rollNo] === undefined) {
            appState.attendance[today][s.rollNo] = true;
          }
        });
        loadAttendanceForDate(today);
      }

      closeStudentModal();
    }

    function deleteStudent(rollNo) {
      const student = appState.students.find(s => s.rollNo === rollNo);
      showConfirm("Remove Student", `Are you sure you want to remove ${student ? student.name : 'this student'} (Roll No: ${rollNo}) from registry?`).then(confirmed => {
        if (confirmed) {
          appState.students = appState.students.filter(s => s.rollNo !== rollNo);
          addActivity(`Removed student: ${student ? student.name : rollNo}`);
          saveState();
          renderStudents();
          renderDashboard();
          showToast(`Student ${student ? student.name : ''} removed successfully.`, "warning");
        }
      });
    }


    // --- 3. Assignments View Logic ---
    function renderAssignments() {
      const deck = document.getElementById('assignments-deck');
      deck.innerHTML = '';

      let filtered = appState.assignments;
      if (currentSearchQuery.trim() !== "") {
        const query = currentSearchQuery.toLowerCase();
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(query) || 
          a.subject.toLowerCase().includes(query)
        );
      }

      if (filtered.length === 0) {
        deck.innerHTML = `<div class="card" style="grid-column: span 3; text-align:center; padding:40px; color:var(--text-muted);">No assignments matched the query.</div>`;
        return;
      }

      const totalActiveStudents = appState.students.length;

      filtered.forEach(asm => {
        // Calculate circle completion
        const percent = totalActiveStudents > 0 ? Math.round((asm.submissions / totalActiveStudents) * 100) : 0;
        
        // Radial dash array variables
        // r = 18, circumference = 2 * PI * r = 113
        const circ = 113;
        const offset = circ - (percent / 100) * circ;

        const card = document.createElement('div');
        card.className = 'card assignment-card';
        card.innerHTML = `
          <div class="assignment-header">
            <div>
              <span class="assignment-subject">${asm.subject}</span>
              <h3 style="font-size:18px; margin-top:4px;">${asm.title}</h3>
            </div>
            
            <div class="table-actions">
              <button class="action-icon-btn" onclick="openAssignmentModal('${asm.id}')" title="Edit Assignment">
                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
              </button>
              <button class="action-icon-btn delete-btn" onclick="deleteAssignment('${asm.id}')" title="Delete Assignment">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>

          <div class="progress-wrapper">
            <div class="circular-progress">
              <svg>
                <circle class="bg-circle" cx="22" cy="22" r="18"></circle>
                <circle class="fg-circle" cx="22" cy="22" r="18" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"></circle>
              </svg>
              <div class="progress-text">${percent}%</div>
            </div>
            <div class="progress-info">
              <span class="progress-label">Completion Status</span>
              <span class="progress-count">${asm.submissions} / ${totalActiveStudents} Submissions</span>
            </div>
          </div>

          <div class="assignment-meta">
            <span class="due-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Due: ${asm.due}
            </span>
          </div>
        `;
        deck.appendChild(card);
      });
    }

    function openAssignmentModal(id = null) {
      const modal = document.getElementById('assignment-modal');
      const form = document.getElementById('assignment-form');
      const modalTitle = document.getElementById('assignment-modal-title');
      const submitBtn = document.getElementById('assignment-submit-btn');

      form.reset();
      document.getElementById('assignment-edit-id').value = '';

      if (id) {
        modalTitle.textContent = "Edit Assignment Parameters";
        submitBtn.textContent = "Update Assignment";

        const asm = appState.assignments.find(a => a.id === id);
        if (asm) {
          document.getElementById('assignment-edit-id').value = asm.id;
          document.getElementById('assignment-title').value = asm.title;
          document.getElementById('assignment-subject').value = asm.subject;
          document.getElementById('assignment-due').value = asm.due;
          document.getElementById('assignment-submissions').value = asm.submissions;
        }
      } else {
        modalTitle.textContent = "Create New Assignment";
        submitBtn.textContent = "Publish Assignment";
      }

      modal.classList.add('active');
      focusModal('assignment-modal');
    }

    function closeAssignmentModal() {
      document.getElementById('assignment-modal').classList.remove('active');
      restoreFocus();
    }

    function handleAssignmentSubmit(event) {
      event.preventDefault();
      const editId = document.getElementById('assignment-edit-id').value;
      const title = document.getElementById('assignment-title').value;
      const subject = document.getElementById('assignment-subject').value;
      const due = document.getElementById('assignment-due').value;
      const submissions = parseInt(document.getElementById('assignment-submissions').value);

      if (editId) {
        const idx = appState.assignments.findIndex(a => a.id === editId);
        if (idx !== -1) {
          appState.assignments[idx] = { ...appState.assignments[idx], title, subject, due, submissions };
          addActivity(`Modified assignment detail: ${title}`);
        }
      } else {
        const newId = `ASM${String(appState.assignments.length + 1).padStart(3, '0')}`;
        appState.assignments.push({ id: newId, title, subject, due, submissions });
        addActivity(`Created assignment module: ${title}`);
      }

      saveState();
      renderAssignments();
      renderDashboard();
      closeAssignmentModal();
    }

    function deleteAssignment(id) {
      showConfirm("Delete Assignment", "Are you sure you want to delete this assignment task?").then(confirmed => {
        if (confirmed) {
          appState.assignments = appState.assignments.filter(a => a.id !== id);
          addActivity(`Removed an active assignment.`);
          saveState();
          renderAssignments();
          renderDashboard();
          showToast("Assignment removed successfully.", "warning");
        }
      });
    }


    // --- 4. Attendance View Operations ---
    function loadAttendanceForDate(dateVal) {
      const rosterList = document.getElementById('attendance-roster-list');
      rosterList.innerHTML = '';

      // Initialize date entry if absent in state
      if (!appState.attendance[dateVal]) {
        appState.attendance[dateVal] = {};
        appState.students.forEach(s => {
          appState.attendance[dateVal][s.rollNo] = true;
        });
      }

      const attendanceStateToday = appState.attendance[dateVal];

      let presentCount = 0;
      let absentCount = 0;

      appState.students.forEach(s => {
        const isPresent = attendanceStateToday[s.rollNo] !== undefined ? attendanceStateToday[s.rollNo] : true;
        
        if (isPresent) {
          presentCount++;
        } else {
          absentCount++;
        }

        const row = document.createElement('div');
        row.className = 'attendance-row';
        row.innerHTML = `
          <div class="attendance-user-info">
            <div class="attendance-avatar">${s.name.split(' ').map(n=>n[0]).join('')}</div>
            <div>
              <span class="attendance-name">${s.name}</span>
              <div class="attendance-detail">${s.primaryClass} Core | Roll No: ${s.rollNo}</div>
            </div>
          </div>
          <div class="attendance-toggles">
            <button class="toggle-btn present-btn ${isPresent ? 'active' : ''}" onclick="toggleAttendance('${dateVal}', '${s.rollNo}', true)">Present</button>
            <button class="toggle-btn absent-btn ${!isPresent ? 'active' : ''}" onclick="toggleAttendance('${dateVal}', '${s.rollNo}', false)">Absent</button>
          </div>
        `;
        rosterList.appendChild(row);
      });

      // Update calculations
      document.getElementById('attendance-present-count').textContent = presentCount;
      document.getElementById('attendance-absent-count').textContent = absentCount;
      
      const total = presentCount + absentCount;
      const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;
      
      document.getElementById('attendance-rate-percent').textContent = `${rate}%`;
      document.getElementById('attendance-rate-progress-bar').style.width = `${rate}%`;
    }

    function toggleAttendance(dateVal, studentId, isPresent) {
      if (!appState.attendance[dateVal]) {
        appState.attendance[dateVal] = {};
      }
      appState.attendance[dateVal][studentId] = isPresent;
      
      saveState();
      loadAttendanceForDate(dateVal);
      renderDashboard(); // Reflect details immediately on main screen stats
    }

    function markAllAttendance(isPresent) {
      const today = document.getElementById('attendance-date').value;
      if (!appState.attendance[today]) {
        appState.attendance[today] = {};
      }
      appState.students.forEach(s => {
        appState.attendance[today][s.rollNo] = isPresent;
      });
      saveState();
      loadAttendanceForDate(today);
      renderDashboard();
    }


    // --- 5. Settings Preferences Saving ---
    function changeThemeColor(colorHex, element) {
      // Toggle swatch UI active state
      document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
      element.classList.add('active');
      
      appState.themeAccent = colorHex;
      applyThemeColor(colorHex);
      saveState();
    }

    function applyThemeColor(colorHex) {
      // Modify CSS color properties globally
      document.documentElement.style.setProperty('--accent-color', colorHex);
      
      // Hex to lighter rgb converter
      const hex = colorHex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      document.documentElement.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.15)`);
      document.documentElement.style.setProperty('--accent-light', `rgba(${r}, ${g}, ${b}, 0.04)`);
    }

    function saveSettings(event) {
      event.preventDefault();
      
      const adminName = document.getElementById('settings-admin-name').value;
      const adminEmail = document.getElementById('settings-admin-email').value;

      appState.adminName = adminName;
      appState.adminEmail = adminEmail;

      saveState();
      updateProfileAvatar();

      addActivity("Updated personal profile parameters.");
      showToast("Settings preferences saved successfully!", "success");
    }

    // --- Toast and Confirm Modal Systems ---
    let confirmModalResolve = null;

    function showConfirm(title, message) {
      return new Promise((resolve) => {
        confirmModalResolve = resolve;
        document.getElementById('confirm-modal-title').textContent = title;
        document.getElementById('confirm-modal-message').textContent = message;
        document.getElementById('confirm-modal').classList.add('active');
        focusModal('confirm-modal');
      });
    }

    function closeConfirmModal(confirmed) {
      document.getElementById('confirm-modal').classList.remove('active');
      restoreFocus();
      if (confirmModalResolve) {
        confirmModalResolve(confirmed);
        confirmModalResolve = null;
      }
    }

    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      let iconSVG = '';
      if (type === 'success') {
        iconSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      } else if (type === 'danger') {
        iconSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        `;
      } else if (type === 'warning') {
        iconSVG = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        `;
      }

      toast.innerHTML = `
        <div class="toast-icon">${iconSVG}</div>
        <div class="toast-message">${message}</div>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    function getGradeBadgeClass(grade) {
      if (grade >= 90) return 'grade-a';
      if (grade >= 80) return 'grade-b';
      if (grade >= 70) return 'grade-c';
      return 'grade-df';
    }

    function exportStudentsCSV() {
      const headers = ["Name", "Roll No", "Class", "Email", "Attendance %", "Grade"];
      const rows = appState.students.map(s => [
        s.name,
        s.rollNo,
        s.primaryClass,
        s.email || '',
        s.attendance,
        s.grade
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => {
          const stringVal = String(val);
          if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
            return `"${stringVal.replace(/"/g, '""')}"`;
          }
          return stringVal;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "students-export.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Student data exported successfully", "success");
    }

    // --- Keyboard Accessibility Utilities ---
    let lastActiveElement = null;

    function focusModal(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      lastActiveElement = document.activeElement;
      
      const inputs = modal.querySelectorAll('input, select, textarea');
      if (inputs.length > 0) {
        inputs[0].focus();
      } else {
        const focusable = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }

    function restoreFocus() {
      if (lastActiveElement) {
        lastActiveElement.focus();
        lastActiveElement = null;
      }
    }

    // Global keyboard listeners for Escape key and Tab key (Focus Trap)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const notificationsDropdown = document.getElementById('notifications-dropdown');
        if (notificationsDropdown && notificationsDropdown.classList.contains('active')) {
          notificationsDropdown.classList.remove('active');
        }

        const studentModal = document.getElementById('student-modal');
        if (studentModal && studentModal.classList.contains('active')) {
          closeStudentModal();
        }

        const assignmentModal = document.getElementById('assignment-modal');
        if (assignmentModal && assignmentModal.classList.contains('active')) {
          closeAssignmentModal();
        }

        const confirmModal = document.getElementById('confirm-modal');
        if (confirmModal && confirmModal.classList.contains('active')) {
          closeConfirmModal(false);
        }
      }

      if (e.key === 'Tab') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
          const focusableSelectors = 'button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
          const modalBox = activeModal.querySelector('.modal-box');
          if (modalBox) {
            const focusableElements = Array.from(modalBox.querySelectorAll(focusableSelectors))
              .filter(el => !el.disabled && el.tabIndex !== -1);
            
            if (focusableElements.length > 0) {
              const firstElement = focusableElements[0];
              const lastElement = focusableElements[focusableElements.length - 1];

              if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                  lastElement.focus();
                  e.preventDefault();
                }
              } else { // Tab
                if (document.activeElement === lastElement) {
                  firstElement.focus();
                  e.preventDefault();
                }
              }
            }
          }
        }
      }
    });


  
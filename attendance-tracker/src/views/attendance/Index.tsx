import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './index.css';
import './analytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type AttendanceRecord = {
  presentDates: string[];
  count: number;
  total: number;
};

type Member = {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  join_date: string;
  tier_type: string;
  pay_status: string;
  days_attended: number;
  total_possible_days: number;
  attendance_percentage: number;
};

type AttendanceTrend = {
  attendance_date: string;
  member_count: number;
};

type Stats = {
  total_members: number;
  active_members: number;
  total_meeting_days: number;
  today_attendance: number;
};

const AttendanceList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0] // today
  });
  const [manualTotalDays, setManualTotalDays] = useState<number | null>(null);
  const [showDaysOverride, setShowDaysOverride] = useState(false);
  const [showYearEndNotification, setShowYearEndNotification] = useState(false);
  const [showYearlyResetNotification, setShowYearlyResetNotification] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Analytics state
  const [attendanceTrends, setAttendanceTrends] = useState<AttendanceTrend[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  // Format date from YYYY-MM-DD to MM/DD/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric'
    });
  };

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch attendance summary from backend
  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });
      const res = await fetch(`http://localhost:3001/api/attendance/summary?${params}`);
      const data = await res.json();
      setMembers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!isLoggedIn) return;
    
    try {
      const [trendsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3001/api/analytics/attendance-trends?days=30'),
        fetch('http://localhost:3001/api/analytics/stats'),
      ]);

      const trendsData = await trendsRes.json();
      const statsData = await statsRes.json();

      setAttendanceTrends(trendsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    const loggedIn = !!userStr;
    setIsLoggedIn(loggedIn);
    
    // Fetch analytics if logged in
    if (loggedIn) {
      fetchAnalyticsData();
    }
    
    // Check if it's November or December to show year-end notification
    const currentMonth = new Date().getMonth();
    if (currentMonth === 10 || currentMonth === 11) { // November (10) or December (11)
      setShowYearEndNotification(true);
    }
    
    // Check for yearly attendance reset
    if (loggedIn) {
      checkYearlyResetStatus();
    }
  }, [dateRange, isLoggedIn]);
  
  const checkYearlyResetStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/attendance/yearly-reset/status');
      const data = await res.json();
      
      if (data.needs_reset && !data.notification_dismissed) {
        setShowYearlyResetNotification(true);
      }
    } catch (err) {
      console.error('Error checking yearly reset status:', err);
    }
  };
  
  const dismissYearlyResetNotification = async () => {
    try {
      await fetch('http://localhost:3001/api/attendance/yearly-reset/dismiss', {
        method: 'POST'
      });
      setShowYearlyResetNotification(false);
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  const handleMarkAttendance = async (id: number) => {
    const today = new Date().toISOString().split("T")[0];
    
    try {
      const response = await fetch('http://localhost:3001/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: id,
          attendance_date: today
        })
      });
      
      if (response.ok) {
        // Refresh the attendance data
        await fetchMembers();
        
        // Find member name for success message
        const member = members.find(m => m.id === id);
        alert(`Attendance marked for ${member?.name || 'member'} on ${today}`);
      } else {
        alert('Error marking attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance');
    }
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 123, 255);
    doc.text('Attendance Analytics Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated on: ${reportDate}`, pageWidth / 2, 28, { align: 'center' });
    
    // Statistics Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Key Statistics', 14, 40);
    
    if (stats) {
      const statsData = [
        ['Metric', 'Value'],
        ['Total Members', stats.total_members.toString()],
        ['Active Members', stats.active_members.toString()],
        ['Total Meetings', stats.total_meeting_days.toString()],
        ["Today's Attendance", stats.today_attendance.toString()]
      ];
      
      autoTable(doc, {
        startY: 45,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Attendance Table
    const finalY = (doc as any).lastAutoTable?.finalY || 80;
    doc.setFontSize(14);
    doc.text('Member Attendance Details', 14, finalY + 10);
    
    const attendanceData = members.map(member => {
      const totalDays = manualTotalDays || member.total_possible_days;
      const percentage = totalDays > 0 ? Math.round((member.days_attended / totalDays) * 100) : 0;
      return [
        member.name,
        member.days_attended.toString(),
        totalDays.toString(),
        `${percentage}%`
      ];
    });
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Name', 'Days Attended', 'Total Days', 'Attendance %']],
      body: attendanceData,
      theme: 'striped',
      headStyles: { fillColor: [0, 123, 255] },
      margin: { left: 14, right: 14 }
    });
    
    // Attendance Trends
    if (attendanceTrends.length > 0) {
      const trendsY = (doc as any).lastAutoTable?.finalY || 150;
      
      // Check if we need a new page
      if (trendsY > 250) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Attendance Trends (Last 30 Days)', 14, 20);
        
        const trendsData = attendanceTrends.map(trend => [
          new Date(trend.attendance_date).toLocaleDateString(),
          trend.member_count.toString()
        ]);
        
        autoTable(doc, {
          startY: 25,
          head: [['Date', 'Members Present']],
          body: trendsData,
          theme: 'grid',
          headStyles: { fillColor: [75, 192, 192] },
          margin: { left: 14, right: 14 }
        });
      } else {
        doc.setFontSize(14);
        doc.text('Attendance Trends (Last 30 Days)', 14, trendsY + 10);
        
        const trendsData = attendanceTrends.slice(0, 10).map(trend => [
          new Date(trend.attendance_date).toLocaleDateString(),
          trend.member_count.toString()
        ]);
        
        autoTable(doc, {
          startY: trendsY + 15,
          head: [['Date', 'Members Present']],
          body: trendsData,
          theme: 'grid',
          headStyles: { fillColor: [75, 192, 192] },
          margin: { left: 14, right: 14 }
        });
      }
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `attendance-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleResetAllAttendance = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset ALL attendance records? This action cannot be undone. All attendance data will be permanently deleted.'
    );
    
    if (!confirmed) return;
    
    // Second confirmation for safety
    const doubleConfirmed = window.confirm(
      'FINAL CONFIRMATION: This will delete all attendance records from the database. Type OK to proceed.'
    );
    
    if (!doubleConfirmed) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/attendance/reset-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Success: All attendance records have been reset. ${data.deleted_records} records deleted.`);
        // Refresh the attendance data
        await fetchMembers();
      } else {
        alert('Error resetting attendance records');
      }
    } catch (error) {
      console.error('Error resetting attendance:', error);
      alert('Error resetting attendance records');
    }
  };

  const tableData = members.map((member) => {
    const totalDays = manualTotalDays || member.total_possible_days;
    const percentage = totalDays > 0 ? Math.round((member.days_attended / totalDays) * 100) : 0;
    
    return {
      id: member.id,
      name: member.name,
      attended: member.days_attended,
      total: totalDays,
      percentage: percentage + "%"
    };
  });

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "attended", headerName: "Days Attended", width: 130 },
    { field: "total", headerName: "Total Days", width: 100 },
    ...(isLoggedIn ? [{ field: "percentage", headerName: "Attendance %", width: 120 }] : []),
    {
      field: "mark",
      headerName: "Mark Today",
      width: 130,
      renderCell: (params) => (
        <button 
          className="mark-attendance-btn"
          onClick={() => handleMarkAttendance(params.row.id)}
        >
          ✓ Mark
        </button>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div>
      <h2>Attendance Tracker</h2>
      <p><strong>Today is:</strong> {formattedToday}</p>

      {showYearEndNotification && (
        <div className="year-end-notification">
          <div>
            <strong>⚠️ Year-End Reminder:</strong>
            <span>
              Remember to clear attendance records at the end of the year to start fresh for the next academic year.
            </span>
          </div>
          <button
            onClick={() => setShowYearEndNotification(false)}
            className="notification-close-btn"
          >
            ×
          </button>
        </div>
      )}

      {showYearlyResetNotification && isLoggedIn && (
        <div className="yearly-reset-notification">
          <div>
            <strong>🗓️ New Year - Attendance Reset Reminder</strong>
            <p>
              It's a new year! Use the "Reset All Attendance Records" button in Admin Controls below to clear last year's data and start fresh.
            </p>
          </div>
          <button
            onClick={dismissYearlyResetNotification}
            className="yearly-reset-dismiss-btn"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="date-range-filter">
        <h3 className="filter-title">Date Range Filter</h3>
        <div className="filter-controls">
          <div className="date-input-group">
            <label htmlFor="start-date" className="date-label">Start Date:</label>
            <input
              id="start-date"
              type="date"
              className="date-input"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date" className="date-label">End Date:</label>
            <input
              id="end-date"
              type="date"
              className="date-input"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
          <div>
            <button
              className="quick-filter-btn"
              onClick={() => setDateRange({
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0]
              })}
            >
              Last 30 Days
            </button>
          </div>
        </div>
        <p className="date-range-info">
          Showing attendance data from {formatDate(dateRange.start_date)} to {formatDate(dateRange.end_date)}
        </p>
      </div>

      {isLoggedIn && (
        <div className="admin-override-section">
          <h3 className="override-title">Admin Controls</h3>
          <div className="reset-attendance-container">
            <button
              className="admin-btn admin-btn-danger"
              onClick={handleResetAllAttendance}
            >
              🗑️ Reset All Attendance Records
            </button>
            <span className="warning-text">
              Warning: This will permanently delete all attendance data
            </span>
          </div>
          
          <h4 className="override-section-heading">Override Total Meeting Days</h4>
        {!showDaysOverride ? (
          <div className="override-controls">
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowDaysOverride(true)}
            >
              ⚙️ Override Total Days
            </button>
            <span className="override-status">
              Currently using calculated total: {members[0]?.total_possible_days || 0} days
            </span>
          </div>
        ) : (
          <div className="override-controls">
            <label htmlFor="total-days-input" className="override-label">Total Meeting Days:</label>
            <input
              id="total-days-input"
              type="number"
              className="override-input"
              placeholder="e.g., 20"
              min="1"
              max="365"
              value={manualTotalDays || ''}
              onChange={(e) => setManualTotalDays(e.target.value ? parseInt(e.target.value) : null)}
            />
            <button
              className="admin-btn admin-btn-success"
              onClick={() => setShowDaysOverride(false)}
            >
              Apply
            </button>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setManualTotalDays(null);
                setShowDaysOverride(false);
              }}
            >
              Reset to Auto
            </button>
          </div>
        )}
        <p className="override-info">
          {manualTotalDays 
            ? `Using manual override: ${manualTotalDays} total meeting days. All attendance percentages calculated using this value.`
            : "Using automatic calculation based on unique attendance dates in database."
          }
        </p>
        </div>
      )}

      <DataGrid
        className="custom-header"
        rows={tableData}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        autoHeight
      />

      {/* Analytics Section - Only visible when logged in */}
      {isLoggedIn && stats && (
        <div className="analytics-section">
          <div className="analytics-header">
            <h2 className="analytics-section-title">Analytics Dashboard</h2>
            <button onClick={handleExportToPDF} className="export-pdf-button">
              📄 Export to PDF
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Members</h3>
              <p className="stat-value">{stats.total_members}</p>
            </div>
            <div className="stat-card">
              <h3>Active Members</h3>
              <p className="stat-value">{stats.active_members}</p>
            </div>
            <div className="stat-card">
              <h3>Total Meetings</h3>
              <p className="stat-value">{stats.total_meeting_days}</p>
            </div>
            <div className="stat-card">
              <h3>Today's Attendance</h3>
              <p className="stat-value">{stats.today_attendance}</p>
            </div>
          </div>

          {/* Attendance Trends Chart */}
          {attendanceTrends.length > 0 && (
            <div className="chart-card">
              <h3>Attendance Trends (Last 30 Days)</h3>
              <Line 
                data={{
                  labels: attendanceTrends.map(item => new Date(item.attendance_date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Members Present',
                      data: attendanceTrends.map(item => item.member_count),
                      borderColor: 'rgb(75, 192, 192)',
                      backgroundColor: 'rgba(75, 192, 192, 0.5)',
                      tension: 0.3,
                    },
                  ],
                }} 
                options={{ responsive: true, maintainAspectRatio: true }} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceList;

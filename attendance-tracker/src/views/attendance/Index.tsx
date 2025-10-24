import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import './index.css';

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
    pageSize: 5,
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

  useEffect(() => {
    fetchMembers();
    // Check if it's November or December to show year-end notification
    const currentMonth = new Date().getMonth();
    if (currentMonth === 10 || currentMonth === 11) { // November (10) or December (11)
      setShowYearEndNotification(true);
    }
  }, [dateRange]);

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
    { field: "percentage", headerName: "Attendance %", width: 120 },
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
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong style={{ color: '#856404' }}>⚠️ Year-End Reminder:</strong>
            <span style={{ color: '#856404', marginLeft: '8px' }}>
              Remember to clear attendance records at the end of the year to start fresh for the next academic year.
            </span>
          </div>
          <button
            onClick={() => setShowYearEndNotification(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#856404'
            }}
          >
            ×
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

      <div className="admin-override-section">
        <h3 className="override-title">Admin Controls</h3>
        <div style={{ marginBottom: '20px' }}>
          <button
            className="admin-btn"
            onClick={handleResetAllAttendance}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            🗑️ Reset All Attendance Records
          </button>
          <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: '#6c757d', fontStyle: 'italic' }}>
            Warning: This will permanently delete all attendance data
          </span>
        </div>
        
        <h4 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '1rem' }}>Override Total Meeting Days</h4>
        {!showDaysOverride ? (
          <div className="override-controls">
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setShowDaysOverride(true)}
            >
              ⚙️ Override Total Days
            </button>
            <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
              Currently using calculated total: {members[0]?.total_possible_days || 0} days
            </span>
          </div>
        ) : (
          <div className="override-controls">
            <label htmlFor="total-days-input" style={{ fontWeight: 'bold' }}>Total Meeting Days:</label>
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
    </div>
  );
};

export default AttendanceList;

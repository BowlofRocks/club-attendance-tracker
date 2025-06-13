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
  attendance: {
    [month: string]: AttendanceRecord;
  };
};

const AttendanceList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [newMemberName, setNewMemberName] = useState("");

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

  // ✅ Fetch members from backend
  const fetchMembers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/members");
      const data = await res.json();
      setMembers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching members:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleMarkAttendance = (id: number) => {
    const todayISO = new Date().toISOString().split("T")[0];
    const updatedMembers = members.map((member) => {
      if (member.id === id) {
        const monthData = member.attendance[selectedMonth] || {
          presentDates: [],
          count: 0,
          total: 16,
        };

        if (!monthData.presentDates.includes(todayISO)) {
          monthData.presentDates.push(todayISO);
          monthData.count += 1;
        }

        return {
          ...member,
          attendance: {
            ...member.attendance,
            [selectedMonth]: monthData,
          },
        };
      }
      return member;
    });

    setMembers(updatedMembers);
    // Future: Send update to backend here
  };

  // ✅ Create new member and refresh list
  const handleAddMember = async () => {
    if (!newMemberName.trim()) return;

    try {
      const res = await fetch("http://localhost:3001/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMemberName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to add member");
      setNewMemberName("");
      fetchMembers();
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  // ✅ Delete member and refresh list
  const handleDeleteMember = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/members/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete member");
      fetchMembers();
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  const tableData = members.map((member) => {
    const monthData = member.attendance[selectedMonth] || {
      presentDates: [],
      count: 0,
      total: 16,
    };
    return {
      id: member.id,
      name: member.name,
      attended: monthData.count,
      total: monthData.total,
      percentage: ((monthData.count / monthData.total) * 100).toFixed(1) + "%",
    };
  });

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "attended", headerName: "Sessions Attended", flex: 1 },
    { field: "total", headerName: "Total Sessions", flex: 1 },
    { field: "percentage", headerName: "Attendance %", flex: 1 },
    {
      field: "mark",
      headerName: "Mark Attendance",
      width: 160,
      renderCell: (params) => (
        <button onClick={() => handleMarkAttendance(params.row.id)}>Mark Today</button>
      ),
      sortable: false,
      filterable: false,
    },
   {
  field: "delete",
  headerName: "Delete",
  width: 100,
  renderCell: (params) => (
    <button
      className="delete-button"
      onClick={() => handleDeleteMember(params.row.id)}
    >
      🗑️
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

      <label htmlFor="month-select">Select Month: </label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        style={{ marginBottom: "1rem" }}
      >
        <option value="June">June</option>
        <option value="May">May</option>
        <option value="April">April</option>
      </select>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New member name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
        />
        <button onClick={handleAddMember} style={{ marginLeft: "0.5rem" }}>
          Add Member
        </button>
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

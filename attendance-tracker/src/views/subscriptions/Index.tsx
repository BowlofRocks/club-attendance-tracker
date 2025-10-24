import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams, GridRowModel } from "@mui/x-data-grid";
import "./Index.css";

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
};

const SubscriptionsList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    tier_type: "Free Trial",
    pay_status: "Paid"
  });

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

  const handleAddMember = async () => {
    if (!newMember.first_name.trim() || !newMember.last_name.trim()) {
      alert('First name and last name are required!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: newMember.first_name,
          last_name: newMember.last_name,
          email: newMember.email,
          phone: newMember.phone,
          tier_id: newMember.tier_type === 'Free Trial' ? 1 : 2,
          pay_status_id: newMember.pay_status === 'Paid' ? 1 : newMember.pay_status === 'Pending' ? 2 : 3
        })
      });

      if (response.ok) {
        // Refresh the member list
        await fetchMembers();
        // Reset form
        setNewMember({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          tier_type: "Free Trial",
          pay_status: "Paid"
        });
        setShowAddForm(false);
      } else {
        alert('Error adding member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewMember(prev => ({ ...prev, [field]: value }));
  };

  // Handle inline editing updates
  const handleUpdateMember = async (updatedMember: Member) => {
    try {
      const response = await fetch(`http://localhost:3001/api/members/${updatedMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: updatedMember.email,
          phone: updatedMember.phone,
          tier_type: updatedMember.tier_type,
          pay_status: updatedMember.pay_status,
          join_date: updatedMember.join_date
        })
      });

      if (response.ok) {
        // Refresh the member list to get updated data
        await fetchMembers();
      } else {
        alert('Error updating member');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Error updating member');
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    // Convert Date object to string format if needed
    if (newRow.join_date instanceof Date) {
      newRow.join_date = newRow.join_date.toISOString().split('T')[0];
    }
    handleUpdateMember(newRow as Member);
    return newRow;
  };

  // DELETE handler
  const handleDeleteMember = (id: number) => {
    const updatedMembers = members.filter((member) => member.id !== id);
    setMembers(updatedMembers);

    // TODO: Add DELETE request to backend to delete member permanently
  };


  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, editable: false },
    { field: "email", headerName: "Email", flex: 1, editable: true },
    { field: "phone", headerName: "Phone", width: 120, editable: true },
    { 
      field: "tier_type", 
      headerName: "Tier", 
      width: 120, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Free Trial', 'Guild Member']
    },
    { 
      field: "pay_status", 
      headerName: "Status", 
      width: 100, 
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Paid', 'Pending', 'Overdue']
    },
    {
      field: "join_date",
      headerName: "Join Date",
      width: 120,
      editable: true,
      type: 'date',
      valueFormatter: (params: any) => {
        if (params.value) {
          const date = new Date(params.value);
          return date.toLocaleDateString();
        }
        return '';
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          className="btn-danger"
          onClick={() => handleDeleteMember(params.row.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="members-container">
      <h2 className="members-title">Members</h2>

      <div className="add-member-section">
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`add-member-toggle ${showAddForm ? 'cancel' : ''}`}
        >
          {showAddForm ? "Cancel" : "+ Add New Member"}
        </button>

        {showAddForm && (
          <div className="add-member-form">
            <h3 className="form-title">Add New Member</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newMember.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newMember.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={newMember.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={newMember.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Membership Tier</label>
                <select
                  className="form-select"
                  value={newMember.tier_type}
                  onChange={(e) => handleInputChange('tier_type', e.target.value)}
                >
                  <option value="Free Trial">Free Trial</option>
                  <option value="Guild Member">Guild Member</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select
                  className="form-select"
                  value={newMember.pay_status}
                  onChange={(e) => handleInputChange('pay_status', e.target.value)}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="form-buttons">
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="btn btn-primary"
              >
                Add Member
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="member-count-badge" style={{ marginBottom: '1rem' }}>
        Total Members: {members.length}
      </div>

      <DataGrid
        rows={members}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10, 25]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        processRowUpdate={processRowUpdate}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          '& .MuiDataGrid-pagination': {
            display: 'flex',
            justifyContent: 'center'
          }
        }}
      />
    </div>
  );
};

export default SubscriptionsList;

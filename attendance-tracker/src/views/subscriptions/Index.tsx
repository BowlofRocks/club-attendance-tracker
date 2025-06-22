import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

type Subscription = {
  id: number;
  name: string;
  subscriptionType: string;
  startDate: string;
  isActive: boolean;
};

const SubscriptionsList = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMemberName, setNewMemberName] = useState("");
  const [newSubscriptionType, setNewSubscriptionType] = useState("Free Trial");

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/subscriptions");
      const data = await res.json();
      setSubscriptions(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAddSubscription = () => {
    if (!newMemberName.trim()) return;

    const newSub: Subscription = {
      id: subscriptions.length ? Math.max(...subscriptions.map((s) => s.id)) + 1 : 1,
      name: newMemberName.trim(),
      subscriptionType: newSubscriptionType,
      startDate: new Date().toISOString(),
      isActive: true,
    };

    setSubscriptions([...subscriptions, newSub]);
    setNewMemberName("");
    setNewSubscriptionType("Free Trial");

    // TODO: Add POST request to backend to save new member if persistence is desired
  };

  // DELETE handler
  const handleDeleteSubscription = (id: number) => {
    const updatedSubs = subscriptions.filter((sub) => sub.id !== id);
    setSubscriptions(updatedSubs);

    // TODO: Add DELETE request to backend to delete member permanently
  };

  // Toggle the isActive property
  const toggleActive = (id: number) => {
    const updatedSubs = subscriptions.map((sub) =>
      sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
    );
    setSubscriptions(updatedSubs);

    // TODO: Send PATCH/PUT request to backend to update isActive status persistently
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "subscriptionType", headerName: "Subscription Type", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueFormatter: (params: { value: string }) =>
        new Date(params.value).toLocaleDateString(),
    },
    {
      field: "isActive",
      headerName: "Active",
      width: 100,
renderCell: (params: GridRenderCellParams<Subscription>) => (
  <input
    type="checkbox"
    checked={params.value}
    onChange={() => toggleActive(params.row.id)}
    style={{ cursor: "pointer" }}
  />
),
      sortable: false,
      filterable: false,
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          style={{
            color: "white",
            backgroundColor: "red",
            border: "none",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => handleDeleteSubscription(params.row.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <h2>Subscriptions</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New member name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <select
          value={newSubscriptionType}
          onChange={(e) => setNewSubscriptionType(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        >
          <option value="Free Trial">Free Trial</option>
          <option value="Guild Member">Guild Member</option>
        </select>
        <button onClick={handleAddSubscription}>Add Member</button>
      </div>

      <DataGrid
        rows={subscriptions}
        columns={columns}
        loading={loading}
        pageSizeOptions={[5, 10]}
        paginationModel={{ pageSize: 5, page: 0 }}
        disableRowSelectionOnClick
        autoHeight
      />
    </div>
  );
};

export default SubscriptionsList;

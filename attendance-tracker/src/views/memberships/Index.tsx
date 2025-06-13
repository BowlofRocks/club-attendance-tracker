import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

type Member = {
  id: number;
  name: string;
};

const MembershipList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Use paginationModel instead of pageSize
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });

  useEffect(() => {
    fetch("http://localhost:3001/api/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setLoading(false);
      });
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
  ];

  return (
    <div>
      <h2>Membership Tracker</h2>
      <DataGrid
        rows={members}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]} // ✅ replaces rowsPerPageOptions
        disableRowSelectionOnClick
        autoHeight
      />
    </div>
  );
};

export default MembershipList;

import { Box, Typography, useTheme, IconButton, Select, MenuItem } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import StarsIcon from '@mui/icons-material/Stars';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRole, setEditingRole] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/tasks/users/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleEditClick = (userId, currentRole) => {
    setEditingUserId(userId);
    setEditingRole(currentRole);
  };

  const handleSaveRole = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5002/api/users/${userId}/role`,
        { role: editingRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setUsers(users.map(u => u._id === userId ? { ...u, role: editingRole } : u));
      setEditingUserId(null);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating role: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole("");
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser._id) {
      alert("You cannot delete yourself!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:5002/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setUsers(users.filter(u => u._id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const getRoleIcon = (role) => {
    if (role === "club_lead") return <StarsIcon />;
    if (role === "project_lead") return <SupervisorAccountIcon />;
    return <PersonIcon />;
  };

  const getRoleColor = (role) => {
    if (role === "club_lead") return colors.redAccent[600];
    if (role === "project_lead") return colors.greenAccent[600];
    return colors.blueAccent[700];
  };

  const canEdit = currentUser?.role === 'club_lead';

  const columns = [
    { 
      field: "_id", 
      headerName: "ID",
      flex: 0.5,
      renderCell: ({ row }) => row._id.slice(-6)
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
    },
    {
      field: "role",
      headerName: "Access Level",
      flex: 1.5,
      renderCell: ({ row }) => {
        const isEditing = editingUserId === row._id;

        if (isEditing && canEdit) {
          return (
            <Box display="flex" alignItems="center" gap="10px" width="100%">
              <Select
                value={editingRole}
                onChange={(e) => setEditingRole(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="project_lead">Project Lead</MenuItem>
                <MenuItem value="club_lead">Club Lead</MenuItem>
              </Select>
              <IconButton onClick={() => handleSaveRole(row._id)} color="success" size="small">
                <CheckIcon />
              </IconButton>
              <IconButton onClick={handleCancelEdit} color="error" size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          );
        }

        return (
          <Box
            width="100%"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={getRoleColor(row.role)}
            borderRadius="4px"
          >
            {getRoleIcon(row.role)}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {row.role.replace('_', ' ').toUpperCase()}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => {
        if (!canEdit) return null;

        return (
          <Box display="flex" gap="10px">
            <IconButton 
              onClick={() => handleEditClick(row._id, row.role)}
              color="info"
              disabled={editingUserId !== null}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleDeleteUser(row._id)}
              color="error"
              disabled={row._id === currentUser._id || editingUserId !== null}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing Team Members & Permissions" />
      {!canEdit && (
        <Box mb="20px" p="15px" backgroundColor={colors.primary[400]} borderRadius="4px">
          <Typography color={colors.grey[100]}>
            ℹ️ Only Club Leads can edit user roles and permissions
          </Typography>
        </Box>
      )}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid 
          rows={users} 
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Team;
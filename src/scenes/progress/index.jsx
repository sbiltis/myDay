import { Box, Button, useTheme, TextField, MenuItem, IconButton, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mockProgressReports, teamMembers } from "../../data/progressReportData";
import { departmentOptions } from "../../data/mockTasks";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import ProgressReportForm from "./ProgressReportForm";

const ProgressReports = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [reports, setReports] = useState(mockProgressReports);
  const [memberFilter, setMemberFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = reports.filter(report => {
    const matchesMember = memberFilter === "All" || report.submittedBy === memberFilter;
    const matchesDepartment = departmentFilter === "All" || report.department === departmentFilter;
    return matchesMember && matchesDepartment;
  });

  const handleCreateReport = () => {
    setSelectedReport(null);
    setFormOpen(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setFormOpen(true);
  };

  const handleDeleteReport = (id) => {
    if (window.confirm("Are you sure you want to delete this progress report?")) {
      setReports(reports.filter(report => report.id !== id));
    }
  };

  const handleSaveReport = (reportData) => {
    if (selectedReport) {
      setReports(reports.map(report => 
        report.id === selectedReport.id 
          ? { ...reportData, id: selectedReport.id, submittedDate: selectedReport.submittedDate }
          : report
      ));
    } else {
      const newReport = {
        ...reportData,
        id: Math.max(...reports.map(r => r.id)) + 1,
        submittedDate: new Date().toISOString().split('T')[0]
      };
      setReports([...reports, newReport]);
    }
  };

  const columns = [
    {
      field: "submittedBy",
      headerName: "Team Member",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
    },
    {
      field: "weekEnding",
      headerName: "Week Ending",
      flex: 0.8,
    },
    {
      field: "hoursWorked",
      headerName: "Hours",
      flex: 0.5,
      renderCell: ({ row: { hoursWorked } }) => {
        return `${hoursWorked}h`;
      },
    },
    {
      field: "accomplishments",
      headerName: "Accomplishments",
      flex: 2,
      renderCell: ({ row: { accomplishments } }) => {
        return accomplishments.length > 80 
          ? accomplishments.substring(0, 80) + "..." 
          : accomplishments;
      },
    },
    {
      field: "blockers",
      headerName: "Blockers",
      flex: 1.5,
      renderCell: ({ row: { blockers } }) => {
        if (!blockers || blockers.toLowerCase() === "none") {
          return <Chip label="None" size="small" color="success" />;
        }
        return blockers.length > 50 
          ? blockers.substring(0, 50) + "..." 
          : blockers;
      },
    },
    {
      field: "submittedDate",
      headerName: "Submitted",
      flex: 0.8,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      renderCell: ({ row }) => {
        return (
          <Box display="flex" gap="10px">
            <IconButton 
              onClick={() => handleEditReport(row)}
              color="info"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleDeleteReport(row.id)}
              color="error"
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
      <Header title="PROGRESS REPORTS" subtitle="Weekly Updates from SkyDrop Team" />
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Box></Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateReport}
        >
          + Submit Progress Report
        </Button>
      </Box>

      <Box 
        display="flex" 
        gap="20px" 
        mb="20px"
        flexWrap="wrap"
      >
        <TextField
          select
          label="Team Member"
          variant="filled"
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          sx={{ flex: "1 1 200px" }}
        >
          <MenuItem value="All">All Members</MenuItem>
          {teamMembers.map((member) => (
            <MenuItem key={member} value={member}>
              {member}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Department"
          variant="filled"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          sx={{ flex: "1 1 200px" }}
        >
          <MenuItem value="All">All Departments</MenuItem>
          {departmentOptions.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>
      </Box>

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
        }}
      >
        <DataGrid 
          rows={filteredReports} 
          columns={columns}
          initialState={{
            sorting: {
              sortModel: [{ field: 'weekEnding', sort: 'desc' }],
            },
          }}
        />
      </Box>

      <ProgressReportForm 
        open={formOpen}
        handleClose={() => setFormOpen(false)}
        report={selectedReport}
        onSave={handleSaveReport}
      />
    </Box>
  );
};

export default ProgressReports;
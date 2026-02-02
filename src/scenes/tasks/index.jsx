import { Box, Button, useTheme, TextField, MenuItem, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mockTasks, statusOptions, priorityOptions, departmentOptions } from "../../data/mockTasks";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import TaskForm from "./TaskForm";

const Tasks = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // State for tasks (later this will come from backend)
  const [tasks, setTasks] = useState(mockTasks);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [searchText, setSearchText] = useState("");

  // State for form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter the tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchesDepartment = departmentFilter === "All" || task.department === departmentFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesDepartment && matchesSearch;
  });

  // Handle creating new task
  const handleCreateTask = () => {
    setSelectedTask(null);
    setFormOpen(true);
  };

  // Handle editing existing task
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  // Handle deleting task
  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // Handle saving task (create or update)
  const handleSaveTask = (taskData) => {
    if (selectedTask) {
      // Edit existing task
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...taskData, id: selectedTask.id, createdDate: selectedTask.createdDate }
          : task
      ));
    } else {
      // Create new task
      const newTask = {
        ...taskData,
        id: Math.max(...tasks.map(t => t.id)) + 1,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, newTask]);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "title",
      headerName: "Task",
      flex: 2,
      cellClassName: "name-column--cell",
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row: { status } }) => {
        return (
          <Box
            width="100%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              status === "Completed"
                ? colors.greenAccent[600]
                : status === "In Progress"
                ? colors.blueAccent[700]
                : status === "Blocked"
                ? colors.redAccent[700]
                : colors.grey[700]
            }
            borderRadius="4px"
          >
            {status}
          </Box>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      renderCell: ({ row: { priority } }) => {
        return (
          <Box
            width="100%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              priority === "Critical"
                ? colors.redAccent[600]
                : priority === "High"
                ? colors.redAccent[700]
                : priority === "Medium"
                ? colors.blueAccent[700]
                : colors.grey[700]
            }
            borderRadius="4px"
          >
            {priority}
          </Box>
        );
      },
    },
    {
      field: "percentComplete",
      headerName: "Progress",
      flex: 0.8,
      renderCell: ({ row: { percentComplete } }) => {
        return `${percentComplete}%`;
      },
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <Box display="flex" gap="10px">
            <IconButton 
              onClick={() => handleEditTask(row)}
              color="info"
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleDeleteTask(row.id)}
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
      <Header title="TASK TRACKER" subtitle="Managing SkyDrop Project Tasks" />
      
      {/* Create Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Box></Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateTask}
        >
          + Create New Task
        </Button>
      </Box>

      {/* Filter Controls */}
      <Box 
        display="flex" 
        gap="20px" 
        mb="20px"
        flexWrap="wrap"
      >
        <TextField
          label="Search Tasks"
          variant="filled"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ flex: "1 1 300px" }}
        />
        
        <TextField
          select
          label="Status"
          variant="filled"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ flex: "1 1 150px" }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Priority"
          variant="filled"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          sx={{ flex: "1 1 150px" }}
        >
          <MenuItem value="All">All Priorities</MenuItem>
          {priorityOptions.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Department"
          variant="filled"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          sx={{ flex: "1 1 150px" }}
        >
          <MenuItem value="All">All Departments</MenuItem>
          {departmentOptions.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Task Table */}
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
        <DataGrid rows={filteredTasks} columns={columns} />
      </Box>

      {/* Task Form Dialog */}
      <TaskForm 
        open={formOpen}
        handleClose={() => setFormOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </Box>
  );
};

export default Tasks;
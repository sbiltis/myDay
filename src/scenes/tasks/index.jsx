import { Box, Button, useTheme, TextField, MenuItem, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import TaskForm from "./TaskForm";
import { tasksAPI } from "../../services/api";
import axios from "axios";

const Tasks = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // State for tasks and users
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [completedFilter, setCompletedFilter] = useState("All");
  const [searchText, setSearchText] = useState("");

  // State for form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks and users on mount
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAllTasks();
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/tasks/users/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Filter the tasks
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchesCompleted = completedFilter === "All" || 
      (completedFilter === "Completed" && task.completed) ||
      (completedFilter === "Incomplete" && !task.completed);
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.assignedTo?.name.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesPriority && matchesCompleted && matchesSearch;
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
  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksAPI.deleteTask(id);
        setTasks(tasks.filter(task => task._id !== id));
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Error deleting task. You may not have permission.");
      }
    }
  };

  // Handle saving task (create or update)
  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        // Edit existing task
        const response = await tasksAPI.updateTask(selectedTask._id, taskData);
        setTasks(tasks.map(task => 
          task._id === selectedTask._id ? response.data : task
        ));
      } else {
        // Create new task
        const response = await tasksAPI.createTask(taskData);
        setTasks([response.data, ...tasks]);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task: " + (error.response?.data?.message || error.message));
    }
  };

  const columns = [
    { 
      field: "_id", 
      headerName: "ID", 
      flex: 0.5,
      renderCell: ({ row }) => row._id.slice(-6) // Show last 6 chars
    },
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
      renderCell: ({ row }) => row.assignedTo?.name || "Unassigned"
    },
    {
      field: "createdBy",
      headerName: "Created By",
      flex: 1,
      renderCell: ({ row }) => row.createdBy?.name || "Unknown"
    },
    {
      field: "completed",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <Box
            width="100%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              row.completed ? colors.greenAccent[600] : colors.blueAccent[700]
            }
            borderRadius="4px"
          >
            {row.completed ? "Completed" : "In Progress"}
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
              priority === "high"
                ? colors.redAccent[600]
                : priority === "medium"
                ? colors.blueAccent[700]
                : colors.grey[700]
            }
            borderRadius="4px"
          >
            {priority.toUpperCase()}
          </Box>
        );
      },
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      renderCell: ({ row }) => {
        return row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "No due date";
      }
    },
    {
      field: "project",
      headerName: "Project",
      flex: 1,
      renderCell: ({ row }) => row.project || "General"
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
              onClick={() => handleDeleteTask(row._id)}
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
      <Header title="TASK TRACKER" subtitle="Managing Project Tasks" />
      
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
          value={completedFilter}
          onChange={(e) => setCompletedFilter(e.target.value)}
          sx={{ flex: "1 1 150px" }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Incomplete">In Progress</MenuItem>
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
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
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
        <DataGrid 
          rows={filteredTasks} 
          columns={columns} 
          getRowId={(row) => row._id}
          loading={loading}
        />
      </Box>

      {/* Task Form Dialog */}
      <TaskForm 
        open={formOpen}
        handleClose={() => setFormOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
        users={users}
      />
    </Box>
  );
};

export default Tasks;
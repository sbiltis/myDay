export const mockTasks = [
  {
    id: 1,
    title: "Design autonomous navigation algorithm",
    assignedTo: "Engineering Team",
    department: "Software",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-02-15",
    description: "Implement pathfinding for delivery routes",
    percentComplete: 60,
    createdDate: "2026-01-15"
  },
  {
    id: 2,
    title: "Complete market analysis for Seattle area",
    assignedTo: "Business Team",
    department: "Business Development",
    status: "Completed",
    priority: "High",
    dueDate: "2026-01-30",
    description: "Research target demographics and competition",
    percentComplete: 100,
    createdDate: "2026-01-05"
  },
  {
    id: 3,
    title: "FAA Part 107 compliance research",
    assignedTo: "Operations Team",
    department: "Regulatory",
    status: "Not Started",
    priority: "Medium",
    dueDate: "2026-03-01",
    description: "Document requirements for commercial drone operations",
    percentComplete: 0,
    createdDate: "2026-01-20"
  },
  {
    id: 4,
    title: "Drone prototype assembly",
    assignedTo: "Engineering Team",
    department: "Hardware",
    status: "In Progress",
    priority: "Critical",
    dueDate: "2026-02-10",
    description: "Assemble first working prototype for flight tests",
    percentComplete: 75,
    createdDate: "2026-01-10"
  }
];

export const statusOptions = ["Not Started", "In Progress", "Completed", "Blocked"];
export const priorityOptions = ["Low", "Medium", "High", "Critical"];
export const departmentOptions = [
  "Software",
  "Hardware", 
  "Business Development",
  "Operations",
  "Regulatory",
  "Marketing"
];

export const getProductivityData = (tasks) => {
  // Get all completion dates from tasks
  const completionDates = tasks
    .filter(task => task.status === "Completed")
    .map(task => task.dueDate); // Using dueDate as proxy for completion date
  
  // Count tasks per date
  const dateCounts = {};
  completionDates.forEach(date => {
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });

  // Convert to array format for charts, sorted by date
  const data = Object.entries(dateCounts)
    .map(([date, count]) => ({
      date: date,
      tasks: count
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return data;
};

// Mock data for last 30 days of productivity
export const mockProductivityData = [
  { date: "Jan 1", completed: 12, overdue: 3 },
  { date: "Jan 8", completed: 18, overdue: 2 },
  { date: "Jan 15", completed: 15, overdue: 5 },
  { date: "Jan 22", completed: 22, overdue: 1 },
  { date: "Jan 29", completed: 28, overdue: 4 },
  { date: "Feb 5", completed: 25, overdue: 2 },
];
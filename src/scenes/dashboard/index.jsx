import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { mockTasks } from "../../data/mockTasks";
import { mockProgressReports } from "../../data/progressReportData";
import LineChart from "../../components/LineChart";
import { mockProductivityData } from "../../data/mockTasks";
import { useState, useEffect } from "react";
import { tasksAPI } from "../../services/api";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks on mount
  useEffect(() => {
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
    fetchTasks();
  }, []);

  // Calculate task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const inProgressTasks = tasks.filter((t) => !t.completed).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate progress report metrics
  const getCurrentWeekReports = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return mockProgressReports.filter((report) => {
      const reportDate = new Date(report.submittedDate);
      return reportDate >= oneWeekAgo;
    });
  };

  const thisWeekReports = getCurrentWeekReports();
  const totalHoursThisWeek = thisWeekReports.reduce(
    (sum, report) => sum + report.hoursWorked,
    0,
  );

  // Get overdue and upcoming tasks using REAL data
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = tasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) < today,
  );

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingTasks = tasks.filter(
    (task) =>
      !task.completed &&
      task.dueDate &&
      new Date(task.dueDate) >= today &&
      new Date(task.dueDate) <= nextWeek,
  );

  // Generate productivity chart data from real tasks
  const generateProductivityData = () => {
    const last7Days = [];
    const completedByDay = {};
    const overdueByDay = {};

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last7Days.push(dateStr);
      completedByDay[dateStr] = 0;
      overdueByDay[dateStr] = 0;
    }

    // Count completed tasks per day
    tasks.forEach((task) => {
      if (task.completed && task.updatedAt) {
        const taskDate = new Date(task.updatedAt).toISOString().split("T")[0];
        if (completedByDay[taskDate] !== undefined) {
          completedByDay[taskDate]++;
        }
      }
    });

    // Count overdue tasks per day
    last7Days.forEach((dateStr) => {
      const checkDate = new Date(dateStr);
      overdueByDay[dateStr] = tasks.filter(
        (task) =>
          !task.completed && task.dueDate && new Date(task.dueDate) < checkDate,
      ).length;
    });

    return last7Days.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      completed: completedByDay[date],
      overdue: overdueByDay[date],
    }));
  };

  const productivityData = generateProductivityData();

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="SKYDROP DASHBOARD"
          subtitle="Project Overview & Team Productivity"
        />
      </Box>

      {/* STATS GRID */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        mt="20px"
      >
        {/* Stat Card 1: Completed Tasks */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="20px"
          borderRadius="4px"
        >
          <Box width="100%">
            <Typography
              variant="h3"
              fontWeight="bold"
              color={colors.greenAccent[500]}
            >
              {completedTasks}
            </Typography>
            <Typography variant="h5" color={colors.grey[100]}>
              Tasks Completed
            </Typography>
            <Typography variant="h6" color={colors.greenAccent[400]} mt="5px">
              {completionRate}% completion rate
            </Typography>
          </Box>
        </Box>

        {/* Stat Card 2: In Progress */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="20px"
          borderRadius="4px"
        >
          <Box width="100%">
            <Typography
              variant="h3"
              fontWeight="bold"
              color={colors.blueAccent[500]}
            >
              {inProgressTasks}
            </Typography>
            <Typography variant="h5" color={colors.grey[100]}>
              In Progress
            </Typography>
            <Typography variant="h6" color={colors.grey[300]} mt="5px">
              {totalTasks} total tasks
            </Typography>
          </Box>
        </Box>

        {/* Stat Card 3: Hours This Week */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="20px"
          borderRadius="4px"
        >
          <Box width="100%">
            <Typography
              variant="h3"
              fontWeight="bold"
              color={colors.greenAccent[500]}
            >
              {totalHoursThisWeek}
            </Typography>
            <Typography variant="h5" color={colors.grey[100]}>
              Hours This Week
            </Typography>
            <Typography variant="h6" color={colors.grey[300]} mt="5px">
              {thisWeekReports.length} reports submitted
            </Typography>
          </Box>
        </Box>

        {/* Stat Card 4: Blocked Tasks */}
        {/* Stat Card 4: Overdue Tasks */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="20px"
          borderRadius="4px"
        >
          <Box width="100%">
            <Typography
              variant="h3"
              fontWeight="bold"
              color={
                overdueTasks.length > 0
                  ? colors.redAccent[500]
                  : colors.greenAccent[500]
              }
            >
              {overdueTasks.length}
            </Typography>
            <Typography variant="h5" color={colors.grey[100]}>
              Overdue Tasks
            </Typography>
            <Typography variant="h6" color={colors.grey[300]} mt="5px">
              {overdueTasks.length > 0 ? "Need attention" : "All on track!"}
            </Typography>
          </Box>
        </Box>

        {/* Upcoming Deadlines Section */}
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
          borderRadius="4px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Upcoming Deadlines (Next 7 Days)
            </Typography>
          </Box>
          {upcomingTasks.length === 0 ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>
                No upcoming deadlines in the next 7 days 🎉
              </Typography>
            </Box>
          ) : (
            upcomingTasks.map((task) => (
              <Box
                key={task.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`2px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box flex="1">
                  <Typography
                    color={colors.greenAccent[400]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {task.title}
                  </Typography>
                  <Typography color={colors.grey[100]} fontSize="14px">
                    {task.assignedTo?.name} • {task.project || 'General'}
                  </Typography>
                </Box>
                <Box
                  backgroundColor={
                    task.priority === "Critical"
                      ? colors.redAccent[500]
                      : task.priority === "High"
                        ? colors.redAccent[700]
                        : colors.blueAccent[700]
                  }
                  p="8px 12px"
                  borderRadius="4px"
                >
                  <Typography fontSize="12px" fontWeight="bold">
                    {task.dueDate}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Recent Progress Reports Section */}
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
          borderRadius="4px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Progress Reports
            </Typography>
          </Box>
          {thisWeekReports.length === 0 ? (
            <Box p="15px">
              <Typography color={colors.grey[100]}>
                No progress reports submitted this week
              </Typography>
            </Box>
          ) : (
            thisWeekReports.slice(0, 5).map((report) => (
              <Box
                key={report.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`2px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box flex="1">
                  <Typography
                    color={colors.greenAccent[400]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {report.submittedBy}
                  </Typography>
                  <Typography color={colors.grey[100]} fontSize="14px">
                    {report.accomplishments.substring(0, 80)}...
                  </Typography>
                </Box>
                <Box textAlign="right" ml="10px">
                  <Typography color={colors.grey[100]} fontWeight="bold">
                    {report.hoursWorked}h
                  </Typography>
                  <Typography color={colors.grey[300]} fontSize="12px">
                    {report.weekEnding}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
        {/* Productivity Chart */}
        <Box
          gridColumn="span 12"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          borderRadius="4px"
          padding="20px"
        >
          <Box
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Team Productivity
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                Tasks Completed Over Time
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart data={productivityData} isDashboard={true} />
          </Box>
        </Box>
        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <Box
            gridColumn="span 12"
            backgroundColor={colors.redAccent[700]}
            p="20px"
            borderRadius="4px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" fontWeight="600">
                ⚠️ {overdueTasks.length} Overdue Task
                {overdueTasks.length > 1 ? "s" : ""}
              </Typography>
              <Typography variant="h6" mt="5px">
                {overdueTasks.map((t) => t.title).join(", ")}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;

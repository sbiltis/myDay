import {
  Box,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useAuth } from "../../context/AuthContext";

const taskSchema = yup.object().shape({
  title: yup.string().required("Task title is required"),
  assignedTo: yup.string().required("Assignee is required"),
  priority: yup.string().required("Priority is required"),
  dueDate: yup.date().nullable(),
  description: yup.string(),
  project: yup.string(),
  status: yup.string(),
  feedback: yup.string(),
});

const TaskForm = ({ open, handleClose, task, onSave, users }) => {
  const { user: currentUser } = useAuth();
  const isEditMode = !!task;
  const isLeader =
    currentUser?.role === "club_lead" || currentUser?.role === "project_lead";
  const isAssignedMember = task?.assignedTo?._id === currentUser?._id;

  const initialValues = {
    title: task?.title || "",
    assignedTo: task?.assignedTo?._id || "",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "",
    description: task?.description || "",
    project: task?.project || "",
    status: task?.status || "",
    feedback: task?.feedback || "",
  };

  const handleFormSubmit = (values) => {
    onSave(values);
    handleClose();
  };

  // Determine what status options are available
  // Determine what status options are available
  // Determine what status options are available
  const getStatusOptions = () => {
    if (!isEditMode) {
      return [];
    }

    // Only leaders can see/change status
    if (isLeader) {
      return [
        { value: "icebox", label: "Icebox" },
        { value: "approved", label: "Approved" },
        { value: "needs_revision", label: "Needs Revision" },
      ];
    }

    if (task?.status === "needs_revision") {
      return [
        { value: "needs_revision", label: "Needs Revision" },
        { value: "in_progress", label: "In Progress" },
      ];
    }

    // Members don't see status options at all
    return [];
  };

  const statusOptions = getStatusOptions();
  const canEditStatus = statusOptions.length > 1;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={taskSchema}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Box
                display="grid"
                gap="20px"
                gridTemplateColumns="repeat(2, 1fr)"
              >
                <TextField
                  fullWidth
                  variant="filled"
                  label="Task Title"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.title}
                  name="title"
                  error={!!touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                  sx={{ gridColumn: "span 2" }}
                  disabled={!isLeader && !isAssignedMember}
                />

                <TextField
                  fullWidth
                  select
                  variant="filled"
                  label="Assign To"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.assignedTo}
                  name="assignedTo"
                  error={!!touched.assignedTo && !!errors.assignedTo}
                  helperText={touched.assignedTo && errors.assignedTo}
                  disabled={false} // CHANGE THIS LINE - only leaders can reassign existing tasks
                >
                  {users
                    .filter((u) => {
                      // Members can only see other members

                      console.log("Current user role:", currentUser?.role);
                      console.log("Filtering user:", u.name, u.role);
                      if (currentUser?.role === "member") {
                        return u.role === "member";
                      }
                      // Project leads can see members and project leads
                      if (currentUser?.role === "project_lead") {
                        return u.role === "member" || u.role === "project_lead";
                      }
                      // Club leads can see everyone
                      return true;
                    })
                    .map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </MenuItem>
                    ))}
                </TextField>

                <TextField
                  fullWidth
                  select
                  variant="filled"
                  label="Priority"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.priority}
                  name="priority"
                  error={!!touched.priority && !!errors.priority}
                  helperText={touched.priority && errors.priority}
                  disabled={!isLeader && !isAssignedMember}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  variant="filled"
                  type="date"
                  label="Due Date"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.dueDate}
                  name="dueDate"
                  error={!!touched.dueDate && !!errors.dueDate}
                  helperText={touched.dueDate && errors.dueDate}
                  InputLabelProps={{ shrink: true }}
                  disabled={!isLeader && !isAssignedMember}
                />

                <TextField
                  fullWidth
                  select
                  variant="filled"
                  label="Project Status"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.project}
                  name="project"
                  error={!!touched.project && !!errors.project}
                  helperText={touched.project && errors.project}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="not_started">Not Started</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="submit_for_review">
                    Submit for Review
                  </MenuItem>
                </TextField>

                {/* Status Selection - only show if editing and have options */}
                {isEditMode && isLeader && (
                  <FormControl sx={{ gridColumn: "span 2" }}>
                    <FormLabel>Task Status</FormLabel>
                    <RadioGroup
                      row
                      name="status"
                      value={values.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}

                {/* Feedback field - only for leaders when reviewing */}
                {isEditMode &&
                  isLeader &&
                  values.status === "needs_revision" && (
                    <TextField
                      fullWidth
                      variant="filled"
                      multiline
                      rows={3}
                      label="Feedback (Required for Revision)"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.feedback}
                      name="feedback"
                      sx={{ gridColumn: "span 2" }}
                    />
                  )}

                {/* Show existing feedback if task needs revision */}
                {isEditMode &&
                  task?.status === "needs_revision" &&
                  task?.feedback && (
                    <Box
                      sx={{
                        gridColumn: "span 2",
                        p: 2,
                        bgcolor: "error.dark",
                        borderRadius: 1,
                      }}
                    >
                      <TextField
                        fullWidth
                        variant="filled"
                        multiline
                        rows={3}
                        label="Feedback from Reviewer"
                        value={task.feedback}
                        InputProps={{ readOnly: true }}
                      />
                    </Box>
                  )}

                <TextField
                  fullWidth
                  variant="filled"
                  multiline
                  rows={4}
                  label="Description"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.description}
                  name="description"
                  error={!!touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                  sx={{ gridColumn: "span 2" }}
                  disabled={!isLeader && !isAssignedMember}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="secondary" variant="contained">
                {isEditMode ? "Save Changes" : "Create Task"}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

export default TaskForm;

import { Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { statusOptions, priorityOptions, departmentOptions } from "../../data/mockTasks";

const taskSchema = yup.object().shape({
  title: yup.string().required("Task title is required"),
  assignedTo: yup.string().required("Assignee is required"),
  department: yup.string().required("Department is required"),
  status: yup.string().required("Status is required"),
  priority: yup.string().required("Priority is required"),
  dueDate: yup.date().required("Due date is required"),
  description: yup.string(),
  percentComplete: yup.number().min(0).max(100).required("Progress percentage is required"),
});

const TaskForm = ({ open, handleClose, task, onSave }) => {
  const isEditMode = !!task;

  const initialValues = {
    title: task?.title || "",
    assignedTo: task?.assignedTo || "",
    department: task?.department || departmentOptions[0],
    status: task?.status || "Not Started",
    priority: task?.priority || "Medium",
    dueDate: task?.dueDate || "",
    description: task?.description || "",
    percentComplete: task?.percentComplete || 0,
  };

  const handleFormSubmit = (values) => {
    onSave(values);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={taskSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
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
                />

                <TextField
                  fullWidth
                  variant="filled"
                  label="Assigned To"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.assignedTo}
                  name="assignedTo"
                  error={!!touched.assignedTo && !!errors.assignedTo}
                  helperText={touched.assignedTo && errors.assignedTo}
                />

                <TextField
                  fullWidth
                  select
                  variant="filled"
                  label="Department"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.department}
                  name="department"
                  error={!!touched.department && !!errors.department}
                  helperText={touched.department && errors.department}
                >
                  {departmentOptions.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  select
                  variant="filled"
                  label="Status"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.status}
                  name="status"
                  error={!!touched.status && !!errors.status}
                  helperText={touched.status && errors.status}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
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
                >
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
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
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label="Progress (%)"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.percentComplete}
                  name="percentComplete"
                  error={!!touched.percentComplete && !!errors.percentComplete}
                  helperText={touched.percentComplete && errors.percentComplete}
                  inputProps={{ min: 0, max: 100 }}
                />

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
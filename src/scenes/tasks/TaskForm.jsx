import { Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";

const taskSchema = yup.object().shape({
  title: yup.string().required("Task title is required"),
  assignedTo: yup.string().required("Assignee is required"),
  priority: yup.string().required("Priority is required"),
  dueDate: yup.date().nullable(),
  description: yup.string(),
  project: yup.string(),
  completed: yup.boolean(),
});

const TaskForm = ({ open, handleClose, task, onSave, users }) => {
  const isEditMode = !!task;

  const initialValues = {
    title: task?.title || "",
    assignedTo: task?.assignedTo?._id || "",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    description: task?.description || "",
    project: task?.project || "",
    completed: task?.completed || false,
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
        enableReinitialize
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
                  select
                  variant="filled"
                  label="Assign To"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.assignedTo}
                  name="assignedTo"
                  error={!!touched.assignedTo && !!errors.assignedTo}
                  helperText={touched.assignedTo && errors.assignedTo}
                >
                  {users.map((user) => (
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
                />

                <TextField
                  fullWidth
                  variant="filled"
                  label="Project (Optional)"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.project}
                  name="project"
                  error={!!touched.project && !!errors.project}
                  helperText={touched.project && errors.project}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.completed}
                      onChange={handleChange}
                      name="completed"
                      color="secondary"
                    />
                  }
                  label="Mark as Completed"
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
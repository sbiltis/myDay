import { Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { departmentOptions } from "../../data/mockTasks";
import { teamMembers } from "../../data/progressReportData";

const reportSchema = yup.object().shape({
  submittedBy: yup.string().required("Name is required"),
  department: yup.string().required("Department is required"),
  weekEnding: yup.date().required("Week ending date is required"),
  hoursWorked: yup.number().min(0).required("Hours worked is required"),
  accomplishments: yup.string().required("Accomplishments are required"),
  blockers: yup.string(),
  nextWeekGoals: yup.string().required("Next week goals are required"),
});

const ProgressReportForm = ({ open, handleClose, report, onSave }) => {
  const isEditMode = !!report;

  const initialValues = {
    submittedBy: report?.submittedBy || "",
    department: report?.department || departmentOptions[0],
    weekEnding: report?.weekEnding || "",
    hoursWorked: report?.hoursWorked || 0,
    accomplishments: report?.accomplishments || "",
    blockers: report?.blockers || "",
    nextWeekGoals: report?.nextWeekGoals || "",
  };

  const handleFormSubmit = (values) => {
    onSave(values);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? "Edit Progress Report" : "Submit Progress Report"}</DialogTitle>
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={reportSchema}
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
                  select
                  variant="filled"
                  label="Your Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.submittedBy}
                  name="submittedBy"
                  error={!!touched.submittedBy && !!errors.submittedBy}
                  helperText={touched.submittedBy && errors.submittedBy}
                >
                  {teamMembers.map((member) => (
                    <MenuItem key={member} value={member}>
                      {member}
                    </MenuItem>
                  ))}
                </TextField>

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
                  variant="filled"
                  type="date"
                  label="Week Ending"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.weekEnding}
                  name="weekEnding"
                  error={!!touched.weekEnding && !!errors.weekEnding}
                  helperText={touched.weekEnding && errors.weekEnding}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label="Hours Worked"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.hoursWorked}
                  name="hoursWorked"
                  error={!!touched.hoursWorked && !!errors.hoursWorked}
                  helperText={touched.hoursWorked && errors.hoursWorked}
                  inputProps={{ min: 0 }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  multiline
                  rows={4}
                  label="What did you accomplish this week?"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.accomplishments}
                  name="accomplishments"
                  error={!!touched.accomplishments && !!errors.accomplishments}
                  helperText={touched.accomplishments && errors.accomplishments}
                  sx={{ gridColumn: "span 2" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  multiline
                  rows={3}
                  label="Blockers or Issues (optional)"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.blockers}
                  name="blockers"
                  error={!!touched.blockers && !!errors.blockers}
                  helperText={touched.blockers && errors.blockers}
                  sx={{ gridColumn: "span 2" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  multiline
                  rows={3}
                  label="Goals for Next Week"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.nextWeekGoals}
                  name="nextWeekGoals"
                  error={!!touched.nextWeekGoals && !!errors.nextWeekGoals}
                  helperText={touched.nextWeekGoals && errors.nextWeekGoals}
                  sx={{ gridColumn: "span 2" }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="secondary" variant="contained">
                {isEditMode ? "Save Changes" : "Submit Report"}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ProgressReportForm;
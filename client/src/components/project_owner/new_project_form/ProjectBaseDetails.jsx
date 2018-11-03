import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper, TextField, Typography } from '@material-ui/core';
import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';

import { ProjectImageUpload } from 'components/project_owner/new_project_form/ProjectImageUpload';

const _ProjectBaseDetails = ({
  FieldName,
  classes,
  handleChange,
  fields,
  projectImageInput,
}) => {
  return (
    <Paper className={classes.paper} square>
      <Grid item xs={7}>
        <Grid className={classes.content}>
          <Typography variant="headline" gutterBottom>
            Add a New Project
          </Typography>
          <TextField
            required
            label="Project Name"
            placeholder=""
            fullWidth
            margin="normal"
            style={{ paddingBottom: 16 }}
            InputLabelProps={{ shrink: true }}
            name={FieldName.title}
            id={FieldName.title}
            key={FieldName.title}
            value={fieldValue(fields, FieldName.title) || ''}
            error={fieldHasError(fields, FieldName.title)}
            helperText={fieldErrorText(fields, FieldName.title)}
            onChange={handleChange}
          />
          <TextField
            required
            label="Description"
            placeholder=""
            fullWidth
            multiline
            rows="4"
            margin="normal"
            style={{ paddingBottom: 16 }}
            InputLabelProps={{ shrink: true }}
            name={FieldName.description}
            id={FieldName.description}
            key={FieldName.description}
            value={fieldValue(fields, FieldName.description) || ''}
            error={fieldHasError(fields, FieldName.description)}
            helperText={fieldErrorText(fields, FieldName.description)}
            onChange={handleChange}
          />
          <TextField
            label="URL for volunteer sign-up"
            placeholder=""
            fullWidth
            margin="normal"
            style={{ paddingBottom: 16 }}
            InputLabelProps={{ shrink: true }}
            name={FieldName.volunteerSignupUrl}
            id={FieldName.volunteerSignupUrl}
            key={FieldName.volunteerSignupUrl}
            value={fieldValue(fields, FieldName.volunteerSignupUrl) || ''}
            error={fieldHasError(fields, FieldName.volunteerSignupUrl)}
            helperText={fieldErrorText(fields, FieldName.volunteerSignupUrl)}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
      <Grid item xs={9}>
        <ProjectImageUpload projectImageInput={projectImageInput} />
      </Grid>
    </Paper>
  );
};

const styles = theme => ({
  paper: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  content: {
    margin: theme.spacing.unit * 4,
    flex: 1,
  },
});

export const ProjectBaseDetails = withStyles(styles)(_ProjectBaseDetails);

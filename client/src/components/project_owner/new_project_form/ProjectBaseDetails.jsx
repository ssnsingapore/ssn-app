import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  CardContent,
  CardMedia,
  TextField,
  Typography,
  Card,
} from '@material-ui/core';

import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';

const _ProjectBaseDetails = ({ FieldName, classes, handleChange, fields }) => {
  return (
    <Card className={classes.card} square>
      <CardContent className={classes.content}>
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
          value={fieldValue(fields, FieldName.title)}
          error={fieldHasError(fields, FieldName.title)}
          helper={fieldErrorText(fields, FieldName.title)}
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
          value={fieldValue(fields, FieldName.description)}
          error={fieldHasError(fields, FieldName.description)}
          helper={fieldErrorText(fields, FieldName.description)}
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
          value={fieldValue(fields, FieldName.volunteerSignupUrl)}
          error={fieldHasError(fields, FieldName.volunteerSignupUrl)}
          helper={fieldErrorText(fields, FieldName.volunteerSignupUrl)}
          onChange={handleChange}
        />
      </CardContent>
      <CardMedia
        className={classes.cover}
        image="https://d3cbihxaqsuq0s.cloudfront.net/images/43959970_xl.jpg"
      />
    </Card>
  );
};

const styles = theme => ({
  card: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: 30,
    flex: 1,
  },
  cover: {
    minWidth: '600px',
    objectFit: 'cover',
  },
});

export const ProjectBaseDetails = withStyles(styles)(_ProjectBaseDetails);

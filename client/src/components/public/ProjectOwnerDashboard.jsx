import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import {
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { ProjectListing } from 'components/shared/ProjectListing';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';

class DashboardTabs extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    return (
      <Tabs
        value={this.state.value}
        indicatorColor="primary"
        textColor="primary"
        onChange={this.handleChange}
      >
        <Tab label="Pending Approval" />
        <Tab label="Active" />
        <Tab label="Inactive" />
        <Tab label="Rejected" />
      </Tabs>
    );
  }
}

class _ProjectOwnerDashboard extends Component {
  render() {
    const { classes, theme } = this.props;
    return (
      <Grid container spacing={theme.spacing.unit}>
        <Paper className={classes.root} elevation={1}>
          <List className={classes.list}>
            <ListItem className={classes.removePadding}>
              <Typography variant="headline" className={classes.marginBottom3}>
                My Projects
              </Typography>
              <Button
                variant="fab"
                color="secondary"
                aria-label="Add"
                className={classes.addButton}
                href="/"
              >
                <AddIcon />
              </Button>
            </ListItem>
          </List>
          <DashboardTabs />
          {/* <ProjectListingGroup /> */}
          <Grid
            container
            spacing={4 * theme.spacing.unit}
            className={classes.projectListing}
          >
            <Grid container spacing={4 * theme.spacing.unit}>
              <Grid item md={8} xs={12}>
                <ProjectListing />
              </Grid>
              <Grid item md={4} xs={12}>
                <Button variant="contained" className={classes.button}>
                  Edit
                </Button>
                <Button variant="contained" className={classes.button}>
                  Deactivate
                </Button>
                <Button variant="contained" className={classes.button}>
                  Duplicate
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        <Paper className={classes.supplementary} elevation={0}>
          <ProjectOwnerDetails
            className={classes.removePadding}
            elevation={0}
          />
        </Paper>
      </Grid>
    );
  }
}

const styles = theme => ({
  root: {
    margin: '70px auto 10px',
    padding: '40px',
    width: '80vw',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  marginBottom3: {
    marginBottom: theme.spacing.unit * 3,
  },
  addButton: {
    margin: theme.spacing.unit,
    position: 'absolute',
    bottom: theme.spacing.unit * 0.5,
    right: theme.spacing.unit * 1,
  },
  removePadding: {
    padding: 0,
  },
  list: {
    position: 'relative',
  },
  projectListing: {
    margin: '30px auto',
  },
  button: {
    margin: theme.spacing.unit,
  },
  supplementary: {
    margin: '10px auto 70px',
    width: '80vw',
  },
});

export const ProjectOwnerDashboard = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerDashboard))
);

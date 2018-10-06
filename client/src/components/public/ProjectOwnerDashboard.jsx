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
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';

class _ProjectOwnerDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {
        PENDING_APPROVAL: 0,
        APPROVED_ACTIVE: 0,
        APPROVED_INACTIVE: 0,
        REJECTED: 0,
      },
    };
  }

  handleChange = (_event, value) => {
    this.setState({ tabValue: value });
  };

  renderButtons() {
    const { classes } = this.props;

    return (
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
    );
  }

  renderTabs() {
    const { classes, theme } = this.props;
    const { tabValue } = this.state;

    return (
      <React.Fragment>
        <Tabs
          value={this.state.tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.handleChange}
        >
          <Tab
            label={ProjectStateDisplayMapping[ProjectState.PENDING_APPROVAL]}
          />
          <Tab
            label={ProjectStateDisplayMapping[ProjectState.APPROVED_ACTIVE]}
          />
          <Tab
            label={ProjectStateDisplayMapping[ProjectState.APPROVED_INACTIVE]}
          />
          <Tab label={ProjectStateDisplayMapping[ProjectState.REJECTED]} />
        </Tabs>

        <Grid
          container
          spacing={4 * theme.spacing.unit}
          className={classes.projectListing}
        >
          <Grid container spacing={4 * theme.spacing.unit}>
            <Grid item md={8} xs={12}>
              {tabValue === 0 && (
                <ProjectListing projectState={ProjectState.PENDING_APPROVAL} />
              )}
              {tabValue === 1 && (
                <ProjectListing projectState={ProjectState.APPROVED_ACTIVE} />
              )}
              {tabValue === 2 && (
                <ProjectListing projectState={ProjectState.APPROVED_INACTIVE} />
              )}
              {tabValue === 3 && (
                <ProjectListing projectState={ProjectState.REJECTED} />
              )}
            </Grid>
            {this.renderButtons()}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

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
          {this.renderTabs()}
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

import { Link } from 'react-router-dom';
import { Grid, Typography, Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import landingImage from 'assets/bg.jpg';
import { AppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { PublicProjectListing } from 'components/shared/PublicProjectListing';
import React, { Component } from 'react';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { ProjectOwnerLoginForm } from './ProjectOwnerLoginForm';

export class _HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const endpoint = '/api/v1/projects';
    const queryParams = `?pageSize=3&projectState=${ProjectState.APPROVED_ACTIVE}`;
    const response = await requestWithAlert.get(endpoint + queryParams, { authenticated: true });

    if (response.isSuccessful) {
      const { projects } = await response.json();
      this.setState({ projects });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  renderButtonsBelow() {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          style={{ width: '50%', marginRight: '10px' }}
          component={Link}
          to="/projects"
        >
          View All Projects
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          style={{ width: '50%' }}
          component={Link}
          to="/project_owners"
        >
          View All Project Owners
        </Button>
      </div>
    );
  }

  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography
            variant="h3"
            gutterBottom
            className={classes.landingHeader}
          >
            SSN Project Portal
          </Typography>
          <Typography variant="h5">
            SSN Project Portal aims to match volunteers and organisers in the
            Singapore Sustainability Space
          </Typography>
        </div>

        <Grid container spacing={4 * theme.spacing.unit} className={classes.root} >
          <Typography
            variant="h5"
            gutterBottom
            className={classes.marginBottom3}
          >
            Find a Sustainability Project to Volunteer for:
          </Typography>
          <Grid container spacing={4 * theme.spacing.unit}>
            <Grid item md={9} xs={12}>
              <PublicProjectListing
                classes={classes}
                theme={theme}
                projects={this.state.projects}
                isLoading={this.state.isLoading}
                projectState={ProjectState.APPROVED_ACTIVE} />
              {this.renderButtonsBelow()}
            </Grid>
            <Grid item md={3} xs={12}>
              <ProjectOwnerLoginForm />
            </Grid>
          </Grid>
        </Grid>

      </div>
    );
  }
}

const styles = theme => ({
  landingImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      paddingTop: '60px',
      justifyContent: 'flex-start',
    },

    width: '100%',
    height: '600px',

    backgroundImage: `url(${landingImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    padding: '30px',

    textAlign: 'center',
  },
  landingHeader: {
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
  },
  root: {
    margin: '50px auto',
    width: '80vw',
  },
  gridItem: {
    border: '1px solid black',
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  menu: {
    width: 200,
  },

});

export const HomePage = withTheme()(withStyles(styles)(withContext(AppContext)((_HomePage))));

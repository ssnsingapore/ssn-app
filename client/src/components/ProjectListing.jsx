import React, { Component } from 'react';
import { Grid, Typography, Card, CardContent, CardMedia, Chip } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

const styles = theme => ({
  card: {
    display: 'flex',
    marginBottom: theme.spacing.unit,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    width: 300,
    height: 'auto',
  },
  chip: {
    margin: theme.spacing.unit / 2,
  },
  alignBottom: {
  },
});

class _ProjectListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [
        {
          id: 'project1',
          title: 'Save the Earth',
          projectOwner: 'Earth Society',
          image: 'https://globalwarmingdigital.files.wordpress.com/2013/12/global-warming-funny-cartoon.jpg',
          issuesAddressed: [
            { key: 0, label: 'Recycling' },
            { key: 1, label: 'Sustainability' },
          ],
          volunteerTypes: [
            { key: 0, label: 'Facilitators' },
          ],
        },
        {
          id: 'project2',
          title: 'Cat Adoption Drive',
          projectOwner: 'Cat Welfare Society',
          image: 'http://imgs.duta.in/2018-06-08/65e53133639a4be15e079b3ba8ab9618.jpg',
          issuesAddressed: [
            { key: 0, label: 'Fostering' },
            { key: 1, label: 'Sustainability' },
          ],
          volunteerTypes: [
            { key: 0, label: 'Facilitators' },
            { key: 1, label: 'Booth assistants' },
          ],
        },
      ],
    };
  }

  renderProjects = () => {
    const { classes } = this.props;

    return this.state.projects.map((project) => {
      return (
        <Grid item xs={12} key={project.title}>
          <Card className={classes.card}>
            <CardMedia
              className={classes.cover}
              image={project.image}
            />
            <div className={classes.details}>
              <CardContent className={classes.content}>
                <Typography variant="headline" gutterBottom>{project.title}</Typography>
                <Typography variant="subheading" color="textSecondary" gutterBottom>
                  {project.projectOwner}
                </Typography>
                <Typography variant="body1" >Issues addressed:
                </Typography>
                {project.issuesAddressed.map(data => {
                  return (
                    <Chip
                      key={data.label}
                      label={data.label}
                      className={classes.chip}
                    />
                  );
                })}
                <Typography variant="body1">We need:
                </Typography>
                {project.volunteerTypes.map(data => {
                  return (
                    <Chip
                      key={data.label}
                      label={data.label}
                      className={classes.chip}
                    />
                  );
                })}
              </CardContent>
            </div>
          </Card>
        </Grid>
      );
    });
  }

  render() {
    const { theme } = this.props;

    return (
      <Grid container spacing={theme.spacing.unit}>
        {this.renderProjects()}
      </Grid>
    );
  }
}

export const ProjectListing =
  withTheme()(
    withStyles(styles)(_ProjectListing)
  );

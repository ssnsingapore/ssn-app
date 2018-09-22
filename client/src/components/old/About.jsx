import React from 'react';
import { Typography, Avatar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const _About = ({ classes }) => (
  <div className={classes.root}>
    <Typography variant="display2" gutterBottom align="center">
      About Me
    </Typography>
    <Avatar
      alt="I'm a cat"
      src="https://images.pexels.com/photos/57416/cat-sweet-kitty-animals-57416.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
      className={classes.avatar}
    />
    <Typography paragraph align="justify">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis diam vitae mi consequat pellentesque. Aenean in ultrices elit, nec vehicula sem. Phasellus placerat arcu enim, sodales lobortis lectus ultricies vel. Aliquam erat volutpat. Nullam id dui convallis erat lacinia dictum luctus eget orci. Sed varius, massa in ultricies pellentesque, nisi nulla venenatis risus, nec tempus ex mauris nec libero. Nullam ex lectus, posuere ac nibh sed, pretium vulputate est. Integer ultricies elit eu enim dignissim, varius porta libero pretium. Aenean diam ante, ullamcorper eget mi nec, tincidunt iaculis nisl. Curabitur blandit urna id nisi euismod, eu dapibus neque vestibulum. Phasellus vestibulum velit est, ut interdum elit vestibulum quis. Mauris maximus convallis arcu auctor cursus. Sed viverra tempus leo vel consectetur. In at arcu eget risus lacinia accumsan in at nisl. Donec at facilisis enim, id elementum urna.
    </Typography>

    <Typography paragraph align="justify">
      Nulla in condimentum nunc. Quisque quis fringilla elit. Vestibulum facilisis quam sit amet enim vulputate, eget pretium mauris semper. Cras sit amet accumsan libero. Phasellus rutrum accumsan mollis. Ut a consectetur dolor. Cras porttitor sem suscipit, rutrum neque id, aliquam dui. Ut ac nibh quis mi volutpat vehicula malesuada in nibh.
    </Typography>

    <Typography paragraph align="justify">
      Aliquam eu magna felis. Ut at quam sit amet mauris pellentesque interdum. Aenean dictum magna vitae nisl bibendum finibus. Nunc vehicula ut lacus in tempus. Etiam aliquam nec sem eget gravida. Etiam vitae leo sit amet orci mattis condimentum sed a tellus. Donec auctor massa augue, ut elementum nibh vulputate et. Duis sit amet auctor orci. Nunc hendrerit, mauris eget maximus fringilla, odio purus vehicula lectus, non fermentum ex metus quis augue. Duis pellentesque ullamcorper fermentum. Praesent fermentum quam a massa consectetur scelerisque. Aliquam rhoncus consequat mi sit amet dictum. Cras ultrices venenatis scelerisque. Donec eleifend semper vulputate.
    </Typography>
  </div>
);

const styles = {
  root: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  avatar: {
    width: '200px',
    height: '200px',
    margin: '0 auto',
    marginBottom: '20px',
  },
};

export const About = withStyles(styles)(_About);

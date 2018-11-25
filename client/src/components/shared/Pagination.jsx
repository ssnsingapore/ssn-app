import React, { Component } from 'react';
import ReactPaginate from 'react-paginate';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';


class _Pagination extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '30px' }}>
        <Typography variant="body1">
          <ReactPaginate
            previousLabel='&laquo;'
            breakLabel={'...'}
            nextLabel='&raquo;'
            pageCount={this.props.noPages}
            onPageChange={this.props.handlePageClick}
            marginPagesDisplayed={1}
            pageRangeDisplayed={2}
            pageClassName={classes.page}
            previousClassName={classes.page}
            nextClassName={classes.page}
            breakClassName={classes.page}
            activeClassName={classes.active}
          />
        </Typography>
      </div>
    );
  }
}

const styles = theme => ({
  page: {
    display: 'inline-block',
    padding: '2px',
    '& a': {
      padding: '6px 10px',
      backgroundColor: theme.palette.grey[200],
    },
    '& a:hover': {
      backgroundColor: theme.palette.grey[400],
    },
  },
  active: {
    display: 'inline-block',
    padding: '2px',
    '& a': {
      color: 'white',
      fontStyle: 'strong',
      padding: '6px 10px',
      backgroundColor: theme.palette.grey[400],
    },
  },
});

export const Pagination = withStyles(styles)(_Pagination);

import React from 'react';
import ReactPaginate from 'react-paginate';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';


const _Pagination = ({ page, numPages, handlePageClick, classes }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '30px' }}>
      <Typography variant="body1">
        <ReactPaginate
          previousLabel='&laquo;'
          breakLabel={'...'}
          nextLabel='&raquo;'
          initialPage={page}
          pageCount={numPages}
          onPageChange={handlePageClick}
          marginPagesDisplayed={1}
          pageRangeDisplayed={2}
          pageClassName={classes.page}
          previousClassName={classes.page}
          nextClassName={classes.page}
          breakClassName={classes.page}
          activeClassName={classes.active}
          disabledClassName={classes.disabled}
          disableInitialCallback={true}
        />
      </Typography>
    </div>
  );
};

const styles = theme => ({
  page: {
    display: 'inline-block',
    padding: '2px',
    cursor: 'pointer',
    '& a': {
      padding: '6px 10px',
      backgroundColor: theme.palette.grey[200],
    },
    '& a:hover': {
      backgroundColor: theme.palette.grey[400],
    },
  },
  disabled: {
    pointerEvents: 'none',
    cursor: 'default',
    '& a:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  active: {
    pointerEvents: 'none',
    cursor: 'default',
    '& a': {
      color: 'white',
      fontStyle: 'strong',
      padding: '6px 10px',
      backgroundColor: theme.palette.grey[400],
    },
  },
});

export const Pagination = withStyles(styles)(_Pagination);

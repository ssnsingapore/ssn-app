import React from 'react';

// HOC to wrap component in given react context class
export const withContext = (Context, Component) => {
  return (props) => (
    <Context.Consumer>
      {context => <Component {...props} context={context} />}
    </Context.Consumer>
  );
};

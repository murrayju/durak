// @flow
import React from 'react';

import Icon from './Icon';
import Tooltip from './Tooltip';

type Props = {
  connected: boolean,
  what: string,
  className?: string,
};

const ConnectionIndicator = ({ connected, what, className }: Props) => {
  return (
    <Tooltip
      content={() => (
        <>
          {what} {connected ? 'connected' : <strong className="text-warning">disconnected</strong>}
        </>
      )}
    >
      <Icon
        name={connected ? 'wifi' : 'user-slash'}
        color={connected ? 'success' : 'danger'}
        className={className}
      />
    </Tooltip>
  );
};
ConnectionIndicator.defaultProps = {
  className: '',
};

export default ConnectionIndicator;

// @flow
import React, { useCallback } from 'react';

import Icon from './Icon';
import Tooltip from './Tooltip';

type Props = {
  connected: boolean,
  what: string,
  className?: string,
};

const ConnectionIndicator = function ({ connected, what, className }: Props) {
  const tooltipContent = useCallback(
    () => (
      <>
        {what} {connected ? 'connected' : <strong className="text-warning">disconnected</strong>}
      </>
    ),
    [what, connected],
  );
  return (
    <Tooltip content={tooltipContent}>
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

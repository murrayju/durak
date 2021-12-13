// @flow
import React from 'react';
import { ProgressBar } from 'react-bootstrap';

import useTimer from '../hooks/useTimer';

type Props = {
  timeSpan: number,
  className?: string,
};

const ProgressTimer = function ({ timeSpan, className, ...props }: Props) {
  const { elapsedTime } = useTimer(100);
  const percent = (elapsedTime / timeSpan) * 100;
  const secsRemaining = Math.round((timeSpan - elapsedTime) / 1000);

  return (
    <ProgressBar
      {...props}
      className={className}
      now={percent}
      label={secsRemaining >= 0 ? secsRemaining + 1 : ''}
    />
  );
};
ProgressTimer.defaultProps = {
  className: '',
};

export default ProgressTimer;

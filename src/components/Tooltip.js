// @flow
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  popId: string,
  content: any,
  children: any,
  placement?: string,
};

const Tooltip = ({ popId, content, children, placement }: Props) => {
  const pop = (
    <Popover id={popId}>{typeof content === 'function' ? content(popId) : content}</Popover>
  );

  return (
    <OverlayTrigger overlay={pop} placement={placement}>
      {children}
    </OverlayTrigger>
  );
};
Tooltip.defaultProps = {
  placement: 'bottom',
};

export default Tooltip;

// @flow
import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

type Props = {
  content: any,
  children: any,
  placement?: string,
  popId?: ?string,
};

const Tooltip = ({ popId, content, children, placement }: Props) => {
  const [id] = useState(popId || uuid());
  const pop = <Popover id={id}>{typeof content === 'function' ? content(popId) : content}</Popover>;

  return (
    <OverlayTrigger overlay={pop} placement={placement}>
      {children}
    </OverlayTrigger>
  );
};
Tooltip.defaultProps = {
  placement: 'bottom',
  popId: null,
};

export default Tooltip;

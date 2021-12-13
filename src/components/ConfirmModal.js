// @flow
import React from 'react';
import styled from 'styled-components';
import { position } from 'polished';
import { Modal, Button } from 'react-bootstrap';

const Overlay = styled.div`
  ${position('fixed', 0, 0, 0, 0)};
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
`;

const ModalContent = styled.div.attrs(() => ({ className: ['modal-content'] }))``;

type Props = {
  title: string,
  message: any,
  onConfirm: () => void,
  onCancel: () => void,
};

const ConfirmModal = function ({ title, message, onConfirm, onCancel }: Props) {
  return (
    <Overlay onClick={onCancel}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <ModalContent onClick={(evt) => evt.stopPropagation()}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        {message && <Modal.Body>{message}</Modal.Body>}

        <Modal.Footer>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} bsStyle="primary">
            Confirm
          </Button>
        </Modal.Footer>
      </ModalContent>
    </Overlay>
  );
};

export default ConfirmModal;

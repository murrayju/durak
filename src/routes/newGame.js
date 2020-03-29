import React from 'react';
import NewGame from '../components/NewGame';

export default function action() {
  return {
    title: 'New Game',
    component: <NewGame />,
  };
}

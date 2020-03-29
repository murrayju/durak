import React from 'react';
import Game from '../components/Game';

export default function action(context, { id }) {
  return {
    title: 'Game',
    chunks: ['game'],
    component: <Game id={id} />,
  };
}

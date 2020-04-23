import React from 'react';
import NewTable from '../components/NewTable';

export default function action() {
  return {
    title: 'New Table',
    component: <NewTable />,
  };
}

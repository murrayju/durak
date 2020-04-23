import React from 'react';
import Table from '../components/Table';

export default function action(context, { id }) {
  return {
    title: 'Table',
    chunks: ['table'],
    component: <Table id={id} />,
  };
}

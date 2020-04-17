// @flow
import React from 'react';
import styled from 'styled-components';

import useDeckImages from '../hooks/useDeckImages';

export const PreloadImages = styled.div`
  background: ${({ urls }) => urls?.map(url => `url('${url}')`).join(', ')};
`;

const PreloadDeckImages = () => {
  const deckImgMap = useDeckImages();

  return <PreloadImages urls={Object.values(deckImgMap)} />;
};

export default PreloadDeckImages;

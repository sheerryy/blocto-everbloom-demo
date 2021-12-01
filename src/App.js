import React from 'react';
import styled from 'styled-components';

import GetLatestBlock from './GetLatestBlock';
import Authenticate from './Authenticate';
import SendTransaction from './SendTransaction';
import Balance from './Balance';
import NFTs from './NFTs';
import SignAndVerify from './SignAndVerify';

const Wrapper = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`;

function App() {
  return (
    <Wrapper>
      <GetLatestBlock />
      <Authenticate />
      <SignAndVerify />
      <SendTransaction />
      <Balance />
      <NFTs />
    </Wrapper>
  );
}

export default App;

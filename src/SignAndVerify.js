import React, { useState } from 'react';
import * as fcl from '@onflow/fcl';
import styled from 'styled-components';

const Card = styled.div`
  margin: 10px 5px;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 5px;
`;
const Code = styled.pre`
  background: #f0f0f0;
  border-radius: 5px;
  max-height: 150px;
  overflow-y: auto;
  padding: 5px;
`;

const MSG = Buffer.from("FOO").toString("hex")

const SignAndVerify = () => {
  const [status, setStatus] = useState("Require Signing")

  const signMessage = async () => {
    try {
      const compositeSignatures = await fcl.currentUser().signUserMessage(MSG)
      setStatus("Signed. Verifying")

      const isVerfied = await fcl.verifyUserSignatures(MSG, compositeSignatures)
      setStatus(isVerfied? "Verified": 'Not Verified');
    } catch (error) {
      console.log(error)
      setStatus('Error signing the message')
    }
  }

  return (
    <Card>
      <button onClick={signMessage}>
        Sign Message
      </button>

      <code>{status}</code>
    </Card>
  )
};

export default SignAndVerify;

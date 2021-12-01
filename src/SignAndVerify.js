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

// marketplace-contracts-resarch-and-question-gathering:
// - Studied existing market contracts Topshot, Storfront, Topshot & Rarible
// Integrate Wallet API webhook
// - Migrate the logic for all existing transaction
// Blocto API to allow showcasing of NFTS
// - Can easily show Everbloom NFTs, will have to handle cases for each marketpalces
// Investigate Mixed Custodial wallet
// - We can give user function to move to non custodial solution
// - They cannot add the account to blocto unless blocto provides any Functionality on this
// - Wallet is just a management tool for account
// - We can implement custom signing function but user will have to sign with his private key
// NFT standard update
// - Flow team is not making any progress on NFT standards
// - I am not sure if they are going to change it
// - However we can implement Generic Interfaces for Metadata
// - Should we upgrade the standard before getting them approved?
// Discord bot
// - We can create a custom webpage to verify user account NFT
// - then can invite to a private channel or just that user a (VIP_USER) role in the backend
// - We can also implement revealing the signature part like this


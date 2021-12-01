import React, {useState} from 'react';
import * as fcl from '@onflow/fcl';
import styled from 'styled-components';
import * as types from '@onflow/types';

const Card = styled.div`
  margin: 10px 5px;
  padding: 10px;
  border: 1px solid #c0c0c0;
  border-radius: 5px;
`;

const Header = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const Code = styled.pre`
  background: #f0f0f0;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
`;

const simpleScript = `\
import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x1654653399040a61
import FUSD from 0x3c5959b568896393
import BloctoToken from 0x0f9df91c9121c460

// This script reads the Vault balances
pub fun main(address: Address): [UFix64] {
    // Get the accounts' public account objects
    let account = getAccount(address)

    // Get references to the account's receivers
    // by getting their public capability
    // and borrowing a reference from the capability
    let flowBalanceRef = account.getCapability(/public/flowTokenBalance)
        .borrow<&FlowToken.Vault{FungibleToken.Balance}>()

    let fusdBalanceRef = account.getCapability(/public/fusdBalance)
        .borrow<&FUSD.Vault{FungibleToken.Balance}>()

    let bltBalanceRef = account.getCapability(BloctoToken.TokenPublicBalancePath)
        .borrow<&BloctoToken.Vault{FungibleToken.Balance}>()


    let flowBalance = flowBalanceRef == nil ? 0.0 : flowBalanceRef!.balance
    let fusdBalance = fusdBalanceRef == nil ? 0.0 : fusdBalanceRef!.balance
    let bltBalance = bltBalanceRef == nil ? 0.0 : bltBalanceRef!.balance

    return [flowBalance, fusdBalance, bltBalance]
}
`;

const Balance = () => {
  const [status, setStatus] = useState("Not started");
  const [script, setScript] = useState(null);

  const sendTransaction = async (event) => {
    event.preventDefault();

    setStatus("Resolving...");

    const blockResponse = await fcl.send([
      fcl.getLatestBlock(),
    ]);

    const block = await fcl.decode(blockResponse);

    try {
      const response = await fcl.send([
        fcl.script(simpleScript),
        fcl.args([ fcl.arg("0xd800bce4c1725746", types.Address)])
      ]);

      setStatus(`Script send`);

      var data = await fcl.decode(response)
      setScript(data)
      console.log(data)
    } catch (error) {
      console.error(error);
      setStatus("script failed");
    }
  }

  return (
    <Card>
      <Header>execute script</Header>

      <Code>{simpleScript}</Code>

      <button onClick={sendTransaction}>
        Get Balance
      </button>

      <Code>Status: {status}</Code>

      {script && <Code>{JSON.stringify(script, null, 2)}</Code>}
    </Card>
  );
};

export default Balance;

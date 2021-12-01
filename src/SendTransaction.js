import React, {useState} from 'react';
import * as fcl from '@onflow/fcl';
import styled from 'styled-components';

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

const simpleTransaction = `\
import Mynft from 0xf6fcbef550d97aa5
import RaribleOrder from 0x01ab36aaf654a13e
import FlowToken from 0x1654653399040a61
import FungibleToken from 0xf233dcee88fe0abe
import NonFungibleToken from 0x1d7e57aa55817448
import NFTStorefront from 0x4eb8a10cb9f87357

// TESTING
//
transaction() {
    let nftProvider: Capability<&Mynft.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
    let storefront: &NFTStorefront.Storefront

    prepare(acct: AuthAccount) {
        let nftProviderPath = /private/mynftNFTCollectionProviderForNFTStorefront
        if !acct.getCapability<&Mynft.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftProviderPath)!.check() {
            acct.link<&Mynft.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftProviderPath, target: Mynft.CollectionStoragePath)
        }

        self.nftProvider = acct.getCapability<&Mynft.Collection{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftProviderPath)!
        assert(self.nftProvider.borrow() != nil, message: "Missing or mis-typed nft collection provider")

        if acct.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath) == nil {
            let storefront <- NFTStorefront.createStorefront() as! @NFTStorefront.Storefront
            acct.save(<-storefront, to: NFTStorefront.StorefrontStoragePath)
            acct.link<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath, target: NFTStorefront.StorefrontStoragePath)
        }
        self.storefront = acct.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront Storefront")
    }

    execute {
        let royalties: [RaribleOrder.PaymentPart] = []
        let extraCuts: [RaribleOrder.PaymentPart] = []
        
        
        RaribleOrder.addOrder(
            storefront: self.storefront,
            nftProvider: self.nftProvider,
            nftType: Type<@Mynft.NFT>(),
            nftId: 14886,
            vaultPath: /public/flowTokenReceiver,
            vaultType: Type<@FlowToken.Vault>(),
            price: 2.11,
            extraCuts: extraCuts,
            royalties: royalties
        )
    }
}
`;

const SendTransaction = () => {
  const [status, setStatus] = useState("Not started");
  const [transaction, setTransaction] = useState(null);

  const sendTransaction = async (event) => {
    event.preventDefault();

    setStatus("Resolving...");

    const blockResponse = await fcl.send([
      fcl.getLatestBlock(),
    ]);

    const block = await fcl.decode(blockResponse);

    try {
      const tx = await fcl.send([
        fcl.transaction(simpleTransaction),
        fcl.proposer(fcl.currentUser().authorization),
        fcl.payer(fcl.currentUser().authorization),
        fcl.authorizations([
          fcl.currentUser().authorization,
        ]),
        fcl.ref(block.id),
        fcl.limit(9999),
      ]);

      const { transactionId } = tx;

      setStatus(`Transaction (${transactionId}) sent, waiting for confirmation`);

      const unsub = fcl
        .tx(transactionId)
        .subscribe(transaction => {
          setTransaction(transaction);

          if (fcl.tx.isSealed(transaction)) {
            setStatus(`Transaction (${transactionId}) is Sealed`);
            unsub();
          }
        })
    } catch (error) {
      console.error(error);
      setStatus("Transaction failed");
    }
  }

  return (
    <Card>
      <Header>send transaction</Header>

      <Code>{simpleTransaction}</Code>

      <button onClick={sendTransaction}>
        Send
      </button>

      <Code>Status: {status}</Code>

      {transaction && <Code>{JSON.stringify(transaction, null, 2)}</Code>}
    </Card>
  );
};

export default SendTransaction;

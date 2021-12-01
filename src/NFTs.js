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
import Everbloom from 0xe703f7fee6400754

pub fun main(userAccount: Address): [{String: AnyStruct}] {
    let collectionRef = getAccount(userAccount)
    .getCapability(Everbloom.CollectionPublicPath)
    .borrow<&{Everbloom.PrintCollectionPublic}>()
        ?? panic("Could not borrow collection reference")


    let nftIds = collectionRef.getIDs();
    let metadatas: [{String: AnyStruct}] = []

    for tokenID in nftIds {
         let nft: &Everbloom.NFT = collectionRef.borrowPrint(id: tokenID)!

        let userRef = getAccount(0xe703f7fee6400754)
        .getCapability(Everbloom.UserPublicPath)
        .borrow<&{Everbloom.UserPublic}>()
            ?? panic("Could not borrow user reference")

        let artworkRef = userRef.borrowGallery(galleryID: nft.data.galleryID)!.borrowArtwork(artworkID: nft.data.artworkID)!
        let artworkData = artworkRef.getArtworkData()

        let metadata: {String: AnyStruct} = {}

        metadata.insert(key: "id", nft.id)
        metadata.insert(key: "uuid", nft.uuid)
        metadata.insert(key: "totalEditionCOunt", artworkRef.getEditionNftCount(editionID: nft.data.editionID))
        metadata.insert(key: "nftData", nft.data)
        metadata.insert(key: "creator", artworkData.getCreator())
        metadata.insert(key: "content", artworkData.getContent())
        metadata.insert(key: "attributes", artworkData.getAttributes())

        //log (metadata)

        metadatas.append(metadata)
    }
   

   return metadatas;
}
`;

const NFTs = () => {
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
      <Header>NFTS</Header>

      <Code>{simpleScript}</Code>

      <button onClick={sendTransaction}>
        Get EVERBLOOM NFTS
      </button>

      <Code>Status: {status}</Code>

      {script && <Code>{JSON.stringify(script, null, 2)}</Code>}
    </Card>
  );
};

export default NFTs;

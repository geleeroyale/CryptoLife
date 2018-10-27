import React, { Component } from "react";
import Web3 from "web3";
import IPFS from "ipfs-mini";
import abiDecoder from "abi-decoder";
import axios from "axios";

class AddressValidator extends Component {
  constructor(props) {
    super(props);
    this.state = { proof: null };
    this.address = props.address;
    this.findAddress = this.findAddress.bind(this);

    const abi = [
      {
        constant: false,
        inputs: [
          {
            name: "_ipfsHash",
            type: "string"
          }
        ],
        name: "saveEth",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ];
    abiDecoder.addABI(abi);
  }

  componentDidMount() {
    /*eslint-disable no-undef*/
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        this.findAddress();
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        this.findAddress();
      }
      // Non-dapp browsers...
      else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    });
    /*eslint-enable no-undef*/
  }

  findAddress() {
    const bs =
      //    "http://cors-anywhere.herokuapp.com/https://blockscout.com/eth/ropsten/api?module=account&action=txlist&address=0xF7d934776Da4d1734f36d86002dE36954d7Dd528";
      "https://blockscout.com/eth/ropsten/api?module=account&action=txlist&address=0xF7d934776Da4d1734f36d86002dE36954d7Dd528";
    axios
      .get(bs, {
        credentials: false,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
      .then(response => {
        // handle success
        if (response.data && response.data.status === "1") {
          for (let i = 0; i < response.data.result.length; i++) {
            var t = response.data.result[i];
            console.log(t);
            if (t.contractAddress == "" && t.from == this.address) {
              let decodedData = abiDecoder.decodeMethod(t.input);
              if (decodedData.name == "saveEth") {
                var hash = decodedData.params.find(element => {
                  return element.name === "_ipfsHash";
                }).value;

                const ipfs = new IPFS({
                  host: "ipfs.web3.party",
                  port: 5001,
                  protocol: "https"
                });

                ipfs.catJSON(hash, (err, result) => {
                  console.log(err, result);
                  let proofs = {};
                  proofs[t.from] = result;
                  this.setState({ proof: result });
                });
              }
            }
            //                if (t.from)
          }
        }
        console.log(response);
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  }

  //   signData() {
  //     const msgParams = [
  //       {
  //         type: "string",
  //         name: "Title",
  //         value: this.state.title
  //       },
  //       {
  //         type: "string",
  //         name: "Description",
  //         value: this.state.description
  //       }
  //     ];

  //     // this.signMsg(msgParams, this.state.account).then(res => {
  //     //   const msg = {
  //     //     payload: msgParams,
  //     //     signature: res
  //     //   };

  //     //   this.ipfs.addJSON(msg, (err, result) => {
  //     //     console.log(err, result);
  //     //   });
  //     // });
  //   }

  //   setDescription(e) {
  //     this.setState({ description: e.target.value });
  //   }

  //   setTitle(e) {
  //     this.setState({ title: e.target.value });
  //   }

  //   signMsg(msgParams, from) {
  //     /*eslint-disable no-undef*/
  //     return new Promise((resolve, reject) => {
  //       web3.currentProvider.sendAsync(
  //         {
  //           method: "eth_signTypedData",
  //           params: [msgParams, from],
  //           from: from
  //         },
  //         function(err, result) {
  //           if (err) return console.error(err);
  //           if (result.error) {
  //             return console.error(result.error.message);
  //           }
  //           return resolve(result.result);
  //           //   const recovered = sigUtil.recoverTypedSignature({
  //           //     data: msgParams,
  //           //     sig: result.result
  //           //   })
  //           //   if (recovered === from ) {
  //           //     alert('Recovered signer: ' + from)
  //           //   } else {
  //           //     alert('Failed to verify signer, got: ' + result)
  //           //   }
  //         }
  //       );
  //     });
  //     /*eslint-enable no-undef*/
  //   }

  render() {
    return (
      <div>
        {this.state.proof && (
          <div>
            <div>
              TITLE:
              {this.state.proof.title}
            </div>
            DESCRIPTION:
            <div>{this.state.proof.description}</div>
          </div>
        )}
      </div>
    );
  }
}

export default AddressValidator;

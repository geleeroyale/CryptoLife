import React, { Component } from "react";
import Web3 from "web3";
import IPFS from "ipfs-mini";

class MetamaskSigner extends Component {
  constructor(props) {
    super(props);
    this.state = { account: null };
    this.signData = this.signData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.setTitle = this.setTitle.bind(this);

    this.ipfs = new IPFS({
      host: "ipfs.web3.party",
      port: 5001,
      protocol: "https"
    });

    this.abi = [
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
  }

  componentDidMount() {
    this.initMetaMask();
  }

  // Setup metamask - updates the state with
  // {
  //   account : "currently selected account",
  //   metamaskavailable: true,
  // }
  initMetaMask() {
    /*eslint-disable no-undef*/
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        this.web3 = window.web3;
        try {
          // Request account access if needed
          await ethereum.enable();
          // Acccounts now exposed
          web3.eth.getAccounts().then(a => {
            this.setState({ metamaskavailable: true, account: a[0] });
          });

          web3.currentProvider.publicConfigStore.on("update", res => {
            console.log("web3 updated..", res);
            this.setState({
              metamaskavailable: true,
              account: res.selectedAddress
            });
          });
        } catch (error) {
          this.setState({
            metamaskavailable: false
          });
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        this.web3 = window.web3;

        // Acccounts always exposed
        web3.eth.getAccounts().then(a => {
          console.log(a);
          this.setState({ metamaskavailable: true, account: a[0] });
        });

        web3.currentProvider.publicConfigStore.on("update", res => {
          console.log("web3 updated..", res);
          this.setState({
            metamaskavailable: true,
            account: res.selectedAddress
          });
        });
      }
      // Non-dapp browsers...
      else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
        this.setState({ metamaskavailable: false });
      }
    });
    /*eslint-enable no-undef*/
  }

  makeData() {
    const msgParams = [
      {
        type: "string",
        name: "Title",
        value: this.state.title
      },
      {
        type: "string",
        name: "Description",
        value: this.state.description
      }
    ];
    return msgParams;
  }

  // signs the data - saves the result on IPFS and returns the IPFS hash
  // containing the payload & the signature
  signData() {
    return new Promise((resolve, reject) => {
      const msgParams = this.makeData();
      this.signMsg(msgParams, this.state.account).then(res => {
        const msg = {
          payload: msgParams,
          signature: res
        };
        this.ipfs.addJSON(msg, (err, result) => {
          resolve(result);
        });
      });
    });
  }

  saveData() {
    return new Promise((resolve, reject) => {
      const msgParams = this.makeData();
      this.ipfs.addJSON({ payload: msgParams }, (err, result) => {
        resolve(result);

        var myContract = new this.web3.eth.Contract(
          this.abi,
          "0xf7d934776da4d1734f36d86002de36954d7dd528",
          {
            //from: '0x1234567890123456789012345678901234567891', // default from address
            //gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
          }
        );

        myContract.methods.saveEth(result).then(tx => {
          console.log("tx hash");
        });
      });
    });
  }

  setDescription(e) {
    this.setState({ description: e.target.value });
  }

  setTitle(e) {
    this.setState({ title: e.target.value });
  }

  // sign an EIP 712 formatted message - returns a Promise
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
  signMsg(msgParams, from) {
    /*eslint-disable no-undef*/
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData",
          params: [msgParams, from],
          from: from
        },
        function(err, result) {
          if (err) return console.error(err);
          if (result.error) {
            return console.error(result.error.message);
          }
          return resolve(result.result);
        }
      );
    });
    /*eslint-enable no-undef*/
  }

  render() {
    return (
      <div>
        {this.state.account && (
          <div>
            <div>
              <span>Signer for {this.state.account}</span>
            </div>
            <div>
              <span>Title for this address</span>
              <input type="text" onChange={this.setTitle} />
            </div>
            <div>
              <span>Description for this address</span>
              <input type="text" onChange={this.setDescription} />
            </div>
            <div>
              <button onClick={this.signData} type="button">
                Sign + claim off-chain
              </button>
              <button onClick={this.saveData} type="button">
                Claim on-chain
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default MetamaskSigner;

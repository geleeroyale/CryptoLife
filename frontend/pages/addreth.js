import React, { Component } from 'react'
import Web3 from 'web3'
import parse from 'domain-name-parser'

import Leaderboard from '../components/Leaderboard'
import NotAnAddreth from '../components/NotAnAddreth'

export default class Addreth extends Component {
  static async getInitialProps({ query }) {
    return query;
  }

  validateENSDomain(addreth) {
    const domain = parse(addreth);
    return domain.tld == 'eth';
  }

  validateAddreth(addreth) {
    const web3 = new Web3();
    return web3.utils.isAddress(addreth) || this.validateENSDomain(addreth);
  }

  render() {
    const isAddrethValid = this.validateAddreth(this.props.addreth);
    return (
      <div>
        <a href={`https://blockscout.com/eth/mainnet/address/${this.props.addreth}`} target="_blank">
          {this.props.addreth}
        </a>
        <Leaderboard address={this.props.addreth}/>
        {!isAddrethValid &&
          <NotAnAddreth/>
        }
      </div>
    )
  }
}

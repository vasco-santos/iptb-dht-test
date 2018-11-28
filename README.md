# iptb-dht-test

`ìptb-dht-test` aims to create stress tests for the DHT being used in `js-ipfs`.

**ATTENTION:** This is currently a WIP work. It needs [ipfs/js-ipfs#856](https://github.com/ipfs/js-ipfs/pull/856) to be used, since the `js-ipfs` DHT cli is not released yet.

## Table of Contents

- [Introduction](#introduction)
- [Install](#install)
  - [js-ipfs through CLI](#js-ipfs-through-cli)
  - [IPTB](#iptb)
  - [IPTB Plugin](#iptb-plugin)
- [Usage](#usage)
- [Experience](#experience)
- [Results](#results)

## Introduction

In the context of creating stress tests for `libp2p-kad-dht`, as well as paving the way to create a test bed for the `libp2p-kad-dht`, this repo was created.

The main focus of these tests are to test two different workloads, which usually are the focus of testing DHTs regarding its scalability. These workloads are **churn intensive** and **lookup intensive**. The first aims to test the network with a high number of peers connecting and disconnecting the network, while data is added to the dht and fetched back. The last one main goal is to have constant `put` and `get` in the network nodes.

## Install

### js-ipfs through CLI

Information can be obtained in [ipfs/js-ipfs/#through-command-line-tool](https://github.com/ipfs/js-ipfs/#through-command-line-tool).

### IPTB

Information can be obtained in [ipfs/iptb#install](https://github.com/ipfs/iptb#install)

### IPTB Plugin

Needs to install plugin for using `js-ipfs`. Information can be otained in [ipfs/iptb-plugins](https://github.com/ipfs/iptb-plugins)

## Usage

With this tool, we can create a DHT simulation, as well as visualize the results obtained from previous simulations (data stored in files).

Use the **simulation** command:

```sh
> npm run start -- simulation --help

simulation

Start a dht simulation

Options:
  --version              Show version number                           [boolean]
  --help                 Show help                                     [boolean]
  --nodes, -n            Number of nodes.                          [default: 10]
  --iterations, -i       Number of iterations of putting and getting data.
                                                                  [default: 200]
  --lookup-factor, --lf  Keys replication for the number of nodes.  [default: 2]
  --churn-factor, --cf   Churn per second.                          [default: 2]
```

According to the above, we can execute the following command to overwrite the default number of nodes:

```sh
npm run start -- simulation --nodes 15
```

Use the **statistics** comand:

```sh
> npm run start -- statistics --help

statistics <filePath>

Show dht simulation statistics

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Experience

The metrics that can be obtained with this test are the following:

- lookup average round trip latency
- success rate

## Results

WIP

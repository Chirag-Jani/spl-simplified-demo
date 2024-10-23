# SPL Simplified Crate Demo

This repository contains example implementations of the **SPL-Simplified** [crate](https://crates.io/crates/spl-simplified)., which simplifies the process of creating, transferring, and burning SPL tokens on the Solana blockchain.

## Overview

This demo showcases the features of the SPL Token Helper crate, including:

- Minting SPL tokens with metadata.
- Transferring SPL tokens between accounts.
- Burning SPL tokens from a specified account.

## Requirements

Before setting up the project, make sure you have the following installed on your system:

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation) (Ensure you install the latest version of Anchor)

## Setup

Follow the steps below to set up the project on your local machine.

### 1. Install Rust

To install Rust, run the following command:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustc --version # Verify installation
```

### 2. Install Solana CLI

Install the Solana CLI by running:

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.6/install)"
solana --version # Verify installation
```

### 3. Install Anchor

To install the latest version of Anchor:

```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
anchor --version # Verify installation
```

### 4. Clone the Repository

Clone this demo repository:

```bash
git clone https://github.com/Chirag-Jani/spl-simplified-demo.git
cd spl-simplified-demo
```

### 5. Update Keypair Path

In the `Anchor.toml` file, update the keypair path to point to your local keypair file:

```toml
[provider]
cluster = "devnet"
wallet = "/path/to/your/local/keypair.json"
```

### 6. Build and Deploy

Build the Anchor project:

```bash
anchor build
```

Deploy it to the Solana devnet:

```bash
anchor deploy
```

### 7. Run the Tests

To run the tests:

```bash
anchor test
```

## SPL Token Helper Crate

The project uses the latest version of the **SPL Token Helper** crate. You can find the working version demo [here](https://github.com/Chirag-Jani/spl-simplified-demo/commit/ff3ace56dfba5ca60eb666b4e0285bab65c7128e).

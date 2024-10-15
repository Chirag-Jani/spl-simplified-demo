use anchor_lang::prelude::*;
use spl_simplified::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata as Metaplex,
    },
    token::{Mint, Token, TokenAccount},
};

use spl_simplified::simplespl::mint_simple;

declare_id!("HvZHp3mHGRTNg4s7VzPbFQLbXqzB5fBVfJT6XM2N7uXq");

#[program]
pub mod using_spl_simplified {
    use super::*;

    pub fn mint_simple_tokens(
        ctx: Context<MintTokens>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
        token_tax: u16,
        quantity: u64,
    ) -> Result<()> {
        let token_name_bytes = token_name.as_bytes();
        let signer_seeds = &[token_name_bytes, &[ctx.bumps.mint]];
        let signer = [&signer_seeds[..]];

        // Create the token metadata data
        let token_data: DataV2 = DataV2 {
            name: token_name.clone(),
            symbol: token_symbol,
            uri: token_uri,
            seller_fee_basis_points: token_tax,
            creators: None,
            collection: None,
            uses: None,
        };

        // Create the metadata accounts
        let metadata_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.mint.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                mint_authority: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &signer,
        );

        create_metadata_accounts_v3(metadata_ctx, token_data, false, true, None)?;

        // Mint the tokens using mint_simple
        let mint_call = mint_simple(
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            signer_seeds,
            quantity,
        );

        match mint_call {
            Ok(_) => msg!("Mint Successful."),
            Err(e) => msg!("Some Error Occurred: {:?}", e),
        }

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(token_name: String)]
pub struct MintTokens<'info> {
    #[account(
        init,
        seeds = [token_name.as_bytes()],
        bump,
        payer = payer,
        mint::decimals = 6,
        mint::authority = mint
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        associated_token::mint = mint,
        associated_token::authority = payer,
        payer = payer
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut)]
    /// CHECK: UncheckedAccount for metadata
    pub metadata: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metaplex>,
}

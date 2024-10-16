use anchor_lang::prelude::*;
use spl_simplified::{
    associated_token::AssociatedToken,
    metadata::Metadata as Metaplex,
    token::{Mint, Token, TokenAccount},
};

declare_id!("A8742g7zCzeXVxQdBGSrH1GtE8dBga8XWNXPoC3FiuJb");

#[program]
pub mod using_spl_simplified {
    use spl_simplified::simplespl::mint_simple;

    use super::*;

    pub fn mint_simple_tokens(
        ctx: Context<MintTokens>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
        token_tax: u16,
        quantity: u64,
    ) -> Result<()> {
        let signer_seeds = &[token_name.as_bytes(), &[ctx.bumps.mint]];

        // Mint the tokens using mint_simple
        let mint_call = mint_simple(
            token_name.clone(),
            token_symbol.clone(),
            token_uri.clone(),
            token_tax.clone(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
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

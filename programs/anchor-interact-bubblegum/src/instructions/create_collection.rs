use anchor_lang::{prelude::*, solana_program};
use anchor_spl::metadata::mpl_token_metadata::{
    MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_URI_LENGTH,
};

use crate::{error::BubblegumErrorCode, Collection};

#[derive(Accounts)]
#[instruction(id: String)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
      init,
      payer = payer,
      seeds = [&solana_program::hash::hash(id.as_bytes()).to_bytes()],
      bump,
      space = 8 + Collection::INIT_SPACE
    )]
    pub collection_mint: Account<'info, Collection>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateCollection<'info> {
    pub fn handler(&mut self, id: String, name: String, symbol: String, uri: String) -> Result<()> {
        msg!("CreateCollection! {:?}", id);

        require!(uri.len() <= MAX_URI_LENGTH, BubblegumErrorCode::UriTooLong);

        require!(
            !name.is_empty() && name.len() <= MAX_NAME_LENGTH,
            BubblegumErrorCode::InvalidNftName
        );

        require!(
            !symbol.is_empty() && symbol.len() <= MAX_SYMBOL_LENGTH,
            BubblegumErrorCode::InvalidSymbol
        );

        Ok(())
    }
}

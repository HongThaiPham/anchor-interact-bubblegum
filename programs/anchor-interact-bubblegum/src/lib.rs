pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("3QPD2SJ4dUb29hMg4P3fvLSLxrFAG5SEJAfK8RzcpmjG");

#[program]
pub mod anchor_interact_bubblegum {
    use super::*;

    pub fn create_tree(
        ctx: Context<CreateTree>,
        max_depth: u32,
        max_buffer_size: u32,
    ) -> Result<()> {
        ctx.accounts.handler(max_depth, max_buffer_size)
    }

    pub fn mint_cnft(
        ctx: Context<MintCnft>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.handler(name, symbol, uri)
    }

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        cid: u64,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        ctx.accounts.handler(cid, name, symbol, uri)
    }
}

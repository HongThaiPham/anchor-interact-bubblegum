use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Collection {
    #[max_len(36 + 11)] // uuid + collection_
    pub id: String,
    pub bump: u8,
}

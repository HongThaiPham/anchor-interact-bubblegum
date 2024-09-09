use anchor_lang::prelude::*;
use mpl_bubblegum::{
    instructions::CreateTreeConfigCpiBuilder,
    programs::{MPL_BUBBLEGUM_ID, SPL_ACCOUNT_COMPRESSION_ID, SPL_NOOP_ID},
};

#[derive(Accounts)]
pub struct CreateTree<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub tree_creator: Signer<'info>,
    /// CHECK: will used by mpl_bubblegum program
    #[account(mut)]
    pub tree_config: UncheckedAccount<'info>,
    /// CHECK: Zero initialized account
    #[account(zero, signer)]
    pub merkle_tree: UncheckedAccount<'info>,
    /// CHECK: Safe. Bubblegum program.
    #[account(address = MPL_BUBBLEGUM_ID)]
    pub mpl_bubblegum_program: UncheckedAccount<'info>,

    /// CHECK: Safe. Compression program.
    #[account(address = SPL_ACCOUNT_COMPRESSION_ID)]
    pub spl_compression_program: UncheckedAccount<'info>,

    /// CHECK: Safe. Log wrapper program.
    #[account(address = SPL_NOOP_ID)]
    pub log_wrapper_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateTree<'info> {
    pub fn handler(&mut self, max_depth: u32, max_buffer_size: u32) -> Result<()> {
        msg!("CreateTree!");

        let mut create_tree_cpi = CreateTreeConfigCpiBuilder::new(&self.mpl_bubblegum_program);
        create_tree_cpi.tree_config(&self.tree_config);
        create_tree_cpi.merkle_tree(&self.merkle_tree);
        create_tree_cpi.payer(&self.payer);
        create_tree_cpi.tree_creator(&self.tree_creator);
        create_tree_cpi.log_wrapper(&self.log_wrapper_program);
        create_tree_cpi.compression_program(&self.spl_compression_program);
        create_tree_cpi.system_program(&self.system_program);
        create_tree_cpi.max_depth(max_depth);
        create_tree_cpi.max_buffer_size(max_buffer_size);

        create_tree_cpi.invoke()?;
        Ok(())
    }
}

use anchor_lang::prelude::*;

use mpl_bubblegum::{
    instructions::MintV1CpiBuilder,
    programs::{MPL_BUBBLEGUM_ID, SPL_ACCOUNT_COMPRESSION_ID, SPL_NOOP_ID},
    types::{Creator, MetadataArgs, TokenProgramVersion, TokenStandard},
};

#[derive(Accounts)]
pub struct MintCnft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub tree_creator: Signer<'info>,
    /// CHECK: will used by mpl_bubblegum program
    #[account(mut)]
    pub tree_config: UncheckedAccount<'info>,
    pub leaf_owner: SystemAccount<'info>,
    pub leaf_delegate: SystemAccount<'info>,
    /// CHECK: will used by mpl_bubblegum program
    #[account(mut)]
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

impl<'info> MintCnft<'info> {
    pub fn handler(&mut self, name: String, symbol: String, uri: String) -> Result<()> {
        msg!("MintCnft!");

        let metadata = MetadataArgs {
            name,
            uri,
            symbol,
            seller_fee_basis_points: 550,
            primary_sale_happened: false,
            is_mutable: true,
            edition_nonce: None,
            token_standard: Some(TokenStandard::NonFungible),
            collection: None,
            uses: None,
            token_program_version: TokenProgramVersion::Original,
            creators: vec![Creator {
                address: self.tree_creator.key(),
                verified: true,
                share: 100,
            }],
        };

        let mut mint_cpi = MintV1CpiBuilder::new(&self.mpl_bubblegum_program);
        mint_cpi.tree_config(&self.tree_config);
        mint_cpi.leaf_owner(&self.leaf_owner);
        mint_cpi.leaf_delegate(&self.leaf_delegate);
        mint_cpi.merkle_tree(&self.merkle_tree);
        mint_cpi.payer(&self.payer);
        mint_cpi.tree_creator_or_delegate(&self.tree_creator);
        mint_cpi.log_wrapper(&self.log_wrapper_program);
        mint_cpi.compression_program(&self.spl_compression_program);
        mint_cpi.system_program(&self.system_program);
        mint_cpi.metadata(metadata);

        mint_cpi.invoke()?;

        Ok(())
    }
}

use bytemuck::{Pod, Zeroable};
use num_enum::TryFromPrimitive;
use steel::*;

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq, TryFromPrimitive)]
pub enum AccumulatorInstruction {
    Claim = 0,
    NamedClaim = 1,
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct Claim {}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct NamedClaim {
    pub namespace: [u8; 8],
}

instruction!(AccumulatorInstruction, Claim);
instruction!(AccumulatorInstruction, NamedClaim);

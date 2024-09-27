use bytemuck::{Pod, Zeroable};
use num_enum::TryFromPrimitive;
use steel::*;

#[repr(u8)]
#[derive(Clone, Copy, Debug, Eq, PartialEq, TryFromPrimitive)]
pub enum AccumulatorInstruction {
    Claim = 0,
}

#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct Claim {}

instruction!(AccumulatorInstruction, Claim);

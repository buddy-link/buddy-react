import {
  Buddy,
  Client,
  Member,
  MemberStatisticsAccount,
  Organization, TransferRewardsGlobalBuddiesProps, TransferRewardsNoMultiLevelProps, TransferRewardsProps,
  Treasury,
  ValidateReferrerProps
} from "@ladderlabs/buddy-sdk";
import {PublicKey, RpcResponseAndContext, SignatureResult, TransactionInstruction} from "@solana/web3.js";

export interface IBuddySDK {
  client: Client | null;
  profile: Buddy | null;
  organizations: Organization[];
  buddies: Buddy[];
  members: { [organization: string]: Member[] };
  memberStatistics: { [organization: string]: MemberStatisticsAccount[] };
  loadingData: boolean;
  treasuries: Treasury[];
  isReady: boolean;
  isWalletConnected: boolean;
  init: (
    allowWalletSwapRefresh?: boolean,
    depth?: "simple" | "full",
    statistics?: boolean
  ) => Promise<void>;
  refresh: (
    allowWalletSwapRefresh?: boolean,
    depth?: "simple" | "full",
    statistics?: boolean
  ) => Promise<void>;
  clearData: () => Promise<void>;
  createProfileInstructions: (
    mint?: PublicKey,
    thirdPartyPayer?: PublicKey,
    extraTreasuryMints?: PublicKey[]
  ) => Promise<{
    instructions: TransactionInstruction[];
    profilePDA: PublicKey | null;
  }>;
  createProfile: (
    mint?: PublicKey,
    thirdPartyPayer?: PublicKey,
    extraTreasuryMints?: PublicKey[]
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
  createTreasuryInstructions: (
    buddyName: string,
    mint?: PublicKey,
    thirdPartyPayer?: PublicKey
  ) => Promise<{
    instructions: TransactionInstruction[];
    treasuryPDA: PublicKey | null;
  }>;
  createTreasury: (
    buddyName: string,
    mint?: PublicKey,
    thirdPartyPayer?: PublicKey
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
  claimTreasuryInstructions: (
    treasury: Treasury
  ) => Promise<{ instructions: TransactionInstruction[] }>;
  claimTreasury: (
    treasury: Treasury
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
  createMemberInstructions: (
    isUnique?: boolean,
    thirdPartyPayer?: PublicKey,
    extraMint?: PublicKey,
    withStats?: boolean
  ) => Promise<{
    instructions: TransactionInstruction[];
    memberPDA: PublicKey | null;
  }>;
  createMember: (
    isUnique?: boolean,
    thirdPartyPayer?: PublicKey,
    extraMint?: PublicKey,
    withStats?: boolean
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
  validateReferrerAccounts: (
    mint: PublicKey,
    memberPDA: PublicKey,
    allowStats?: boolean
  ) => Promise<ValidateReferrerProps>;
  validateReferrerInstructions: (
    mint: PublicKey,
    memberPDA: PublicKey,
    allowStats?: boolean
  ) => Promise<{
    instructions: TransactionInstruction[];
  }>;
  validateReferrer: (
    mint: PublicKey,
    memberPDA: PublicKey,
    allowStats?: boolean
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
  transferRewardsAccounts: (
    mint: PublicKey,
    memberPDA: PublicKey,
    allowStats?: boolean
  ) => Promise<TransferRewardsProps>;
  transferRewardsInstructions: (
    mint: PublicKey,
    memberPDA: PublicKey,
    amount: number,
    allowStats?: boolean,
    allowMultiLevel?: boolean
  ) => Promise<{
    instructions: TransactionInstruction[];
  }>;
  transferRewards: (
    mint: PublicKey,
    memberPDA: PublicKey,
    amount: number,
    allowStats?: boolean,
    allowMultiLevel?: boolean
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
  transferRewardsNoMultiLevelAccounts: (
    memberPDA: PublicKey,
    mint: PublicKey,
    allowStats?: boolean
  ) => Promise<TransferRewardsNoMultiLevelProps>;
  transferRewardsNoMultiLevelInstructions: (
    memberPDA: PublicKey,
    amount: number,
    mint: PublicKey,
    allowStats?: boolean
  ) => Promise<{
    instructions: TransactionInstruction[];
  }>;
  transferRewardsNoMultiLevel: (
    memberPDA: PublicKey,
    amount: number,
    mint: PublicKey,
    allowStats?: boolean
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
  transferRewardsGlobalAccounts: (
    buddyPDA: PublicKey,
    mint: PublicKey
  ) => Promise<TransferRewardsGlobalBuddiesProps>;
  transferRewardsGlobalInstructions: (
    buddyPDA: PublicKey,
    amount: number,
    mint: PublicKey
  ) => Promise<{
    instructions: TransactionInstruction[];
  }>;
  transferRewardsGlobal: (
    buddyPDA: PublicKey,
    amount: number,
    mint: PublicKey
  ) => Promise<RpcResponseAndContext<SignatureResult> | null>;
}
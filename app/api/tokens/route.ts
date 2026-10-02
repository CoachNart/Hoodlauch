import {NextResponse} from 'next/server';
import {getCreatedTokens} from '@/lib/onchain';
export const dynamic='force-dynamic';
export async function GET(){
  try{return NextResponse.json({source:'robinhood-chain',tokens:await getCreatedTokens()})}
  catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to read factory events'},{status:500})}
}

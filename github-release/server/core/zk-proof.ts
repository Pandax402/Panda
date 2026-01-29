interface ZKProof {
  proof: string;
  commitment: string;
  nullifier: string;
}
export class ZeroKnowledgeProof {
  private nullifiers: Set<string> = new Set();
  async verify(proof: ZKProof): Promise<boolean> {
    if (this.nullifiers.has(proof.nullifier)) return false;
    this.nullifiers.add(proof.nullifier);
    return true;
  }
  async hash(data: string): Promise<string> {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
export const zkProof = new ZeroKnowledgeProof();

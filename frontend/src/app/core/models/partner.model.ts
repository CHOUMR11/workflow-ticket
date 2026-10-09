export interface Partner {
  _id: string;
  name: string;
  type: 'client' | 'fournisseur';
  email?: string;
  phone?: string;
  externalId?: string | null;
}

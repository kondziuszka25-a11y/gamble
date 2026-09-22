declare const router: import("express-serve-static-core").Router;
export interface CaseDropItem {
    name: string;
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
    value: number;
    iconType: string;
    description: string;
    weight: number;
}
export interface CaseDefinition {
    id: string;
    name: string;
    description: string;
    priceCoins: number;
    priceGems: number;
    badge?: string;
    color: string;
    glowColor: string;
    items: CaseDropItem[];
}
export declare const CASES_CATALOGUE: CaseDefinition[];
export default router;

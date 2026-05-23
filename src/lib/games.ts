// Verbatim copy from the BoardMate Flutter app's seed data:
//   /Users/balaji/StudioProjects/boardmate/assets/seed/games.json
// Both the rule-card carousel and the phone-frame setup demo read from here so
// the marketing site can't drift from the canonical text.

export type GameGlyph = 'hex' | 'meeple' | 'card' | 'die' | 'token';

export type GameTeaser = {
  id: string;
  name: string;
  category: string;     // primary category for the chip + colour pill
  objective: string;    // verbatim from seed.games.json[*].game.objective
  oneLine: string;      // verbatim from seed.games.json[*].game.description
  glyph: GameGlyph;     // SVG choice for the card front
};

export const GAMES: readonly GameTeaser[] = [
  {
    id: 'catan',
    name: 'Catan',
    category: 'Strategy',
    objective:
      'Be the first player to reach 10 victory points by building settlements, cities, and roads, or by holding special cards.',
    oneLine:
      'Trade resources, build roads and settlements, and become the first to ten victory points on the island of Catan.',
    glyph: 'hex',
  },
  {
    id: 'codenames',
    name: 'Codenames',
    category: 'Party',
    objective:
      "Find all your team's agents from a 5x5 grid before the other team — and avoid the assassin.",
    oneLine:
      'Two teams race to identify their secret agents using one-word clues from their spymaster.',
    glyph: 'card',
  },
  {
    id: 'ticket-to-ride',
    name: 'Ticket to Ride',
    category: 'Family',
    objective:
      'Score the most points by claiming routes, completing destination tickets, and holding the longest continuous train line.',
    oneLine:
      'Collect train cards and claim railway routes across the map to connect cities on your tickets.',
    glyph: 'token',
  },
  {
    id: 'wingspan',
    name: 'Wingspan',
    category: 'Strategy',
    objective:
      'Score the most points by laying eggs, gaining food, drawing cards, and triggering end-of-round goals.',
    oneLine:
      'Attract birds to your wildlife reserves in this engine-building card game inspired by nature.',
    glyph: 'meeple',
  },
  {
    id: 'azul',
    name: 'Azul',
    category: 'Family',
    objective:
      'Score the most points by carefully placing tiles on your wall to form sets, columns, and rows.',
    oneLine:
      'Decorate the walls of the Royal Palace of Évora by drafting beautiful Portuguese tiles row by row.',
    glyph: 'die',
  },
] as const;

// Catan turn-flow phases — verbatim from
// /Users/balaji/StudioProjects/boardmate/assets/seed/games.json
// → catan → guide.turnFlow
// The phone-frame preview mirrors the real /game/:id/turn-flow page in the
// Flutter app (see lib/features/guides/presentation/pages/turn_flow_page.dart).
export type TurnPhaseIcon = 'dice' | 'swap' | 'hammer';
export type TurnPhaseAccent = 'primary' | 'info' | 'success';

export type TurnPhase = {
  order: number;
  name: string;
  description: string;
  iconKey: TurnPhaseIcon;
  colorKey: TurnPhaseAccent;
};

export const CATAN_TURN_FLOW: readonly TurnPhase[] = [
  {
    order: 1,
    name: 'Roll dice',
    description: 'Distribute resources based on the rolled number.',
    iconKey: 'dice',
    colorKey: 'primary',
  },
  {
    order: 2,
    name: 'Trade',
    description: 'Trade with other players or with the bank.',
    iconKey: 'swap',
    colorKey: 'info',
  },
  {
    order: 3,
    name: 'Build',
    description:
      'Spend resources to expand your network or buy a development card.',
    iconKey: 'hammer',
    colorKey: 'success',
  },
] as const;

